import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { backendClient } from "@repo/sanity";

/**
 * Disabled. This used to accept `orderTotal` and `orderId` straight from the
 * browser without checking either, so any signed-in user could POST a huge total
 * as often as they liked and mint reward/loyalty points and "total spent".
 * Nothing in the app calls it. Points must be awarded server-side from a PAID
 * order (e.g. in markOrderPaid), never from a request body.
 */
export async function POST() {
  return NextResponse.json({ error: "Not available" }, { status: 410 });
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user points and stats
    const userStats = await backendClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{
        _id,
        rewardPoints,
        loyaltyPoints,
        totalSpent,
        lastLogin,
        "completedOrders": count(*[_type == "order" && user._ref == ^._id && orderStatus == "completed"]),
        "pendingOrders": count(*[_type == "order" && user._ref == ^._id && orderStatus in ["pending", "processing"]]),
        "totalOrders": count(*[_type == "order" && user._ref == ^._id])
      }`,
      { clerkUserId: userId }
    );

    if (!userStats) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      stats: userStats,
    });
  } catch (error) {
    console.error("Error fetching user points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
