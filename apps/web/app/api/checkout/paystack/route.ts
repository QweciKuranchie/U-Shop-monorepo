import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { checkRateLimitByKey } from "@repo/utils/rate-limit";
import { getAuthUser } from "@/lib/getAuthUser";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orderStatus";
import { toPesewas } from "@/lib/payments/chargeVerification";
import { generatePaystackReference, validateMomoPhone } from "@/lib/validators";

/**
 * Initialise a Paystack transaction for an EXISTING order.
 *
 * The amount charged is always `order.totalPrice` read from Sanity. The previous
 * version charged whatever `amount` the browser posted and never checked that the
 * order belonged to the caller, so a shopper could (a) pay GHS 1 for any order
 * and (b) attach a payment to someone else's order id.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, user } = await getAuthUser(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await checkRateLimitByKey(userId, "paystack:init", { limit: 10, windowMs: 60_000 });
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const { orderId, channel, phone } = (body ?? {}) as {
      orderId?: string;
      channel?: string;
      phone?: string;
    };
    // `amount`, `email` and `orderNumber` in the body are intentionally ignored.

    if (!orderId || !channel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (channel !== "card" && channel !== "momo") {
      return NextResponse.json({ error: "Invalid payment channel" }, { status: 400 });
    }
    if (channel === "momo") {
      if (!phone) {
        return NextResponse.json({ error: "Phone number is required for Mobile Money" }, { status: 400 });
      }
      if (!validateMomoPhone(phone)) {
        return NextResponse.json({ error: "Invalid Mobile Money phone number" }, { status: 400 });
      }
    }

    const order = await writeClient.fetch<{
      _id: string; orderNumber: string; totalPrice?: number; currency?: string;
      paymentStatus?: string; orderStatus?: string; clerkUserId?: string; email?: string;
    } | null>(
      `*[_type == "order" && _id == $orderId][0]{ _id, orderNumber, totalPrice, currency, paymentStatus, orderStatus, clerkUserId, email }`,
      { orderId }
    );

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.clerkUserId !== userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (order.paymentStatus === PAYMENT_STATUSES.PAID) {
      return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    }
    if (order.orderStatus === ORDER_STATUSES.CANCELLED) {
      return NextResponse.json({ error: "Order is cancelled" }, { status: 400 });
    }

    const amountInPesewas = toPesewas(order.totalPrice ?? 0);
    if (amountInPesewas <= 0) {
      return NextResponse.json({ error: "Order total is invalid" }, { status: 400 });
    }

    const email = order.email || user?.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "A valid email is required to pay" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.warn("PAYSTACK_SECRET_KEY is not configured. Running in mock payment mode.");
      const mockRef = generatePaystackReference(order.orderNumber);
      return NextResponse.json({
        authorizationUrl: `${baseUrl}/api/checkout/paystack/callback?reference=${encodeURIComponent(mockRef)}&orderId=${encodeURIComponent(order._id)}&mock=true`,
        reference: mockRef,
        accessCode: "mock_dev_access_code",
      });
    }
    const paystackPayload: Record<string, unknown> = {
      email,
      amount: amountInPesewas,
      currency: "GHS",
      reference: generatePaystackReference(order.orderNumber),
      callback_url: `${baseUrl}/api/checkout/paystack/callback`,
      channels: channel === "card" ? ["card"] : ["mobile_money"],
      // Metadata is set here, server-side, from the verified order — the browser
      // cannot influence which order a payment is attached to.
      metadata: { orderId: order._id, orderNumber: order.orderNumber, channel },
    };
    if (channel === "momo" && phone) {
      paystackPayload.mobile_money = { phone };
    }

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(paystackPayload),
      signal: AbortSignal.timeout(15_000), // never hang a request on the gateway
    });
    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error("Paystack initialization failed:", paystackData);
      return NextResponse.json(
        { error: paystackData.message || "Failed to initialize Paystack transaction" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorizationUrl: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      accessCode: paystackData.data.access_code,
    });
  } catch (error: unknown) {
    console.error("Error in /api/checkout/paystack:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
