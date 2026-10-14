import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";
import { resolveRange, RangeError } from "@/lib/analytics";
import { CONTENT_TYPES, EXPORT_FORMATS, renderExport, type ExportFormat } from "@/lib/exportFiles";
import { REPORT_TYPES, buildReport, type ReportType } from "@/lib/reportBuilders";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") as ReportType | null;
  const format = sp.get("format") as ExportFormat | null;

  if (!type || !REPORT_TYPES.includes(type)) {
    return NextResponse.json({ error: `type must be one of ${REPORT_TYPES.join(", ")}` }, { status: 400 });
  }
  if (!format || !EXPORT_FORMATS.includes(format)) {
    return NextResponse.json({ error: `format must be one of ${EXPORT_FORMATS.join(", ")}` }, { status: 400 });
  }

  const started = Date.now();
  try {
    const range = resolveRange({
      timePeriod: sp.get("timePeriod"),
      year: sp.get("year"),
      startDate: sp.get("startDate"),
      endDate: sp.get("endDate"),
    });
    const { title, sections } = await buildReport(type, range);
    const file = await renderExport(format, title, sections);

    await logAdminAction(
      "info",
      "Report generated",
      { type, format, range: range.label, durationMs: Date.now() - started },
      guard.userId
    );

    const name = type === "user_retention" ? "user-retention" : type === "all" ? "combined" : "sales";
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": CONTENT_TYPES[format],
        "Content-Disposition": `attachment; filename="${name}-report-${new Date().toISOString().slice(0, 10)}.${format}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error generating report:", error);
    await logAdminAction("error", "Report generation failed", { type, format }, guard.userId);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
