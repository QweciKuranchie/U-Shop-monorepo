import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { verifyIsAdmin } from "@repo/auth";

/**
 * Guard for admin route handlers.
 *
 *   const guard = await requireAdminApi();
 *   if (guard instanceof NextResponse) return guard;
 *   const { userId } = guard;
 *
 * Unlike the source platform (where several admin routes were only behind a
 * "logged in" check), every admin route here goes through verifyIsAdmin.
 */
export async function requireAdminApi(): Promise<{ userId: string } | NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await verifyIsAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }
  return { userId };
}
