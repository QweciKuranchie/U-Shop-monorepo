import { writeClient } from "@repo/sanity";
import { sendOrderConfirmationEmail } from "@/lib/emailService";
import { sendOrderStatusNotification } from "@/lib/notificationService";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orderStatus";
import { addWalletCredit } from "@/lib/wallet/walletService";
import { buildOrderConfirmationData, type OrderForEmail } from "@/lib/orders/orderEmail";

export interface PaidCharge {
  reference: string;
  transactionId: string | number;
  amountPesewas: number;
  /** Raw webhook body, stored for audit/reconciliation when available. */
  rawPayload?: string;
}

export interface OrderForPayment extends OrderForEmail {
  _id: string;
  _rev: string;
  paymentStatus?: string | null;
  orderStatus?: string | null;
  totalPrice?: number | null;
  currency?: string | null;
  clerkUserId?: string | null;
}

/** Projection shared by the webhook and the browser callback. */
export const ORDER_FOR_PAYMENT_QUERY = `*[_type == "order" && _id == $orderId][0]{
  _id, _rev, orderNumber, paymentStatus, orderStatus, orderDate,
  customerName, email, totalPrice, currency, subtotal, shipping, tax, clerkUserId,
  items[]{ quantity, price, product->{ name, price, images } },
  shippingAddress->{ name, address, city, state, zip },
  address
}`;

export async function fetchOrderForPayment(orderId: string): Promise<OrderForPayment | null> {
  // writeClient is useCdn:false → always reads the latest committed state.
  return writeClient.fetch<OrderForPayment | null>(ORDER_FOR_PAYMENT_QUERY, { orderId });
}

function isRevisionConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { statusCode?: number }).statusCode === 409
  );
}

/**
 * Atomically move an order to "paid". Exactly ONE caller ever gets
 * `transitioned: true` per order, no matter how the Paystack webhook, the
 * browser callback and Paystack retries interleave.
 *
 * How: the patch is guarded by `ifRevisionId`. If another writer changed the
 * document between our read and our write, Sanity rejects with 409; we re-read
 * and, if the order is now paid, report `transitioned: false`.
 *
 * Why it matters: the old code had the callback mark the order paid first
 * ("best effort"), after which the webhook's idempotency check saw "paid" and
 * skipped the confirmation email and push notification — so in the common case
 * (browser redirect beats the webhook) customers never got either.
 */
export async function markOrderPaid(
  orderId: string,
  charge: PaidCharge
): Promise<{ transitioned: boolean }> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const current = await writeClient.fetch<{ _rev: string; paymentStatus?: string; orderStatus?: string; clerkUserId?: string; orderNumber?: string } | null>(
      `*[_type == "order" && _id == $orderId][0]{ _rev, paymentStatus, orderStatus, clerkUserId, orderNumber }`,
      { orderId }
    );
    if (!current) return { transitioned: false };
    if (current.paymentStatus === PAYMENT_STATUSES.PAID) return { transitioned: false };

    // The customer cancelled while a payment was in flight. Record the money but
    // do NOT reopen the order or fire "paid" side effects: flag it for a refund.
    if (current.orderStatus === ORDER_STATUSES.CANCELLED) {
      console.error("Payment received for a CANCELLED order; refund required", { orderId, ...charge, rawPayload: undefined });
      try {
        await writeClient
          .patch(orderId)
          .ifRevisionId(current._rev)
          .set({
            paymentStatus: PAYMENT_STATUSES.PAID,
            paystackReference: charge.reference,
            paystackTransactionId: String(charge.transactionId),
            amountPaid: charge.amountPesewas / 100,
            paidAt: new Date().toISOString(),
            refundRequired: true,
          })
          .commit();
        // Give the money back right away (idempotent per order). If that fails the
        // `refundRequired` flag above is the reconciliation trail.
        if (current.clerkUserId) {
          const credit = await addWalletCredit(
            current.clerkUserId,
            charge.amountPesewas / 100,
            `Refund: payment received after order #${current.orderNumber ?? orderId} was cancelled`,
            orderId,
            "system"
          );
          if (credit.success) {
            await writeClient.patch(orderId).set({ refundRequired: false }).commit().catch(() => undefined);
          } else {
            console.error("Auto-refund to wallet failed; manual refund required", { orderId, message: credit.message });
          }
        }
        return { transitioned: false };
      } catch (error) {
        if (isRevisionConflict(error)) continue;
        throw error;
      }
    }

    try {
      await writeClient
        .patch(orderId)
        .ifRevisionId(current._rev)
        .set({
          paymentStatus: PAYMENT_STATUSES.PAID,
          orderStatus: ORDER_STATUSES.PROCESSING,
          paystackReference: charge.reference,
          paystackTransactionId: String(charge.transactionId),
          amountPaid: charge.amountPesewas / 100,
          paidAt: new Date().toISOString(),
          ...(charge.rawPayload ? { paystackMetadata: charge.rawPayload } : {}),
        })
        .commit();
      return { transitioned: true };
    } catch (error) {
      if (isRevisionConflict(error)) continue; // someone else wrote; re-read and decide
      throw error;
    }
  }
  throw new Error(`markOrderPaid: gave up after repeated revision conflicts for ${orderId}`);
}

/**
 * Confirmation email + in-app/push notification. Call only when
 * `markOrderPaid` reported `transitioned: true`, ideally inside `after()` so it
 * never delays the HTTP response. Each effect is isolated: one failing never
 * blocks the other.
 */
export async function runPaidSideEffects(order: OrderForPayment): Promise<void> {
  await Promise.allSettled([
    (async () => {
      try {
        await sendOrderConfirmationEmail(buildOrderConfirmationData(order));
      } catch (error) {
        console.error("Paid-order confirmation email failed:", error);
      }
    })(),
    (async () => {
      try {
        if (order.clerkUserId) {
          await sendOrderStatusNotification({
            clerkUserId: order.clerkUserId,
            orderNumber: order.orderNumber ?? "",
            orderId: order._id,
            status: ORDER_STATUSES.PROCESSING,
            previousStatus: ORDER_STATUSES.PENDING,
          });
        }
      } catch (error) {
        console.error("Paid-order notification failed:", error);
      }
    })(),
  ]);
}
