import { NextRequest, NextResponse } from "next/server";
import { client, writeClient } from "@repo/sanity";
import { auth } from "@clerk/nextjs/server";
import { verifyIsAdmin } from "@repo/auth";
import { logAdminAction } from "@/lib/adminLog";

interface SanityCategory {
  _id: string;
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
}

export async function GET() {
  try {
    const categories: SanityCategory[] = await client.fetch(
      `*[_type == "category"] | order(name asc) {
        _id,
        name,
        "slug": slug.current,
        description,
        "image": image.asset->url
      }`
    );

    const formatted = categories.map((cat: SanityCategory) => ({
      id: cat._id,
      _id: cat._id,
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      image: cat.image || "",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyIsAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { title, name, slug, description, productClassificationId, level, parentId, attributes } = body;
    const categoryTitle = title || name;

    if (!categoryTitle || !slug) {
      return NextResponse.json(
        { error: "Name/Title and slug are required" },
        { status: 400 }
      );
    }

    const newCategory = await writeClient.create({
      _type: "category",
      title: categoryTitle,
      name: categoryTitle,
      slug: {
        _type: "slug",
        current: slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      },
      level: level || "leaf",
      description: description || "",
      ...(productClassificationId
        ? { productType: { _type: "reference", _ref: productClassificationId } }
        : {}),
      ...(parentId ? { parent: { _type: "reference", _ref: parentId } } : {}),
      ...(Array.isArray(attributes) && attributes.length
        ? {
            attributes: attributes.map((a: { attributeId: string; required?: boolean }) => ({
              _key: a.attributeId,
              _type: "categoryAttribute",
              attribute: { _type: "reference", _ref: a.attributeId },
              required: !!a.required,
            })),
          }
        : {}),
    });
    await logAdminAction("info", "Category created", { categoryId: newCategory._id, title: categoryTitle }, userId);

    return NextResponse.json({
      success: true,
      category: {
        id: newCategory._id,
        _id: newCategory._id,
        title: newCategory.title,
        name: newCategory.name,
        slug: slug,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating category:", error);
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
