import { NextRequest, NextResponse } from "next/server";
import { logAdminAction } from "@/lib/adminLog";
import { client, writeClient } from "@repo/sanity";
import { auth } from "@clerk/nextjs/server";
import { verifyIsAdmin } from "@repo/auth";

export async function GET() {
  try {
    interface SanityBrandDoc {
      _id: string;
      name?: string;
      slug?: string;
      description?: string;
      featured?: boolean;
      image?: string;
    }

    const brands: SanityBrandDoc[] = await client.fetch(
      `*[_type == "brand"] | order(name asc) {
        _id,
        name,
        "slug": slug.current,
        description,
        featured,
        "image": image.asset->url
      }`
    );

    const formatted = brands.map((b) => ({
      id: b._id,
      _id: b._id,
      name: b.name || "",
      slug: b.slug || "",
      description: b.description || "",
      featured: !!b.featured,
      image: b.image || "",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
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
    const { name, slug, description, featured } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    const brandSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newBrand = await writeClient.create({
      _type: "brand",
      name,
      slug: { _type: "slug", current: brandSlug },
      description: description || "",
      featured: !!featured,
    });
    await logAdminAction("info", "Brand created", { brandId: newBrand._id, name }, userId);

    return NextResponse.json({
      success: true,
      brand: {
        id: newBrand._id,
        _id: newBrand._id,
        name: newBrand.name,
        slug: brandSlug,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating brand:", error);
    const message = error instanceof Error ? error.message : "Failed to create brand";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
