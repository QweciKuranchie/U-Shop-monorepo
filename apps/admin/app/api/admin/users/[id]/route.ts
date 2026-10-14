import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { verifyIsAdmin } from "@repo/auth";
import { logAdminAction } from "@/lib/adminLog";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyIsAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const client = await clerkClient();
    const user = await client.users.getUser(id);

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error("Error fetching Clerk user:", error);
    const message = error instanceof Error ? error.message : "User not found";
    return NextResponse.json(
      { error: message },
      { status: 404 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyIsAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const client = await clerkClient();
    await client.users.deleteUser(id);
    await logAdminAction("warn", "User deleted", { targetUserId: id }, userId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting Clerk user:", error);
    const message = error instanceof Error ? error.message : "Failed to delete user";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyIsAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const client = await clerkClient();
    const updatedUser = await client.users.updateUser(id, body);

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error("Error updating Clerk user:", error);
    const message = error instanceof Error ? error.message : "Failed to update user";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
