import { NextRequest, NextResponse } from "next/server";
import { verifyIsAdmin } from "@repo/auth";
import { writeClient, releaseStock } from "@repo/sanity";
import { sendOrderStatusNotification } from "@/lib/notificationService";
import { getAuthUser } from "@/lib/getAuthUser";

const KEY_MILESTONE_STATUSES = new Set([
  "processing",
  "paid",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

const ALL_VALID_STATUSES = new Set([
  "pending",
  "address_confirmed",
  "order_confirmed",
  "packed",
  "ready_for_delivery",
  "processing",
  "paid",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "rescheduled",
  "failed_delivery",
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { userId } = await getAuthUser(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = await verifyIsAdmin(userId);
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  const { orderId } = await params;
  const body = await request.json().catch(() => ({}));
  const { status, trackingNote } = (body || {}) as {
    status?: string;
    trackingNote?: string;
  };

  if (!status || !ALL_VALID_STATUSES.has(status.toLowerCase())) {
    return NextResponse.json(
      {
        error: `Invalid status. Must be one of: ${[...ALL_VALID_STATUSES].join(
          ", "
        )}`,
      },
      { status: 400 }
    );
  }

  const normalizedStatus = status.toLowerCase();

  // Fetch the order to get owner and order number
  const order = await writeClient.fetch<{
    _id: string;
    orderNumber: string;
    clerkUserId: string;
    orderStatus: string;
  } | null>(
    `*[_type == "order" && _id == $orderId][0]{
      _id, orderNumber, clerkUserId, orderStatus
    }`,
    { orderId }
  );

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Update status in Sanity
  await writeClient
    .patch(orderId)
    .set({ orderStatus: normalizedStatus, updatedAt: new Date().toISOString() })
    .commit();

  if (normalizedStatus === "cancelled" && order.orderStatus !== "cancelled") {
    await releaseStock(orderId, userId).catch((e) => console.error("releaseStock failed for", orderId, e));
  }

  // Trigger notification pipeline for key milestones
  if (KEY_MILESTONE_STATUSES.has(normalizedStatus)) {
    sendOrderStatusNotification({
      clerkUserId: order.clerkUserId,
      orderNumber: order.orderNumber,
      orderId: order._id,
      status: normalizedStatus,
      previousStatus: order.orderStatus,
      trackingNote,
    }).catch((err) => console.error("Notification failed silently:", err));
  }

  return NextResponse.json({
    success: true,
    orderId,
    status: normalizedStatus,
  });
}
