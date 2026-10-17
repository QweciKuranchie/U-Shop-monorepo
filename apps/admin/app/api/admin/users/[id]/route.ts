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
    if (id === userId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }
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
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    // Only profile fields are editable here. The raw body used to be forwarded to
    // Clerk, so this endpoint could also set passwords, primary emails, metadata
    // (admin role!) and ban state. Roles go through /users/[id]/role, which logs it.
    const updates: { firstName?: string; lastName?: string; username?: string } = {};
    for (const key of ["firstName", "lastName", "username"] as const) {
      if (typeof body[key] === "string") updates[key] = body[key].trim().slice(0, 80);
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
    }
    const client = await clerkClient();
    const updatedUser = await client.users.updateUser(id, updates);
    await logAdminAction("info", "User profile updated", { targetUserId: id, fields: Object.keys(updates) }, userId);

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
