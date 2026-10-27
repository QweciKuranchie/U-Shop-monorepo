import crypto from "node:crypto";
import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { getMyOrders, writeClient } from "@repo/sanity";
import { computeOrderTotals } from "@repo/utils/pricing";
import { checkRateLimitByKey } from "@repo/utils/rate-limit";
import { getAuthUser } from "@/lib/getAuthUser";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/orderStatus";
import { sendOrderStatusNotification } from "@/lib/notificationService";
import { buildOrderData, generateOrderNumber } from "@/lib/orders/buildOrderData";
import { createOrderReservingStock, releaseExpiredReservations } from "@/lib/orders/stock";

/**
 * Order creation is SERVER-AUTHORITATIVE.
 *
 * The client may only say WHICH products/quantities, WHICH address, WHICH
 * payment method and WHICH promo code. Unit prices, discounts, stock, business
 * status, shipping and the final total are all derived here from Sanity. The
 * client's own `totalAmount` is used for exactly one thing: detecting that the
 * price moved since the shopper last saw it (HTTP 409), never as the charge.
 */

const METHODS = [
  PAYMENT_METHODS.CARD,
  PAYMENT_METHODS.MOBILE_MONEY,
  PAYMENT_METHODS.PAY_ON_DELIVERY,
] as const;

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        product: z.object({ _id: z.string().min(1) }),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1)
    .max(50),
  shippingAddress: z.object({ _id: z.string().min(1) }),
  paymentMethod: z.enum(METHODS),
  promoCode: z.string().max(40).nullish(),
  /** What the shopper saw. Compared with the server total; never charged. */
  totalAmount: z.number().finite().nonnegative().optional(),
  /** Per-attempt key so double-clicks / retries cannot create duplicate orders. */
  idempotencyKey: z.string().min(8).max(100).optional(),
});

const PRICE_EPSILON = 0.01;

const validationMessage = (error: z.ZodError): string => {
  switch (error.issues[0]?.path[0]) {
    case "items":
      return "No items provided";
    case "shippingAddress":
      return "Valid shipping address is required";
    case "paymentMethod":
      return "Invalid payment method";
    default:
      return "Invalid request";
  }
};

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuthUser(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const orders = await getMyOrders(userId);
    return NextResponse.json(orders || []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, user } = await getAuthUser(request);
    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await checkRateLimitByKey(userId, "orders:create", { limit: 10, windowMs: 60_000 });
    if (limited) return limited;

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: validationMessage(parsed.error) }, { status: 400 });
    }
    const body = parsed.data;

    // Merge duplicate lines so a split cart can't dodge the per-product stock check.
    const wanted = new Map<string, number>();
    for (const line of body.items) {
      wanted.set(line.product._id, (wanted.get(line.product._id) ?? 0) + line.quantity);
    }
    const productIds = [...wanted.keys()];

    // Abandoned, unpaid card/MoMo orders must not keep stock locked: free any that
    // have expired for these products before we read their stock.
    await releaseExpiredReservations(productIds).catch((e) => console.error("releaseExpiredReservations:", e));

    const clerkEmails = (user.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase());

    // One round-trip, all authoritative, none CDN-cached.
    const [products, sanityUser, address] = await Promise.all([
      writeClient.fetch<Array<{ _id: string; name?: string; price?: number; discount?: number; stock?: number }>>(
        `*[_type == "product" && _id in $ids]{ _id, name, price, discount, stock }`,
        { ids: productIds }
      ),
      writeClient.fetch<{ _id: string; isBusiness?: boolean } | null>(
        `*[_type == "user" && clerkUserId == $userId][0]{ _id, isBusiness }`,
        { userId }
      ),
      writeClient.fetch<{
        _id: string; name?: string; address?: string; city?: string; state?: string;
        zip?: string; phone?: string; email?: string; userRef?: string;
      } | null>(
        `*[_type == "address" && _id == $id][0]{ _id, name, address, city, state, zip, phone, email, "userRef": user._ref }`,
        { id: body.shippingAddress._id }
      ),
    ]);

    // Address must exist AND belong to the caller (previously any address id, and
    // any client-typed address text, was accepted and emailed/stored).
    const ownsAddress =
      !!address &&
      ((!!sanityUser && address.userRef === sanityUser._id) ||
        (!!address.email && clerkEmails.includes(address.email.toLowerCase())));
    if (!address || !ownsAddress) {
      return NextResponse.json({ error: "Valid shipping address is required" }, { status: 400 });
    }

    // Catalogue + stock validation (same rules the client applied, now enforced).
    const byId = new Map(products.map((p) => [p._id, p]));
    const missing: string[] = [];
    const unavailable: string[] = [];
    for (const [id, quantity] of wanted) {
      const product = byId.get(id);
      if (!product) {
        missing.push(id);
      } else if (quantity > (product.stock ?? 0)) {
        unavailable.push(product.name || id);
      }
    }
    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Some items in your cart are no longer available", code: "PRODUCT_UNAVAILABLE" },
        { status: 409 }
      );
    }
    if (unavailable.length > 0) {
      return NextResponse.json(
        { error: `${unavailable.join(", ")} ${unavailable.length > 1 ? "have" : "has"} insufficient stock`, code: "INSUFFICIENT_STOCK" },
        { status: 409 }
      );
    }

    const pricedLines = [...wanted].map(([id, quantity]) => {
      const p = byId.get(id)!;
      return { productId: id, quantity, unitPrice: p.price ?? 0, discount: p.discount ?? 0 };
    });

    const totals = computeOrderTotals({
      lines: pricedLines.map((l) => ({ price: l.unitPrice, discount: l.discount, quantity: l.quantity })),
      isBusiness: sanityUser?.isBusiness === true,
      promoCode: body.promoCode,
      address,
    });

    if (body.totalAmount !== undefined && Math.abs(totals.total - body.totalAmount) > PRICE_EPSILON) {
      return NextResponse.json(
        {
          error: "Prices changed since you added these items. Please review your order total.",
          code: "PRICE_CHANGED",
          total: totals.total,
        },
        { status: 409 }
      );
    }

    const primaryEmail = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? "";
    const orderNumber = generateOrderNumber();

    // Deterministic document id → a retried/double-submitted request maps to the
    // same order. The id covers the canonical request, so changing the cart or
    // address and retrying (same key) correctly yields a NEW order.
    const documentId = body.idempotencyKey
      ? `order-${crypto
          .createHash("sha256")
          .update(
            JSON.stringify([
              userId,
              body.idempotencyKey,
              pricedLines.map((l) => [l.productId, l.quantity]).sort(),
              address._id,
              body.paymentMethod,
              body.promoCode ?? null,
            ])
          )
          .digest("hex")
          .slice(0, 32)}`
      : undefined;

    const orderData = buildOrderData({
      documentId,
      orderNumber,
      customerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      email: primaryEmail,
      phone: user.phoneNumbers?.[0]?.phoneNumber || address.phone || "",
      clerkUserId: userId,
      items: pricedLines,
      shippingAddress: address,
      paymentMethod: body.paymentMethod,
      totalAmount: totals.total,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
    });

    // Reserve stock and create the order in ONE transaction. Two buyers racing for
    // the last unit cannot both succeed (the loser gets INSUFFICIENT_STOCK).
    const reserved = await createOrderReservingStock(
      documentId ? { ...orderData, _id: documentId } : orderData,
      wanted,
      userId
    );
    if (!reserved.ok) {
      if (reserved.code === "PRODUCT_UNAVAILABLE") {
        return NextResponse.json(
          { error: "Some items in your cart are no longer available", code: "PRODUCT_UNAVAILABLE" },
          { status: 409 }
        );
      }
      if (reserved.code === "INSUFFICIENT_STOCK") {
        return NextResponse.json(
          { error: `${reserved.names.join(", ")} ${reserved.names.length > 1 ? "have" : "has"} insufficient stock`, code: "INSUFFICIENT_STOCK" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Lots of people are buying right now. Please try again.", code: "STOCK_BUSY" },
        { status: 409 }
      );
    }
    const createdOrder = reserved.order;
    const isNewOrder = reserved.created;

    if (isNewOrder) {
      // Off the critical path: the shopper no longer waits on a push notification.
      // (The two loopback calls to /api/analytics/track were removed — that route
      // is an empty stub that ignores its body.)
      after(async () => {
        try {
          await sendOrderStatusNotification({
            clerkUserId: userId,
            orderNumber: createdOrder.orderNumber,
            orderId: createdOrder._id,
            status: ORDER_STATUSES.PENDING,
          });
        } catch (error) {
          console.error("Failed to send order confirmation notification:", error);
        }
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.orderStatus,
        paymentMethod: createdOrder.paymentMethod,
        totalPrice: createdOrder.totalPrice,
        currency: createdOrder.currency,
      },
      message: "Order created successfully",
    });
  } catch (error) {
    // Log the detail server-side; never return stack traces to the client.
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
