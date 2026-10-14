export const dynamic = "force-dynamic";

import { client } from "@repo/sanity";
import { SELLER_ORDERS_QUERY } from "@repo/sanity/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { DollarSign } from "lucide-react";
import { getCurrentStore } from "@/lib/currentStore";
import { countsAsRevenue, formatGhs, sellerSubtotal, type SellerOrder } from "@/lib/sellerOrders";

// Settlement/payout records don't exist yet, so this page shows only what can be
// computed from real orders. (It used to show hardcoded sample balances.)
export default async function PayoutsPage() {
  const store = await getCurrentStore();
  const orders: SellerOrder[] = store ? await client.fetch(SELLER_ORDERS_QUERY, { storeId: store._id }) : [];

  const paid = orders.filter(countsAsRevenue);
  const delivered = paid.filter((o) => o.orderStatus === "delivered" || o.orderStatus === "completed");
  const total = (list: SellerOrder[]) => list.reduce((sum, o) => sum + sellerSubtotal(o), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seller Payouts</h1>
        <p className="text-sm text-muted-foreground">
          Your earnings from paid orders. Figures cover your items only, before any platform fees.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivered orders</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formatGhs(total(delivered))}</div>
            <p className="text-xs text-muted-foreground mt-1">{delivered.length} paid and delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Awaiting delivery</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatGhs(total(paid) - total(delivered))}</div>
            <p className="text-xs text-muted-foreground mt-1">Paid, not yet delivered</p>
          </CardContent>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-4">
        Automatic settlements and payout history aren&apos;t available yet. Contact UShop support about payments.
      </p>
    </div>
  );
}
