import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";

/** Body: { ids: string[] } – the new order for one placement. */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length > 100 || ids.some((i) => typeof i !== "string"))
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
    const tx = writeClient.transaction();
    ids.forEach((id: string, i: number) => tx.patch(id, (p) => p.set({ order: (i + 1) * 10 })));
    await tx.commit();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Reorder failed:", e);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
