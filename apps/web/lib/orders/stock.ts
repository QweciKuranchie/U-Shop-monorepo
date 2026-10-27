import { writeClient } from "@repo/sanity/client";
import { releaseStock } from "@repo/sanity/order-stock";
import { ORDER_STATUSES, PAYMENT_GATEWAYS, PAYMENT_STATUSES } from "@/lib/orderStatus";
import { UNPAID_HOLD_MS, planReservation } from "./stockPlan";

// Re-exported so web code has one import for everything stock-related.
export { releaseStock };

/**
 * Stock reservation. SERVER ONLY.
 *
 * Reserve at ORDER CREATION: the order and the stock decrement are written in ONE
 * Sanity transaction, and every product patch is guarded by the revision we read.
 * If two buyers race for the last unit, the loser's transaction is rejected (409),
 * re-reads the now-empty stock and fails with INSUFFICIENT_STOCK: it can never
 * both create the order and oversell.
 *
 * Release (cancel / abandoned checkout) is idempotent: the order's own revision
 * guards the `stockReserved` flip, so stock is returned exactly once.
 */

/** The slice of the Sanity client used here; tests inject an in-memory fake. */
export type StockDb = Pick<typeof writeClient, "fetch" | "transaction" | "patch">;

const MAX_ATTEMPTS = 4;
const isConflict = (e: unknown) =>
  typeof e === "object" && e !== null && (e as { statusCode?: number }).statusCode === 409;

export interface CreatedOrder {
  _id: string;
  orderNumber: string;
  orderStatus?: string;
  paymentMethod?: string;
  totalPrice?: number;
  currency?: string;
}

export type ReserveResult =
  | { ok: true; order: CreatedOrder; created: boolean }
  | { ok: false; code: "PRODUCT_UNAVAILABLE" | "INSUFFICIENT_STOCK" | "STOCK_BUSY"; names: string[] };

const ORDER_PROJECTION = `{ _id, orderNumber, orderStatus, paymentMethod, totalPrice, currency }`;

export async function createOrderReservingStock(
  orderData: Record<string, unknown> & { _id?: string },
  wanted: ReadonlyMap<string, number>,
  actorClerkId: string,
  db: StockDb = writeClient
): Promise<ReserveResult> {
  const ids = [...wanted.keys()];

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // A retried / double-submitted request maps to the same document id: return the
    // order that already exists instead of reserving stock a second time.
    if (orderData._id) {
      const existing = await db.fetch<CreatedOrder | null>(
        `*[_type == "order" && _id == $id][0]${ORDER_PROJECTION}`,
        { id: orderData._id }
      );
      if (existing) return { ok: true, order: existing, created: false };
    }

    const products = await db.fetch<Array<{ _id: string; _rev: string; name?: string; stock?: number }>>(
      `*[_type == "product" && _id in $ids]{ _id, _rev, name, stock }`,
      { ids }
    );
    const plan = planReservation(wanted, products);
    if (!plan.ok) return plan;

    const now = new Date().toISOString();
    const tx = db.transaction();
    for (const u of plan.updates) {
      tx.patch(u.id, (p) => p.ifRevisionId(u.rev).set({ stock: u.after }));
      tx.create({
        _type: "stockMovement",
        product: { _type: "reference", _ref: u.id },
        quantity: -u.quantity,
        reason: "sale",
        stockAfter: u.after,
        actorClerkId,
        createdAt: now,
      });
    }
    tx.create({ ...orderData, _type: "order", stockReserved: true } as Parameters<typeof tx.create>[0]);

    try {
      const docs = await tx.commit({ returnDocuments: true });
      const order = (docs as unknown as Array<CreatedOrder & { _type?: string }>).find((d) => d._type === "order");
      if (!order) throw new Error("Order missing from transaction result");
      return { ok: true, order, created: true };
    } catch (error) {
      if (isConflict(error)) continue; // stock (or the order id) changed under us: re-read and re-decide
      throw error;
    }
  }
  return { ok: false, code: "STOCK_BUSY", names: [] };
}

/**
 * Abandoned card/MoMo checkouts must not hold stock forever. Before anyone tries to
 * buy these products, cancel the unpaid online orders that have sat past the hold
 * window and release their stock. No cron needed: it runs on the next order attempt.
 * (Pay-on-delivery orders keep their stock until cancelled; that is the policy.)
 * If such a customer pays late anyway, markOrderPaid refunds them to the wallet.
 */
export async function releaseExpiredReservations(productIds: readonly string[], db: StockDb = writeClient): Promise<number> {
  if (productIds.length === 0) return 0;
  const cutoff = new Date(Date.now() - UNPAID_HOLD_MS).toISOString();
  const stale = await db.fetch<Array<{ _id: string; _rev: string }>>(
    `*[_type == "order" && stockReserved == true
        && paymentStatus == $unpaid && orderStatus == $pending && paymentGateway == $gateway
        && orderDate < $cutoff && count(items[product._ref in $ids]) > 0][0...20]{ _id, _rev }`,
    {
      unpaid: PAYMENT_STATUSES.PENDING,
      pending: ORDER_STATUSES.PENDING,
      gateway: PAYMENT_GATEWAYS.PAYSTACK,
      cutoff,
      ids: productIds,
    }
  );

  let released = 0;
  for (const o of stale) {
    try {
      // Revision-guarded: if a payment landed since we read it, this is rejected and we skip.
      await db
        .patch(o._id)
        .ifRevisionId(o._rev)
        .set({
          orderStatus: ORDER_STATUSES.CANCELLED,
          cancelledAt: new Date().toISOString(),
          cancelledBy: "system",
          cancellationReason: "Payment was not completed in time",
        })
        .commit();
      await releaseStock(o._id, "system", db);
      released++;
    } catch (error) {
      if (!isConflict(error)) console.error("releaseExpiredReservations failed for", o._id, error);
    }
  }
  return released;
}
