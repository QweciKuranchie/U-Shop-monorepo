import { client, writeClient } from "@repo/sanity";
import { SELLER_ORDER_OWNERSHIP_QUERY } from "@repo/sanity/queries";
import { NextRequest, NextResponse } from "next/server";
import { pickAllowedFields } from "@repo/utils";
import { requireActiveStore } from "@/lib/activeStore";

// Sellers may only advance fulfilment. They must never touch payment, totals,
// ownership or any other order field (previously the whole body was `set` as-is).
const SELLER_ORDER_FIELDS = ["orderStatus"] as const;
const SELLER_FULFILMENT_STATUSES = new Set(["processing", "shipped", "out_for_delivery", "delivered"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const guard = await requireActiveStore();
  if (guard instanceof NextResponse) return guard;
  const { store } = guard;

  const { orderId } = await params;

  const ownershipCheck = await client.fetch(SELLER_ORDER_OWNERSHIP_QUERY, {
    orderId,
    storeId: store._id,
  });
  if (!ownershipCheck) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  const updates = pickAllowedFields(await request.json().catch(() => null), SELLER_ORDER_FIELDS);
  if (!updates || Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No permitted fields to update" }, { status: 400 });
  }
  for (const value of Object.values(updates)) {
    if (typeof value !== "string" || !SELLER_FULFILMENT_STATUSES.has(value)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
  }

  // A seller may only move an order forward. They must not revive a cancelled
  // (and possibly refunded) order, or ship goods that were never paid for.
  const current = await writeClient.fetch<{ orderStatus?: string; paymentStatus?: string; paymentMethod?: string; cancellationRequested?: boolean } | null>(
    `*[_type == "order" && _id == $orderId][0]{ orderStatus, paymentStatus, paymentMethod, cancellationRequested }`,
    { orderId }
  );
  if (!current) return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  const next = String(updates.orderStatus);
  if (["cancelled", "delivered", "completed"].includes(current.orderStatus ?? "")) {
    return NextResponse.json({ error: `This order is already ${current.orderStatus}` }, { status: 409 });
  }
  if (current.cancellationRequested) {
    return NextResponse.json({ error: "A cancellation is pending for this order" }, { status: 409 });
  }
  const payOnDelivery = current.paymentMethod === "pay_on_delivery" || current.paymentMethod === "cod";
  if (next !== "processing" && current.paymentStatus !== "paid" && !payOnDelivery) {
    return NextResponse.json({ error: "Wait for payment before shipping this order" }, { status: 409 });
  }
  const updated = await writeClient.patch(orderId).set(updates).commit();
  return NextResponse.json({ order: updated });
}