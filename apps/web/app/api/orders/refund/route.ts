import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { checkRateLimitByKey } from "@repo/utils/rate-limit";
import { getAuthUser } from "@/lib/getAuthUser";
import { PAYMENT_STATUSES } from "@/lib/orderStatus";
import { addWalletCredit } from "@/lib/wallet/walletService";
import { releaseStock } from "@/lib/orders/stock";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * Customer-initiated cancellation.
 *
 * Money rules (the previous version broke all three):
 *  - Only money that was actually PAID is refunded. It used to credit `totalPrice`
 *    to the wallet for any order - including unpaid Pay-on-Delivery orders - which
 *    turned "create order, cancel it" into free wallet balance.
 *  - State is read through `writeClient` (no CDN) so a just-cancelled order cannot
 *    look un-cancelled.
 *  - The credit is idempotent per order, so concurrent or repeated calls can never
 *    refund twice. Credit happens BEFORE the status change: if the status write
 *    fails, a retry re-credits nothing and simply finishes the cancellation.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await getAuthUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await checkRateLimitByKey(userId, "orders:cancel", { limit: 10, windowMs: 60_000 });
    if (limited) return limited;

    const { orderId } = await req.json().catch(() => ({}));
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await writeClient.fetch<{
      _id: string; _rev: string; orderNumber?: string; totalPrice?: number; amountPaid?: number;
      paymentStatus?: string; orderStatus?: string; clerkUserId?: string;
    } | null>(
      `*[_type == "order" && _id == $orderId][0]{ _id, _rev, orderNumber, totalPrice, amountPaid, paymentStatus, orderStatus, clerkUserId }`,
      { orderId }
    );

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.clerkUserId !== userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (order.orderStatus === "cancelled") {
      return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 });
    }
    // Once goods have left the seller, "cancel" would refund a parcel the buyer is
    // about to receive. Those go through support (returns), like the admin flow.
    if (["shipped", "out_for_delivery", "delivered", "completed"].includes(order.orderStatus ?? "")) {
      return NextResponse.json(
        { error: "This order has already shipped. Please contact support to arrange a return." },
        { status: 400 }
      );
    }

    // Refund only what was really paid.
    const refundAmount =
      order.paymentStatus === PAYMENT_STATUSES.PAID ? order.amountPaid || order.totalPrice || 0 : 0;

    if (refundAmount > 0) {
      const credit = await addWalletCredit(
        userId,
        refundAmount,
        `Refund for cancelled order #${order.orderNumber}`,
        order._id,
        "system"
      );
      if (!credit.success) {
        // Do NOT cancel if we could not refund; the customer can safely retry.
        return NextResponse.json({ error: credit.message }, { status: 500 });
      }
    }

    // Revision-guarded: if a payment landed (or the order moved) between our read
    // and this write, Sanity answers 409 instead of cancelling an order whose
    // payment status we have not seen, which would take the money with no refund.
    try {
      await writeClient
        .patch(orderId)
        .ifRevisionId(order._rev)
        .set({ orderStatus: "cancelled", cancelledAt: new Date().toISOString(), cancelledBy: userId })
        .commit();
    } catch (error) {
      if ((error as { statusCode?: number })?.statusCode === 409) {
        return NextResponse.json(
          { error: "Your order just changed. Please refresh and try again." },
          { status: 409 }
        );
      }
      throw error;
    }

    // The order no longer needs its reserved stock (idempotent; best effort so a
    // hiccup here never turns a completed cancellation into an error).
    await releaseStock(orderId, userId).catch((e) => console.error("releaseStock failed for", orderId, e));

    return NextResponse.json(
      {
        success: true,
        message: "Order cancelled successfully",
        refundAmount,
        refundedToWallet: refundAmount > 0,
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
