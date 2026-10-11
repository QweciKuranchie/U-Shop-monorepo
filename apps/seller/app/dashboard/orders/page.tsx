export const dynamic = "force-dynamic";

import { client } from "@repo/sanity";
import { SELLER_ORDERS_QUERY } from "@repo/sanity/queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button } from "@repo/ui";
import Link from "next/link";
import { getCurrentStore } from "@/lib/currentStore";
import { formatGhs, sellerSubtotal, type SellerOrder } from "@/lib/sellerOrders";

export default async function OrdersPage() {
  const store = await getCurrentStore();
  const orders: SellerOrder[] = store ? await client.fetch(SELLER_ORDERS_QUERY, { storeId: store._id }) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Orders</h1>
        <p className="text-sm text-muted-foreground">
          Orders containing your products. Amounts show only your items.
        </p>
      </div>
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Your items</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-mono font-medium">{order.orderNumber || order._id.slice(0, 8)}</TableCell>
                  <TableCell>{order.customerName || "Customer"}</TableCell>
                  <TableCell>{formatGhs(sellerSubtotal(order))}</TableCell>
                  <TableCell>
                    <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                      {order.paymentStatus || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.orderStatus || "pending"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/orders/${order._id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
