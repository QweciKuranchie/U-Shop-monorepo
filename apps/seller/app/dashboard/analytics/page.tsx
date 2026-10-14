export const dynamic = "force-dynamic";

import { client } from "@repo/sanity";
import { SELLER_ORDERS_QUERY } from "@repo/sanity/queries";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { getCurrentStore } from "@/lib/currentStore";
import { aggregateWeeklyRevenue, type SellerOrder } from "@/lib/sellerOrders";

export default async function AnalyticsPage() {
  const store = await getCurrentStore();
  const orders: SellerOrder[] = store ? await client.fetch(SELLER_ORDERS_QUERY, { storeId: store._id }) : [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Store Analytics</h1>
        <p className="text-sm text-muted-foreground">Revenue from paid orders over the last 7 days.</p>
      </div>
      <SalesChart data={aggregateWeeklyRevenue(orders)} />
    </div>
  );
}
