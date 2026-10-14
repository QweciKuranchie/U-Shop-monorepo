import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminApi";
import { computeAnalytics, resolveRange, RangeError } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  try {
    const sp = req.nextUrl.searchParams;
    const range = resolveRange({
      timePeriod: sp.get("timePeriod"),
      year: sp.get("year"),
      startDate: sp.get("startDate"),
      endDate: sp.get("endDate"),
    });
    return NextResponse.json(await computeAnalytics(range));
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error computing analytics:", error);
    return NextResponse.json({ error: "Failed to compute analytics" }, { status: 500 });
  }
}
