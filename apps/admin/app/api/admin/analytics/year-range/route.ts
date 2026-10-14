import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminApi";
import { getOrderYearRange } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  try {
    return NextResponse.json(await getOrderYearRange());
  } catch (error) {
    console.error("Error fetching year range:", error);
    return NextResponse.json({ error: "Failed to fetch year range" }, { status: 500 });
  }
}
