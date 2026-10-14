import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";

export const dynamic = "force-dynamic";

/**
 * Grant or revoke admin access by setting Clerk publicMetadata.role.
 * verifyIsAdmin also honours the ADMIN_EMAILS allow-list, so users on that
 * list remain admins regardless of this flag.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const role = body?.role;
  if (role !== "admin" && role !== "user") {
    return NextResponse.json({ error: 'role must be "admin" or "user"' }, { status: 400 });
  }
  if (id === guard.userId && role !== "admin") {
    return NextResponse.json({ error: "You cannot remove your own admin access" }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(id, { publicMetadata: { role } });
    await logAdminAction("warn", `User role set to ${role}`, { targetUserId: id, role }, guard.userId);
    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update role" }, { status: 500 });
  }
}
