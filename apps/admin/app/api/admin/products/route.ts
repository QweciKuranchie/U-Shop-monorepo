import { NextRequest, NextResponse } from "next/server";
import { logAdminAction } from "@/lib/adminLog";
import { client, writeClient } from "@repo/sanity";
import { auth } from "@clerk/nextjs/server";
import { verifyIsAdmin } from "@repo/auth";

interface SanityProductFetchDoc {
  _id: string;
  name?: string;
  slug?: string;
  price?: number;
  discount?: number;
  stock?: number;
  condition?: "new" | "used";
  status?: string;
  sellerType?: "personal" | "business" | "student";
  featured?: boolean;
  isFlashSale?: boolean;
  isStudentDeal?: boolean;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  categorySlug?: string;
  categoryTitle?: string;
  brandName?: string;
  classificationTitle?: string;
  colors?: string[];
  sizes?: string[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");
    const popular = searchParams.get("popular");

    let query = `*[_type == "product"]`;
    if (popular === "true") {
      query += ` | order(views desc, _createdAt desc)`;
    } else {
      query += ` | order(_createdAt desc)`;
    }

    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        query += `[0...${parsedLimit}]`;
      }
    }

    query += `{
      _id,
      name,
      "slug": slug.current,
      price,
      discount,
      stock,
      condition,
      status,
      sellerType,
      featured,
      isFlashSale,
      isStudentDeal,
      shortDescription,
      description,
      "imageUrl": image.asset->url,
      "images": images[].asset->url,
      "categorySlug": category->slug.current,
      "categoryTitle": category->title,
      "brandName": brand->name,
      "classificationTitle": productClassification->title,
      colors,
      sizes
    }`;

    const products: SanityProductFetchDoc[] = await client.fetch(query);

    const formatted = products.map((p) => {
      const fallbackImage = p.imageUrl || (Array.isArray(p.images) && p.images[0]) || "";
      const imageMap: Record<string, string> = {};
      if (Array.isArray(p.colors) && p.colors.length > 0) {
        p.colors.forEach((c: string, i: number) => {
          imageMap[c] = (Array.isArray(p.images) && p.images[i]) || fallbackImage;
        });
      } else {
        imageMap["default"] = fallbackImage;
      }

      return {
        id: p._id,
        _id: p._id,
        name: p.name || "Untitled Product",
        price: p.price || 0,
        discount: p.discount || 0,
        stock: p.stock ?? 0,
        condition: p.condition || "new",
        status: p.status || "new",
        sellerType: p.sellerType || "personal",
        featured: !!p.featured,
        isFlashSale: !!p.isFlashSale,
        isStudentDeal: !!p.isStudentDeal,
        shortDescription: p.shortDescription || p.description || "",
        description: p.description || "",
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        colors: Array.isArray(p.colors) ? p.colors : ["default"],
        images: imageMap,
        categorySlug: p.categorySlug || "",
        category: p.categoryTitle ? { title: p.categoryTitle } : undefined,
        brand: p.brandName ? { name: p.brandName } : undefined,
        productClassification: p.classificationTitle ? { title: p.classificationTitle } : undefined,
        slug: p.slug || "",
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
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
    const {
      name,
      price,
      discount,
      stock,
      condition,
      status,
      classificationId,
      categoryId,
      categorySlug,
      brandId,
      storeId,
      sellerType,
      featured,
      isFlashSale,
      isStudentDeal,
      shortDescription,
      description,
      sizes,
      colors,
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Product name and price are required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Look up category reference
    let resolvedCategoryRef: { _type: "reference"; _ref: string } | undefined = undefined;
    if (categoryId) {
      resolvedCategoryRef = { _type: "reference", _ref: categoryId };
    } else if (categorySlug) {
      const catId: string | null = await client.fetch(
        `*[_type == "category" && slug.current == $slug][0]._id`,
        { slug: categorySlug }
      );
      if (catId) {
        resolvedCategoryRef = { _type: "reference", _ref: catId };
      }
    }

    const newDoc: { _type: string; [key: string]: unknown } = {
      _type: "product",
      name,
      slug: { _type: "slug", current: slug },
      price: Number(price),
      discount: discount !== undefined ? Number(discount) : 0,
      stock: stock !== undefined ? Number(stock) : 1,
      condition: condition || "new",
      status: status || "new",
      sellerType: sellerType || "personal",
      featured: !!featured,
      isFlashSale: !!isFlashSale,
      isStudentDeal: !!isStudentDeal,
      shortDescription: shortDescription || "",
      description: description || "",
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      ...(resolvedCategoryRef
        ? {
            category: resolvedCategoryRef,
            categories: [{ ...resolvedCategoryRef, _key: resolvedCategoryRef._ref }],
          }
        : {}),
      ...(classificationId
        ? { productClassification: { _type: "reference", _ref: classificationId } }
        : {}),
      ...(brandId ? { brand: { _type: "reference", _ref: brandId } } : {}),
      ...(storeId ? { store: { _type: "reference", _ref: storeId } } : {}),
    };

    const createdProduct = await writeClient.create(newDoc);
    await logAdminAction("info", "Product created", { productId: createdProduct._id, name: createdProduct.name }, userId);

    return NextResponse.json({
      success: true,
      product: {
        id: createdProduct._id,
        _id: createdProduct._id,
        name: createdProduct.name,
        price: createdProduct.price,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
