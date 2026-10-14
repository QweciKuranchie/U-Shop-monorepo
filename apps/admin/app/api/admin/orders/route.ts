import { NextRequest, NextResponse } from "next/server";
import { logAdminAction } from "@/lib/adminLog";
import { client, writeClient } from "@repo/sanity";
import { auth } from "@clerk/nextjs/server";
import { verifyIsAdmin } from "@repo/auth";

interface SanityOrderDoc {
  _id: string;
  orderNumber?: string;
  customerEmail?: string;
  email?: string;
  orderStatus?: string;
  totalPrice?: number;
  amount?: number;
  clerkUserId?: string;
  userClerkId?: string;
  customerName?: string;
  fullName?: string;
  orderDate?: string;
  _createdAt?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyIsAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");

    let query = `*[_type == "order"] | order(orderDate desc, _createdAt desc)`;
    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        query += `[0...${parsedLimit}]`;
      }
    }

    query += `{
      _id,
      orderNumber,
      customerEmail,
      email,
      orderStatus,
      totalPrice,
      amount,
      clerkUserId,
      userClerkId,
      customerName,
      fullName,
      orderDate,
      _createdAt
    }`;

    const orders: SanityOrderDoc[] = await client.fetch(query);

    const formatted = orders.map((ord: SanityOrderDoc) => {
      const amount = ord.totalPrice !== undefined ? ord.totalPrice * 100 : (ord.amount || 0);
      return {
        id: ord._id,
        _id: ord._id,
        orderNumber: ord.orderNumber || ord._id,
        email: ord.customerEmail || ord.email || "customer@example.com",
        status: ord.orderStatus || "pending",
        amount: typeof amount === "number" ? amount : 0,
        userId: ord.clerkUserId || ord.userClerkId || "",
        fullName: ord.customerName || ord.fullName || "Customer",
        createdAt: ord.orderDate || ord._createdAt || new Date().toISOString(),
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyIsAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { amount, userId: orderUserId, status, email, fullName } = body;

    const newOrder = await writeClient.create({
      _type: "order",
      orderNumber: `ORD-${Date.now()}`,
      customerEmail: email || "customer@example.com",
      customerName: fullName || "Valued Customer",
      clerkUserId: orderUserId || userId,
      totalPrice: (amount || 0) / 100,
      orderStatus: status || "pending",
      paymentStatus: (status === "delivered" || status === "success" || status === "paid") ? "paid" : "pending",
      orderDate: new Date().toISOString(),
    });

    await logAdminAction("info", "Order created manually", { orderId: newOrder._id }, userId);

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder._id,
        _id: newOrder._id,
        status: newOrder.orderStatus,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating order:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
