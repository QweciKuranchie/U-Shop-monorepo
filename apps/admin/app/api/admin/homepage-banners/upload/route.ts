import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";

const MAX = 5 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"];

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!TYPES.includes(file.type)) return NextResponse.json({ error: "Use PNG, JPEG, WebP or AVIF" }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
    const asset = await writeClient.assets.upload("image", Buffer.from(await file.arrayBuffer()), {
      filename: file.name,
      contentType: file.type,
    });
    return NextResponse.json({ assetId: asset._id, url: asset.url });
  } catch (e) {
    console.error("Banner upload failed:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
