import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export const ATTRIBUTE_TYPES = ["string", "number", "boolean", "select", "multiSelect"] as const;

export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  try {
    const attributes = await writeClient.fetch(
      `*[_type == "attribute"] | order(title asc){
        _id, title, "slug": slug.current, type, options, unit,
        "categoryCount": count(*[_type == "category" && references(^._id)])
      }`
    );
    return NextResponse.json({ attributes });
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return NextResponse.json({ error: "Failed to fetch attributes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  let body: { title?: string; slug?: string; type?: string; options?: string[]; unit?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const type = body.type ?? "string";
  if (!(ATTRIBUTE_TYPES as readonly string[]).includes(type)) {
    return NextResponse.json({ error: `type must be one of ${ATTRIBUTE_TYPES.join(", ")}` }, { status: 400 });
  }
  const slug = slugify(body.slug || title);
  if (!slug) return NextResponse.json({ error: "A valid slug is required" }, { status: 400 });

  const isChoice = type === "select" || type === "multiSelect";
  const options = isChoice ? [...new Set((body.options ?? []).map((o) => o.trim()).filter(Boolean))] : [];
  if (isChoice && options.length === 0) {
    return NextResponse.json({ error: "Select attributes need at least one option" }, { status: 400 });
  }

  try {
    const clash = await writeClient.fetch<number>(`count(*[_type == "attribute" && slug.current == $slug])`, { slug });
    if (clash) return NextResponse.json({ error: `Slug "${slug}" is already in use` }, { status: 409 });

    const created = await writeClient.create({
      _type: "attribute",
      title,
      slug: { _type: "slug", current: slug },
      type,
      ...(isChoice ? { options } : {}),
      ...(body.unit?.trim() ? { unit: body.unit.trim() } : {}),
    });
    await logAdminAction("info", "Attribute created", { attributeId: created._id, title }, guard.userId);
    return NextResponse.json({ success: true, attribute: { _id: created._id } }, { status: 201 });
  } catch (error) {
    console.error("Error creating attribute:", error);
    return NextResponse.json({ error: "Failed to create attribute" }, { status: 500 });
  }
}
