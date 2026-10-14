import { writeClient } from "@repo/sanity";

/* ------------------------------------------------------------------ */
/* Date ranges                                                         */
/* ------------------------------------------------------------------ */

export type TimePeriod =
  | "last7days"
  | "lastMonth"
  | "lastYear"
  | "year"
  | "allTime"
  | "custom";

export const TIME_PERIODS: TimePeriod[] = [
  "last7days",
  "lastMonth",
  "lastYear",
  "year",
  "allTime",
  "custom",
];

export interface RangeInput {
  timePeriod?: string | null;
  year?: string | number | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface DateRange {
  timePeriod: TimePeriod;
  start: Date;
  end: Date;
  /** Equal-length window immediately before `start`; null for allTime. */
  prevStart: Date | null;
  prevEnd: Date | null;
  label: string;
}

export class RangeError extends Error {}

const DAY = 24 * 60 * 60 * 1000;

function endOfDay(d: Date): Date {
  const e = new Date(d);
  e.setUTCHours(23, 59, 59, 999);
  return e;
}

/**
 * Resolve a time-period selection into concrete windows.
 * (The source platform mutated `now` in place, collapsing the 7-day / month /
 * year windows to zero length; every date here is a fresh copy.)
 */
export function resolveRange(input: RangeInput): DateRange {
  const timePeriod = (input.timePeriod || "allTime") as TimePeriod;
  if (!TIME_PERIODS.includes(timePeriod)) {
    throw new RangeError(`Invalid timePeriod: ${input.timePeriod}`);
  }

  const now = new Date();
  let start: Date;
  let end: Date = now;

  switch (timePeriod) {
    case "last7days":
      start = new Date(now.getTime() - 7 * DAY);
      break;
    case "lastMonth": {
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      break;
    }
    case "lastYear": {
      start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      break;
    }
    case "year": {
      const y = Number(input.year);
      if (!Number.isInteger(y) || y < 1970 || y > 2200) {
        throw new RangeError("A valid year is required for the 'year' period");
      }
      start = new Date(Date.UTC(y, 0, 1));
      end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
      break;
    }
    case "custom": {
      if (!input.startDate || !input.endDate) {
        throw new RangeError("startDate and endDate are required for a custom range");
      }
      const s = new Date(input.startDate);
      const e = new Date(input.endDate);
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
        throw new RangeError("startDate/endDate must be valid dates (YYYY-MM-DD)");
      }
      if (s > e) throw new RangeError("startDate must be on or before endDate");
      start = s;
      end = endOfDay(e);
      break;
    }
    case "allTime":
    default:
      start = new Date(0);
      break;
  }

  let prevStart: Date | null = null;
  let prevEnd: Date | null = null;
  if (timePeriod !== "allTime") {
    const length = end.getTime() - start.getTime();
    prevEnd = new Date(start.getTime() - 1);
    prevStart = new Date(prevEnd.getTime() - length);
  }

  const labels: Record<TimePeriod, string> = {
    last7days: "Last 7 days",
    lastMonth: "Last month",
    lastYear: "Last year",
    year: `Year ${input.year}`,
    allTime: "All time",
    custom: `${input.startDate} to ${input.endDate}`,
  };

  return { timePeriod, start, end, prevStart, prevEnd, label: labels[timePeriod] };
}

/* ------------------------------------------------------------------ */
/* Data access                                                         */
/* ------------------------------------------------------------------ */

interface RawOrder {
  _id: string;
  orderNumber?: string;
  totalPrice?: number;
  amount?: number;
  orderStatus?: string;
  paymentStatus?: string;
  clerkUserId?: string;
  customerName?: string;
  email?: string;
  date: string;
  items?: Array<{
    quantity?: number;
    price?: number;
    productId?: string;
    productName?: string;
    categoryName?: string;
  }>;
}

const ORDER_PROJECTION = `{
  _id,
  orderNumber,
  totalPrice,
  amount,
  orderStatus,
  paymentStatus,
  clerkUserId,
  customerName,
  email,
  "date": coalesce(orderDate, _createdAt),
  "items": items[]{
    quantity,
    price,
    "productId": product._ref,
    "productName": product->name,
    "categoryName": coalesce(product->category->title, product->category->name)
  }
}`;

async function fetchOrders(start: Date, end: Date): Promise<RawOrder[]> {
  return writeClient.fetch<RawOrder[]>(
    `*[_type == "order" && dateTime(coalesce(orderDate, _createdAt)) >= dateTime($start) && dateTime(coalesce(orderDate, _createdAt)) <= dateTime($end)]
      | order(coalesce(orderDate, _createdAt) asc) ${ORDER_PROJECTION}`,
    { start: start.toISOString(), end: end.toISOString() }
  );
}

async function countNewUsers(start: Date, end: Date): Promise<number> {
  return writeClient.fetch<number>(
    `count(*[_type == "user" && dateTime(_createdAt) >= dateTime($start) && dateTime(_createdAt) <= dateTime($end)])`,
    { start: start.toISOString(), end: end.toISOString() }
  );
}

/* ------------------------------------------------------------------ */
/* Metrics                                                             */
/* ------------------------------------------------------------------ */

/**
 * An order counts toward revenue unless it was cancelled or its payment
 * failed / was refunded.
 */
export function countsTowardRevenue(o: Pick<RawOrder, "orderStatus" | "paymentStatus">): boolean {
  const status = (o.orderStatus || "").toLowerCase();
  const pay = (o.paymentStatus || "").toLowerCase();
  return status !== "cancelled" && pay !== "failed" && pay !== "refunded";
}

const orderTotal = (o: RawOrder): number =>
  o.totalPrice !== undefined ? o.totalPrice : o.amount ? o.amount / 100 : 0;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Percentage change vs. previous period; null when there is no baseline. */
export function pctChange(current: number, previous: number | null): number | null {
  if (previous === null || previous === 0) return null;
  return round2(((current - previous) / previous) * 100);
}

interface Totals {
  revenue: number;
  orders: number;
  unitsSold: number;
  customers: number;
  aov: number;
  buyers: Set<string>;
}

function totals(orders: RawOrder[]): Totals {
  const valid = orders.filter(countsTowardRevenue);
  const buyers = new Set<string>();
  let revenue = 0;
  let unitsSold = 0;
  for (const o of valid) {
    revenue += orderTotal(o);
    unitsSold += (o.items ?? []).reduce((s, i) => s + (i.quantity ?? 0), 0);
    if (o.clerkUserId) buyers.add(o.clerkUserId);
  }
  return {
    revenue: round2(revenue),
    orders: valid.length,
    unitsSold,
    customers: buyers.size,
    aov: valid.length ? round2(revenue / valid.length) : 0,
    buyers,
  };
}

export interface Analytics {
  range: { label: string; timePeriod: TimePeriod; start: string; end: string };
  overview: {
    revenue: number;
    orders: number;
    unitsSold: number;
    averageOrderValue: number;
    customers: number;
    newUsers: number;
    changes: {
      revenue: number | null;
      orders: number | null;
      unitsSold: number | null;
      averageOrderValue: number | null;
      customers: number | null;
      newUsers: number | null;
    };
  };
  monthlyTrends: Array<{ label: string; revenue: number; orders: number; units: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  topProducts: Array<{ id: string; name: string; quantity: number; revenue: number }>;
  byCategory: Array<{ category: string; revenue: number; units: number }>;
  customerMetrics: {
    repeatPurchaseRate: number;
    lifetimeValue: number;
    retentionRate: number | null;
  };
  topCustomers: Array<{
    clerkUserId: string;
    name: string;
    email: string;
    orders: number;
    spent: number;
  }>;
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function buildMonthly(orders: RawOrder[], range: DateRange) {
  const valid = orders.filter(countsTowardRevenue);
  if (!valid.length) return [];
  const first = range.timePeriod === "allTime" ? new Date(valid[0].date) : range.start;
  const last = range.timePeriod === "allTime" ? new Date() : range.end;

  const buckets = new Map<string, { revenue: number; orders: number; units: number }>();
  const cursor = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1));
  const stop = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), 1));
  let guard = 0;
  while (cursor <= stop && guard++ < 120) {
    buckets.set(monthKey(cursor), { revenue: 0, orders: 0, units: 0 });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  for (const o of valid) {
    const b = buckets.get(monthKey(new Date(o.date)));
    if (!b) continue;
    b.revenue += orderTotal(o);
    b.orders += 1;
    b.units += (o.items ?? []).reduce((s, i) => s + (i.quantity ?? 0), 0);
  }
  return [...buckets.entries()].map(([label, v]) => ({
    label,
    revenue: round2(v.revenue),
    orders: v.orders,
    units: v.units,
  }));
}

export async function computeAnalytics(range: DateRange): Promise<Analytics> {
  const [orders, newUsers, prevOrders, prevNewUsers] = await Promise.all([
    fetchOrders(range.start, range.end),
    countNewUsers(range.start, range.end),
    range.prevStart && range.prevEnd ? fetchOrders(range.prevStart, range.prevEnd) : Promise.resolve(null),
    range.prevStart && range.prevEnd ? countNewUsers(range.prevStart, range.prevEnd) : Promise.resolve(null),
  ]);

  const cur = totals(orders);
  const prev = prevOrders ? totals(prevOrders) : null;
  const valid = orders.filter(countsTowardRevenue);

  // Order status distribution uses ALL orders in the window (incl. cancelled).
  const statusCounts = new Map<string, number>();
  for (const o of orders) {
    const s = (o.orderStatus || "pending").toLowerCase();
    statusCounts.set(s, (statusCounts.get(s) ?? 0) + 1);
  }

  // Products + categories
  const products = new Map<string, { id: string; name: string; quantity: number; revenue: number }>();
  const categories = new Map<string, { revenue: number; units: number }>();
  for (const o of valid) {
    for (const item of o.items ?? []) {
      const qty = item.quantity ?? 0;
      const rev = qty * (item.price ?? 0);
      const id = item.productId ?? "unknown";
      const p = products.get(id) ?? { id, name: item.productName ?? "Unknown product", quantity: 0, revenue: 0 };
      p.quantity += qty;
      p.revenue += rev;
      products.set(id, p);

      const cat = item.categoryName ?? "Uncategorized";
      const c = categories.get(cat) ?? { revenue: 0, units: 0 };
      c.revenue += rev;
      c.units += qty;
      categories.set(cat, c);
    }
  }

  // Customers
  const perCustomer = new Map<string, { name: string; email: string; orders: number; spent: number }>();
  for (const o of valid) {
    if (!o.clerkUserId) continue;
    const c = perCustomer.get(o.clerkUserId) ?? {
      name: o.customerName || "Customer",
      email: o.email || "",
      orders: 0,
      spent: 0,
    };
    c.orders += 1;
    c.spent += orderTotal(o);
    perCustomer.set(o.clerkUserId, c);
  }
  const repeatBuyers = [...perCustomer.values()].filter((c) => c.orders > 1).length;

  let retentionRate: number | null = null;
  if (prev && prev.buyers.size > 0) {
    let retained = 0;
    for (const id of prev.buyers) if (cur.buyers.has(id)) retained++;
    retentionRate = round2((retained / prev.buyers.size) * 100);
  }

  return {
    range: {
      label: range.label,
      timePeriod: range.timePeriod,
      start: range.start.toISOString(),
      end: range.end.toISOString(),
    },
    overview: {
      revenue: cur.revenue,
      orders: cur.orders,
      unitsSold: cur.unitsSold,
      averageOrderValue: cur.aov,
      customers: cur.customers,
      newUsers,
      changes: {
        revenue: pctChange(cur.revenue, prev?.revenue ?? null),
        orders: pctChange(cur.orders, prev?.orders ?? null),
        unitsSold: pctChange(cur.unitsSold, prev?.unitsSold ?? null),
        averageOrderValue: pctChange(cur.aov, prev?.aov ?? null),
        customers: pctChange(cur.customers, prev?.customers ?? null),
        newUsers: pctChange(newUsers, prevNewUsers),
      },
    },
    monthlyTrends: buildMonthly(orders, range),
    statusDistribution: [...statusCounts.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    topProducts: [...products.values()]
      .map((p) => ({ ...p, revenue: round2(p.revenue) }))
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
      .slice(0, 10),
    byCategory: [...categories.entries()]
      .map(([category, v]) => ({ category, revenue: round2(v.revenue), units: v.units }))
      .sort((a, b) => b.revenue - a.revenue),
    customerMetrics: {
      repeatPurchaseRate: perCustomer.size ? round2((repeatBuyers / perCustomer.size) * 100) : 0,
      lifetimeValue: perCustomer.size ? round2(cur.revenue / perCustomer.size) : 0,
      retentionRate,
    },
    topCustomers: [...perCustomer.entries()]
      .map(([clerkUserId, c]) => ({ clerkUserId, ...c, spent: round2(c.spent) }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5),
  };
}

export async function getOrderYearRange(): Promise<{ minYear: number; maxYear: number }> {
  const [first, last] = await Promise.all([
    writeClient.fetch<string | null>(
      `*[_type == "order"] | order(coalesce(orderDate, _createdAt) asc)[0].coalesce(orderDate, _createdAt)`
    ),
    writeClient.fetch<string | null>(
      `*[_type == "order"] | order(coalesce(orderDate, _createdAt) desc)[0].coalesce(orderDate, _createdAt)`
    ),
  ]);
  const now = new Date().getUTCFullYear();
  return {
    minYear: first ? new Date(first).getUTCFullYear() : now,
    maxYear: last ? new Date(last).getUTCFullYear() : now,
  };
}
