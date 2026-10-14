import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";

export const dynamic = "force-dynamic";

const LEVELS = ["info", "warn", "error", "debug"];

export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const sp = req.nextUrl.searchParams;
  const level = sp.get("level");
  const q = sp.get("q")?.trim();
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "25", 10) || 25));

  if (level && !LEVELS.includes(level)) {
    return NextResponse.json({ error: `level must be one of ${LEVELS.join(", ")}` }, { status: 400 });
  }

  const filter = `_type == "adminLog" && (!defined($level) || level == $level) && (!defined($q) || message match $q)`;
  const params = { level: level ?? null, q: q ? `${q}*` : null, from: (page - 1) * limit, to: page * limit };

  try {
    const [logs, total] = await Promise.all([
      writeClient.fetch(
        `*[${filter}] | order(createdAt desc) [$from...$to] { _id, level, message, actorClerkId, context, createdAt }`,
        params
      ),
      writeClient.fetch<number>(`count(*[${filter}])`, params),
    ]);
    return NextResponse.json({ logs, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

/** Clear all logs. Requires ?confirm=true to guard against accidental calls. */
export async function DELETE(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  if (req.nextUrl.searchParams.get("confirm") !== "true") {
    return NextResponse.json({ error: "Pass ?confirm=true to clear all logs" }, { status: 400 });
  }
  try {
    await writeClient.delete({ query: `*[_type == "adminLog"]` });
    // Leave a trace of who cleared the log.
    await logAdminAction("warn", "All logs cleared", {}, guard.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing logs:", error);
    return NextResponse.json({ error: "Failed to clear logs" }, { status: 500 });
  }
}
