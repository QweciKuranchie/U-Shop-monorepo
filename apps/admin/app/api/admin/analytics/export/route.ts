import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";
import { resolveRange, RangeError } from "@/lib/analytics";
import { CONTENT_TYPES, EXPORT_FORMATS, renderExport, type ExportFormat } from "@/lib/exportFiles";
import { ANALYTICS_EXPORT_TYPES, buildAnalyticsExport, type AnalyticsExportType } from "@/lib/reportBuilders";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const sp = req.nextUrl.searchParams;
  const type = (sp.get("type") || "all") as AnalyticsExportType;
  const format = (sp.get("format") || "csv") as ExportFormat;

  if (!ANALYTICS_EXPORT_TYPES.includes(type)) {
    return NextResponse.json({ error: `type must be one of ${ANALYTICS_EXPORT_TYPES.join(", ")}` }, { status: 400 });
  }
  if (!EXPORT_FORMATS.includes(format)) {
    return NextResponse.json({ error: `format must be one of ${EXPORT_FORMATS.join(", ")}` }, { status: 400 });
  }

  try {
    const range = resolveRange({
      timePeriod: sp.get("timePeriod"),
      year: sp.get("year"),
      startDate: sp.get("startDate"),
      endDate: sp.get("endDate"),
    });
    const { title, sections } = await buildAnalyticsExport(type, range);
    const file = await renderExport(format, title, sections);

    await logAdminAction("info", "Exported analytics", { type, format, range: range.label }, guard.userId);

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": CONTENT_TYPES[format],
        "Content-Disposition": `attachment; filename="analytics-${type}-${new Date().toISOString().slice(0, 10)}.${format}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error exporting analytics:", error);
    await logAdminAction("error", "Analytics export failed", { type, format }, guard.userId);
    return NextResponse.json({ error: "Failed to export analytics" }, { status: 500 });
  }
}
