import { NextRequest, NextResponse } from "next/server";
import { writeClient, DEFAULT_HOMEPAGE_BANNERS, HOMEPAGE_PLACEMENT_VALUES } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";

/** Body: { placement } – copies the built-in defaults into the CMS so they can be edited. */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  try {
    const { placement } = await req.json();
    if (!HOMEPAGE_PLACEMENT_VALUES.includes(placement))
      return NextResponse.json({ error: "Invalid placement" }, { status: 400 });
    const count = await writeClient.fetch<number>(
      `count(*[_type == "homepageBanner" && placement == $placement])`, { placement }
    );
    if (count > 0)
      return NextResponse.json({ error: "This section already has banners" }, { status: 409 });
    const tx = writeClient.transaction();
    for (const b of DEFAULT_HOMEPAGE_BANNERS.filter((d) => d.placement === placement)) {
      const { _id, ...rest } = b;
      tx.create({ _type: "homepageBanner", isActive: true, ...rest, order: (rest.order ?? 1) * 10 });
    }
    await tx.commit();
    await logAdminAction("info", "Loaded default homepage banners", { placement }, guard.userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Seed failed:", e);
    return NextResponse.json({ error: "Failed to load defaults" }, { status: 500 });
  }
}
