export const dynamic = "force-dynamic";

import { client } from "@repo/sanity";
import { SELLER_ORDER_DETAIL_QUERY } from "@repo/sanity/queries";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@repo/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentStore } from "@/lib/currentStore";
import { formatGhs, sellerSubtotal, type SellerOrder } from "@/lib/sellerOrders";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const store = await getCurrentStore();
  // Scoped to the seller's store: another seller's order is indistinguishable from a missing one.
  const order: SellerOrder | null = store
    ? await client.fetch(SELLER_ORDER_DETAIL_QUERY, { orderId, storeId: store._id })
    : null;

  if (!order) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order {order.orderNumber || order._id}</h1>
        <p className="text-sm text-muted-foreground">Customer: {order.customerName || order.email}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your items in this order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(order.sellerItems ?? []).map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.quantity} × {item.productName ?? "Product"}</span>
              <span>{formatGhs((Number(item.price) || 0) * (Number(item.quantity) || 0))}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm border-t pt-3">
            <span className="text-muted-foreground">Your subtotal:</span>
            <span className="font-bold">{formatGhs(sellerSubtotal(order))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Status:</span>
            <Badge variant="outline">{order.paymentStatus || "pending"}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fulfillment Status:</span>
            <Badge>{order.orderStatus || "pending"}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
