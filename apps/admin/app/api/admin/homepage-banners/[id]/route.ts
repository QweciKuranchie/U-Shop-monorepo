import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";
import { imageRef, parseBanner } from "@/lib/homepageBannerApi";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  try {
    const existing = await writeClient.fetch<{ placement: string } | null>(
      `*[_type == "homepageBanner" && _id == $id][0]{placement}`, { id }
    );
    if (!existing) return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    const body = await req.json();
    const parsed = parseBanner({ ...body, placement: existing.placement }, true);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const unset = [...parsed.unset];
    const set: Record<string, unknown> = { ...parsed.data };
    delete set.placement; // placement is fixed after creation; delete & re-add to move
    if (body.removeImage) unset.push("image");
    else {
      const image = imageRef(body.imageAssetId);
      if (image) set.image = image;
    }
    let patch = writeClient.patch(id).set(set);
    if (unset.length) patch = patch.unset(unset);
    await patch.commit();
    await logAdminAction("info", "Updated homepage banner", { id, fields: Object.keys(set) }, guard.userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Update homepage banner failed:", e);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  try {
    await writeClient.delete(id);
    await logAdminAction("warn", "Deleted homepage banner", { id }, guard.userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Delete homepage banner failed:", e);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
