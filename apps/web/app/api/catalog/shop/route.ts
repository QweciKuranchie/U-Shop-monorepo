import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/sanity";
import { buildShopParams, buildShopQuery, parseShopSort } from "@repo/sanity/shop";
import { checkRateLimit } from "@repo/utils/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Public shop catalogue, filtered. The /shop page used to query Sanity directly
 * from the browser, which required the entire dataset to be publicly readable.
 * This endpoint runs ONE fixed query (text lives in @repo/sanity/shop); callers
 * only supply validated filter values, never GROQ.
 */
const text = (v: string | null, max = 100): string | null => {
  if (v === null) return null;
  const t = v.trim();
  return t && t.length <= max ? t : null;
};

export async function GET(request: NextRequest) {
  const limited = await checkRateLimit(request, "catalog-shop", { limit: 90, windowMs: 60_000 });
  if (limited) return limited;

  const sp = request.nextUrl.searchParams;
  const price = text(sp.get("price"), 20);
  if (price && !/^\d{1,7}-\d{1,7}$/.test(price)) {
    return NextResponse.json({ error: "Invalid price range" }, { status: 400 });
  }

  const products = await client.fetch(
    buildShopQuery(sp.get("specs") === "1", parseShopSort(sp.get("sort"))),
    buildShopParams({
      searchQuery: text(sp.get("q"), 80),
      classification: text(sp.get("classification")),
      category: text(sp.get("category")),
      brand: text(sp.get("brand")),
      price,
      condition: text(sp.get("condition"), 40),
      warranty: text(sp.get("warranty"), 40),
    }),
    { next: { revalidate: 60 } }
  );
  return NextResponse.json(products ?? [], {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
