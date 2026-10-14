import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";
import { countReferences, describeRefs } from "@/lib/references";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

const LEVELS = ["category", "subcategory", "leaf"];

interface PatchBody {
  title?: string;
  slug?: string;
  level?: string;
  description?: string;
  /** null clears the parent */
  parentId?: string | null;
  productClassificationId?: string;
  attributes?: Array<{ attributeId: string; required?: boolean }>;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const category = await writeClient
    .fetch(
      `*[_type == "category" && _id == $id][0]{
        _id, title, "slug": slug.current, level, description,
        "parentId": parent._ref, "productClassificationId": productType._ref,
        "attributes": attributes[]{ "attributeId": attribute._ref, required }
      }`,
      { id }
    )
    .catch(() => null);
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  return NextResponse.json({ category });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const current = await writeClient.fetch<{ _id: string; title?: string; typeRef?: string } | null>(
      `*[_type == "category" && _id == $id][0]{ _id, title, "typeRef": productType._ref }`,
      { id }
    );
    if (!current) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const set: Record<string, unknown> = {};
    const unset: string[] = [];

    if (body.title !== undefined) {
      if (!body.title.trim()) return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      set.title = body.title.trim();
      set.name = body.title.trim();
    }
    if (body.slug !== undefined) {
      const slug = slugify(body.slug);
      if (!slug) return NextResponse.json({ error: "Slug cannot be empty" }, { status: 400 });
      const clash = await writeClient.fetch<number>(
        `count(*[_type == "category" && slug.current == $slug && _id != $id])`,
        { slug, id }
      );
      if (clash) return NextResponse.json({ error: `Slug "${slug}" is already used by another category` }, { status: 409 });
      set.slug = { _type: "slug", current: slug };
    }
    if (body.level !== undefined) {
      if (!LEVELS.includes(body.level)) return NextResponse.json({ error: `level must be one of ${LEVELS.join(", ")}` }, { status: 400 });
      set.level = body.level;
    }
    if (body.description !== undefined) set.description = body.description;

    let typeRef = current.typeRef;
    if (body.productClassificationId) {
      set.productType = { _type: "reference", _ref: body.productClassificationId };
      typeRef = body.productClassificationId;
    }

    if (body.parentId !== undefined) {
      if (body.parentId === null || body.parentId === "") {
        unset.push("parent");
      } else {
        if (body.parentId === id) return NextResponse.json({ error: "A category cannot be its own parent" }, { status: 400 });
        // Walk up the ancestors: refuse cycles; require the same product type.
        let cursor: string | null = body.parentId;
        let depth = 0;
        let parentType: string | undefined;
        while (cursor && depth++ < 20) {
          if (cursor === id) return NextResponse.json({ error: "That parent would create a cycle" }, { status: 400 });
          const node: { parent?: string; typeRef?: string } | null = await writeClient.fetch(
            `*[_type == "category" && _id == $c][0]{ "parent": parent._ref, "typeRef": productType._ref }`,
            { c: cursor }
          );
          if (!node) return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
          if (depth === 1) parentType = node.typeRef;
          cursor = node.parent ?? null;
        }
        if (parentType && typeRef && parentType !== typeRef) {
          return NextResponse.json({ error: "Parent category must have the same product type" }, { status: 400 });
        }
        set.parent = { _type: "reference", _ref: body.parentId };
      }
    }

    if (body.attributes !== undefined) {
      const seen = new Set<string>();
      for (const a of body.attributes) {
        if (!a.attributeId || seen.has(a.attributeId)) {
          return NextResponse.json({ error: "Attributes must be unique" }, { status: 400 });
        }
        seen.add(a.attributeId);
      }
      set.attributes = body.attributes.map((a) => ({
        _key: a.attributeId,
        _type: "categoryAttribute",
        attribute: { _type: "reference", _ref: a.attributeId },
        required: !!a.required,
      }));
    }

    if (!Object.keys(set).length && !unset.length) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    let patch = writeClient.patch(id);
    if (Object.keys(set).length) patch = patch.set(set);
    if (unset.length) patch = patch.unset(unset);
    await patch.commit();

    await logAdminAction("info", "Category updated", { categoryId: id, title: current.title, fields: [...Object.keys(set), ...unset] }, guard.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  try {
    const current = await writeClient.fetch<{ title?: string } | null>(
      `*[_type == "category" && _id == $id][0]{ title }`,
      { id }
    );
    if (!current) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const refs = await countReferences(id);
    if (Object.keys(refs).length) {
      return NextResponse.json(
        { error: `Cannot delete: this category is still used by ${describeRefs(refs)}. Reassign or remove them first.` },
        { status: 409 }
      );
    }
    await writeClient.delete(id);
    await logAdminAction("warn", "Category deleted", { categoryId: id, title: current.title }, guard.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
