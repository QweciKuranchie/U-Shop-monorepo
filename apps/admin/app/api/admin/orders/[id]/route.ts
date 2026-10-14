import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { ORDER_STATUS_VALUES } from "@repo/utils";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";

export const dynamic = "force-dynamic";

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  try {
    const order = await writeClient.fetch(`*[_type == "order" && _id == $id][0]`, { id });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

/** Update an order's fulfilment status and/or payment status. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  let body: { orderStatus?: string; paymentStatus?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { orderStatus, paymentStatus } = body;
  if (orderStatus === undefined && paymentStatus === undefined) {
    return NextResponse.json({ error: "Provide orderStatus and/or paymentStatus" }, { status: 400 });
  }
  if (orderStatus !== undefined && !ORDER_STATUS_VALUES.includes(orderStatus)) {
    return NextResponse.json({ error: `Invalid orderStatus: ${orderStatus}` }, { status: 400 });
  }
  if (paymentStatus !== undefined && !PAYMENT_STATUSES.includes(paymentStatus)) {
    return NextResponse.json({ error: `paymentStatus must be one of ${PAYMENT_STATUSES.join(", ")}` }, { status: 400 });
  }

  try {
    const current = await writeClient.fetch<{ orderStatus?: string; paymentStatus?: string; orderNumber?: string } | null>(
      `*[_type == "order" && _id == $id][0]{ orderStatus, paymentStatus, orderNumber }`,
      { id }
    );
    if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const patch: Record<string, string> = {};
    if (orderStatus !== undefined) patch.orderStatus = orderStatus;
    if (paymentStatus !== undefined) patch.paymentStatus = paymentStatus;
    const updated = await writeClient.patch(id).set(patch).commit();

    await logAdminAction(
      "info",
      "Order status updated",
      {
        orderId: id,
        orderNumber: current.orderNumber,
        orderStatus: orderStatus !== undefined ? { from: current.orderStatus, to: orderStatus } : undefined,
        paymentStatus: paymentStatus !== undefined ? { from: current.paymentStatus, to: paymentStatus } : undefined,
      },
      guard.userId
    );

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
