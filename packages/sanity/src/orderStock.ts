import { writeClient } from "./client";

/** The slice of the Sanity client used here; tests inject an in-memory fake. */
export type OrderStockDb = Pick<typeof writeClient, "fetch" | "transaction">;

/**
 * Give an order's RESERVED stock back. Shared by the web and admin apps so every
 * cancellation path releases stock the same way. Idempotent: the order's own
 * revision guards the `stockReserved` flip, so stock is returned exactly once no
 * matter how many cancel paths run or retry.
 */
const MAX_ATTEMPTS = 4;
const isConflict = (e: unknown) =>
  typeof e === "object" && e !== null && (e as { statusCode?: number }).statusCode === 409;

export async function releaseStock(
  orderId: string,
  actor = "system",
  db: OrderStockDb = writeClient
): Promise<{ released: boolean }> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const order = await db.fetch<{
      _id: string;
      _rev: string;
      stockReserved?: boolean;
      items?: Array<{ quantity?: number; productId?: string }>;
    } | null>(
      `*[_type == "order" && _id == $id][0]{ _id, _rev, stockReserved, items[]{ quantity, "productId": product._ref } }`,
      { id: orderId }
    );
    if (!order || !order.stockReserved) return { released: false };

    const wanted = new Map<string, number>();
    for (const item of order.items ?? []) {
      const qty = Number(item.quantity);
      if (!item.productId || !Number.isInteger(qty) || qty < 1) continue;
      wanted.set(item.productId, (wanted.get(item.productId) ?? 0) + qty);
    }
    // Skip products deleted since (a patch on a missing doc would fail the whole transaction).
    const existing = new Set(
      await db.fetch<string[]>(`*[_type == "product" && _id in $ids]._id`, { ids: [...wanted.keys()] })
    );

    const now = new Date().toISOString();
    const tx = db.transaction();
    for (const [id, qty] of wanted) {
      if (!existing.has(id)) continue;
      tx.patch(id, (p) => p.setIfMissing({ stock: 0 }).inc({ stock: qty }));
      tx.create({
        _type: "stockMovement",
        product: { _type: "reference", _ref: id },
        quantity: qty,
        reason: "return",
        actorClerkId: actor,
        createdAt: now,
      });
    }
    tx.patch(order._id, (p) => p.ifRevisionId(order._rev).set({ stockReserved: false }));

    try {
      await tx.commit();
      return { released: true };
    } catch (error) {
      if (isConflict(error)) continue; // order changed under us (maybe released already): re-read
      throw error;
    }
  }
  throw new Error(`releaseStock: gave up after repeated conflicts for ${orderId}`);
}
