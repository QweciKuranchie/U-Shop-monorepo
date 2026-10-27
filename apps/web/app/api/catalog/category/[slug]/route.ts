import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/sanity";
import { checkRateLimit } from "@repo/utils/rate-limit";

export const dynamic = "force-dynamic";

/** Categories plus the products in one category (public catalogue data), fixed queries only. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const limited = await checkRateLimit(request, "catalog-category", { limit: 90, windowMs: 60_000 });
  if (limited) return limited;

  const { slug } = await params;
  if (!/^[a-z0-9][a-z0-9-]{0,99}$/i.test(slug)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const [categories, products] = await Promise.all([
    client.fetch(
      `*[_type == "category"] { _id, title, slug, description, image, featured, range }`,
      {},
      { next: { revalidate: 300 } }
    ),
    client.fetch(
      `*[_type == "product" && references(*[_type == "category" && slug.current == $slug]._id)] {
        ..., brand->{ _id, title }
      }`,
      { slug },
      { next: { revalidate: 60 } }
    ),
  ]);
  return NextResponse.json(
    { categories: categories ?? [], products: products ?? [] },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
