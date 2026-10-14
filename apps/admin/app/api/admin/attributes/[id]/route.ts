import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";
import { countReferences, describeRefs } from "@/lib/references";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

const TYPES = ["string", "number", "boolean", "select", "multiSelect"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  let body: { title?: string; slug?: string; type?: string; options?: string[]; unit?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const current = await writeClient.fetch<{ title?: string; type?: string } | null>(
      `*[_type == "attribute" && _id == $id][0]{ title, type }`,
      { id }
    );
    if (!current) return NextResponse.json({ error: "Attribute not found" }, { status: 404 });

    const set: Record<string, unknown> = {};
    const unset: string[] = [];
    if (body.title !== undefined) {
      if (!body.title.trim()) return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      set.title = body.title.trim();
    }
    if (body.slug !== undefined) {
      const slug = slugify(body.slug);
      if (!slug) return NextResponse.json({ error: "Slug cannot be empty" }, { status: 400 });
      const clash = await writeClient.fetch<number>(
        `count(*[_type == "attribute" && slug.current == $slug && _id != $id])`,
        { slug, id }
      );
      if (clash) return NextResponse.json({ error: `Slug "${slug}" is already in use` }, { status: 409 });
      set.slug = { _type: "slug", current: slug };
    }
    const type = body.type ?? current.type ?? "string";
    if (body.type !== undefined) {
      if (!TYPES.includes(body.type)) return NextResponse.json({ error: `type must be one of ${TYPES.join(", ")}` }, { status: 400 });
      set.type = body.type;
    }
    const isChoice = type === "select" || type === "multiSelect";
    if (body.options !== undefined || body.type !== undefined) {
      if (isChoice) {
        const options = [...new Set((body.options ?? []).map((o) => o.trim()).filter(Boolean))];
        if (!options.length) return NextResponse.json({ error: "Select attributes need at least one option" }, { status: 400 });
        set.options = options;
      } else {
        unset.push("options");
      }
    }
    if (body.unit !== undefined) {
      if (body.unit.trim()) set.unit = body.unit.trim();
      else unset.push("unit");
    }
    if (!Object.keys(set).length && !unset.length) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    let patch = writeClient.patch(id);
    if (Object.keys(set).length) patch = patch.set(set);
    if (unset.length) patch = patch.unset(unset);
    await patch.commit();

    await logAdminAction("info", "Attribute updated", { attributeId: id, title: current.title, fields: [...Object.keys(set), ...unset] }, guard.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating attribute:", error);
    return NextResponse.json({ error: "Failed to update attribute" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  try {
    const current = await writeClient.fetch<{ title?: string } | null>(
      `*[_type == "attribute" && _id == $id][0]{ title }`,
      { id }
    );
    if (!current) return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
    const refs = await countReferences(id);
    if (Object.keys(refs).length) {
      return NextResponse.json(
        { error: `Cannot delete: this attribute is still used by ${describeRefs(refs)}. Remove it from them first.` },
        { status: 409 }
      );
    }
    await writeClient.delete(id);
    await logAdminAction("warn", "Attribute deleted", { attributeId: id, title: current.title }, guard.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attribute:", error);
    return NextResponse.json({ error: "Failed to delete attribute" }, { status: 500 });
  }
}
