export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { writeClient } from "@repo/sanity";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui";
import OrderStatusUpdater from "@/components/OrderStatusUpdater";

interface OrderDoc {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  orderNumber?: string;
  orderDate?: string;
  customerName?: string;
  email?: string;
  clerkUserId?: string;
  totalPrice?: number;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentGateway?: string;
  paystackReference?: string;
  paystackTransactionId?: string;
  invoice?: { number?: string; hosted_invoice_url?: string };
  address?: {
    name?: string;
    phone?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    country?: string;
  } | null;
  items?: Array<{
    _key: string;
    quantity?: number;
    price?: number;
    productId?: string;
    productName?: string;
  }>;
}

interface HistoryEntry {
  _id: string;
  createdAt: string;
  context?: string;
  actorClerkId?: string;
}

const ghs = (n = 0) => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n);
const fmt = (d?: string) => (d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—");

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words">{value || "—"}</dd>
    </>
  );
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [order, history] = await Promise.all([
    writeClient
      .fetch<OrderDoc | null>(
        `*[_type == "order" && _id == $id][0]{
          ..., 
          "address": shippingAddress->{ name, phone, streetAddress, city, state, country },
          "items": items[]{ _key, quantity, price, "productId": product._ref, "productName": product->name }
        }`,
        { id }
      )
      .catch(() => null),
    writeClient
      .fetch<HistoryEntry[]>(
        `*[_type == "adminLog" && message == "Order status updated" && context match $needle] | order(createdAt asc){ _id, createdAt, context, actorClerkId }`,
        { needle: `*${id}*` }
      )
      .catch(() => []),
  ]);
  if (!order) notFound();

  const status = order.orderStatus || "pending";
  const payment = order.paymentStatus || "pending";

  // Timeline: placed → every admin-recorded change → (fallback) last update.
  const timeline: Array<{ at?: string; title: string; detail?: string }> = [
    { at: order.orderDate || order._createdAt, title: "Order placed", detail: `Total ${ghs(order.totalPrice)}` },
  ];
  for (const h of history) {
    try {
      const c = JSON.parse(h.context ?? "{}") as {
        orderId?: string;
        orderStatus?: { from?: string; to?: string };
        paymentStatus?: { from?: string; to?: string };
      };
      if (c.orderId !== id) continue;
      if (c.orderStatus) timeline.push({ at: h.createdAt, title: `Status: ${c.orderStatus.from ?? "?"} → ${c.orderStatus.to}` });
      if (c.paymentStatus) timeline.push({ at: h.createdAt, title: `Payment: ${c.paymentStatus.from ?? "?"} → ${c.paymentStatus.to}` });
    } catch {
      /* ignore malformed history entry */
    }
  }
  if (history.length === 0 && order._updatedAt !== order._createdAt) {
    timeline.push({ at: order._updatedAt, title: `Last updated (status: ${status}, payment: ${payment})` });
  }

  const card = "bg-card border rounded-lg p-4 space-y-3";
  const grid = "grid grid-cols-[9rem_1fr] gap-y-2 text-sm";

  return (
    <div className="py-4 space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className={card}>
        <h1 className="font-semibold text-lg">Order {order.orderNumber ?? order._id.slice(0, 8)}</h1>
        <OrderStatusUpdater orderId={order._id} orderStatus={status} paymentStatus={payment} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="font-medium">Overview</h2>
          <dl className={grid}>
            <Row label="Order ID" value={<span className="font-mono text-xs">{order._id}</span>} />
            <Row label="Placed" value={fmt(order.orderDate || order._createdAt)} />
            <Row label="Last updated" value={fmt(order._updatedAt)} />
            <Row label="Status" value={<span className="capitalize">{status.replace(/_/g, " ")}</span>} />
            <Row label="Invoice" value={order.invoice?.hosted_invoice_url ? (
              <a className="text-primary hover:underline" href={order.invoice.hosted_invoice_url} target="_blank" rel="noreferrer">
                {order.invoice.number ?? "View invoice"}
              </a>
            ) : order.invoice?.number} />
          </dl>
        </section>

        <section className={card}>
          <h2 className="font-medium">Customer</h2>
          <dl className={grid}>
            <Row label="Name" value={order.customerName} />
            <Row label="Email" value={order.email} />
            <Row label="Clerk user" value={order.clerkUserId ? (
              <Link className="font-mono text-xs text-primary hover:underline" href={`/admin/users/${order.clerkUserId}`}>
                {order.clerkUserId}
              </Link>
            ) : undefined} />
          </dl>
        </section>

        <section className={card}>
          <h2 className="font-medium">Payment</h2>
          <dl className={grid}>
            <Row label="Amount" value={ghs(order.totalPrice)} />
            <Row label="Method" value={order.paymentMethod} />
            <Row label="Gateway" value={order.paymentGateway} />
            <Row label="Status" value={<span className="capitalize">{payment}</span>} />
            <Row label="Paystack ref" value={<span className="font-mono text-xs">{order.paystackReference}</span>} />
            <Row label="Paystack txn ID" value={<span className="font-mono text-xs">{order.paystackTransactionId}</span>} />
          </dl>
        </section>

        <section className={card}>
          <h2 className="font-medium">Shipping address</h2>
          {order.address ? (
            <dl className={grid}>
              <Row label="Recipient" value={order.address.name} />
              <Row label="Phone" value={order.address.phone} />
              <Row label="Street" value={order.address.streetAddress} />
              <Row label="City" value={order.address.city} />
              <Row label="State / Region" value={order.address.state} />
              <Row label="Country" value={order.address.country} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No shipping address on file.</p>
          )}
        </section>
      </div>

      <section className={card}>
        <h2 className="font-medium">Items</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(order.items ?? []).map((i) => (
                <TableRow key={i._key}>
                  <TableCell>{i.productName ?? <span className="text-muted-foreground">Deleted product</span>}</TableCell>
                  <TableCell className="text-right">{i.quantity ?? 0}</TableCell>
                  <TableCell className="text-right">{ghs(i.price)}</TableCell>
                  <TableCell className="text-right">{ghs((i.quantity ?? 0) * (i.price ?? 0))}</TableCell>
                </TableRow>
              ))}
              {(order.items ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                    No items recorded.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className={card}>
        <h2 className="font-medium">Timeline</h2>
        <ol className="relative ml-2 border-l pl-5 space-y-4">
          {timeline.map((t, idx) => (
            <li key={idx} className="relative">
              <span className="absolute -left-[1.62rem] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-xs text-muted-foreground">
                {fmt(t.at)}
                {t.detail ? ` · ${t.detail}` : ""}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
