export interface SellerOrderItem {
  quantity?: number | null;
  price?: number | null;
  productName?: string | null;
}

export interface SellerOrder {
  _id: string;
  _createdAt: string;
  orderNumber?: string | null;
  customerName?: string | null;
  email?: string | null;
  orderStatus?: string | null;
  paymentStatus?: string | null;
  sellerItems?: SellerOrderItem[] | null;
}

/** What this seller earns from an order: only their own lines, price at purchase x quantity. */
export function sellerSubtotal(order: Pick<SellerOrder, "sellerItems">): number {
  return (order.sellerItems ?? []).reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
    0
  );
}

/** Revenue counts only paid orders that were not cancelled. */
export function countsAsRevenue(order: SellerOrder): boolean {
  return order.paymentStatus === "paid" && order.orderStatus !== "cancelled";
}

const DISPATCHED_OR_CLOSED = new Set([
  "shipped", "out_for_delivery", "rescheduled", "failed_delivery", "delivered", "completed", "cancelled",
]);

/** Orders that still need the seller to pack and dispatch them. */
export function needsDispatch(order: SellerOrder): boolean {
  if (order.paymentStatus === "failed" || order.paymentStatus === "refunded") return false;
  return !DISPATCHED_OR_CLOSED.has(order.orderStatus ?? "pending");
}

/** Seller revenue bucketed into the last 7 days (oldest first). */
export function aggregateWeeklyRevenue(
  orders: SellerOrder[],
  now: Date = new Date()
): Array<{ name: string; revenue: number }> {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets: Array<{ name: string; revenue: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const revenue = orders
      .filter((o) => countsAsRevenue(o) && new Date(o._createdAt) >= start && new Date(o._createdAt) < end)
      .reduce((sum, o) => sum + sellerSubtotal(o), 0);
    buckets.push({ name: dayNames[start.getDay()]!, revenue });
  }
  return buckets;
}

export const formatGhs = (n: number) =>
  `GH₵ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
