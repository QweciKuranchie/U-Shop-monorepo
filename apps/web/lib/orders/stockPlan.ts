/**
 * Pure stock-reservation planning (no I/O) — unit-tested in isolation.
 *
 * Policy: stock is RESERVED when an order is created and RELEASED when it is
 * cancelled (or when an unpaid card/MoMo order is abandoned). Reserving at
 * creation is what stops a 1-of-1 used item being sold to two buyers.
 */

/** How long an unpaid card/MoMo order may hold stock before it is released. */
export const UNPAID_HOLD_MS = 30 * 60 * 1000;

export interface StockProduct {
  _id: string;
  _rev: string;
  name?: string | null;
  stock?: number | null;
}

export interface StockUpdate {
  id: string;
  rev: string;
  name: string;
  quantity: number;
  before: number;
  after: number;
}

export type ReservationPlan =
  | { ok: true; updates: StockUpdate[] }
  | { ok: false; code: "PRODUCT_UNAVAILABLE" | "INSUFFICIENT_STOCK"; names: string[] };

/** `wanted` is productId → total quantity (duplicate cart lines already merged). */
export function planReservation(
  wanted: ReadonlyMap<string, number>,
  products: readonly StockProduct[]
): ReservationPlan {
  const byId = new Map(products.map((p) => [p._id, p]));
  const missing: string[] = [];
  const short: string[] = [];
  const updates: StockUpdate[] = [];

  for (const [id, quantity] of wanted) {
    const product = byId.get(id);
    if (!product) {
      missing.push(id);
      continue;
    }
    const before = Number.isFinite(product.stock) ? Number(product.stock) : 0;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > before) {
      short.push(product.name || id);
      continue;
    }
    updates.push({
      id,
      rev: product._rev,
      name: product.name || id,
      quantity,
      before,
      after: before - quantity,
    });
  }

  if (missing.length) return { ok: false, code: "PRODUCT_UNAVAILABLE", names: missing };
  if (short.length) return { ok: false, code: "INSUFFICIENT_STOCK", names: short };
  return { ok: true, updates };
}

/** Sum the quantity per product from an order's `items`. */
export function quantitiesFromItems(
  items: ReadonlyArray<{ quantity?: number | null; product?: { _ref?: string } | null; productId?: string | null }> | null | undefined
): Map<string, number> {
  const out = new Map<string, number>();
  for (const item of items ?? []) {
    const id = item.productId ?? item.product?._ref;
    const qty = Number(item.quantity);
    if (!id || !Number.isInteger(qty) || qty < 1) continue;
    out.set(id, (out.get(id) ?? 0) + qty);
  }
  return out;
}

export function isReservationExpired(orderDate: string | null | undefined, now: number, ttlMs = UNPAID_HOLD_MS): boolean {
  const t = orderDate ? Date.parse(orderDate) : NaN;
  return Number.isFinite(t) && now - t > ttlMs;
}
