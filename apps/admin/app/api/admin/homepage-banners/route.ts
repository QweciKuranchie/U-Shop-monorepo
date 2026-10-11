import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";
import { BANNER_PROJECTION, imageRef, parseBanner } from "@/lib/homepageBannerApi";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const banners = await writeClient.fetch(
    `*[_type == "homepageBanner"] | order(placement asc, order asc, _createdAt asc) ${BANNER_PROJECTION}`
  );
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  try {
    const body = await req.json();
    const parsed = parseBanner(body);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const image = imageRef(body.imageAssetId);
    const doc = await writeClient.create({
      _type: "homepageBanner",
      isActive: true,
      order: 100,
      ...parsed.data,
      ...(image ? { image } : {}),
    });
    await logAdminAction("info", `Created homepage banner "${String(parsed.data.title)}"`, { id: doc._id, placement: String(parsed.data.placement) }, guard.userId);
    return NextResponse.json({ _id: doc._id }, { status: 201 });
  } catch (e) {
    console.error("Create homepage banner failed:", e);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
