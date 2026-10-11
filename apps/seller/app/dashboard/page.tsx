export const dynamic = "force-dynamic";

import { client } from "@repo/sanity";
import { SELLER_PRODUCTS_COUNT_QUERY, SELLER_ORDERS_QUERY } from "@repo/sanity/queries";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ShoppingBag, ShoppingCart, DollarSign, Clock } from "lucide-react";
import { getCurrentStore } from "@/lib/currentStore";
import {
  aggregateWeeklyRevenue,
  countsAsRevenue,
  formatGhs,
  needsDispatch,
  sellerSubtotal,
  type SellerOrder,
} from "@/lib/sellerOrders";

export default async function DashboardPage() {
  const store = await getCurrentStore();

  // Everything below is scoped to this store; nothing is global or sample data.
  const [productsCount, orders] = store
    ? await Promise.all([
        client.fetch<number>(SELLER_PRODUCTS_COUNT_QUERY, { storeId: store._id }),
        client.fetch<SellerOrder[]>(SELLER_ORDERS_QUERY, { storeId: store._id }),
      ])
    : [0, [] as SellerOrder[]];

  const revenue = orders.filter(countsAsRevenue).reduce((sum, o) => sum + sellerSubtotal(o), 0);
  const pending = orders.filter(needsDispatch).length;
  const weekly = aggregateWeeklyRevenue(orders);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">Monitor sales, manage listings, and fulfill customer orders.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Listings" value={productsCount ?? 0} description="Published products" icon={ShoppingBag} />
        <KpiCard title="Total Orders" value={orders.length} description="Orders with your products" icon={ShoppingCart} />
        <KpiCard title="Total Revenue" value={formatGhs(revenue)} description="Paid orders, your items only" icon={DollarSign} />
        <KpiCard title="Pending Fulfillment" value={pending} description="Requires dispatch" icon={Clock} />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <SalesChart data={weekly} />
      </div>
    </div>
  );
}
