import { getProductsPage } from "@repo/sanity/queries";
import { DEFAULT_CATALOG_PARAMS, toProduct } from "@repo/sanity/catalog";
import type { Product } from "@repo/sanity";

/**
 * A bounded "general products" list for pages that need something to show when
 * their own section is empty (a campus with no listings, a deal type with no deals).
 *
 * These pages used to call `getAllProducts()` for this: the ENTIRE catalogue, with
 * every field, and (on the deals page) on every request even when it was not needed.
 * This returns one page of the newest products plus the true total, served from the
 * same cached query as the /product catalogue.
 */
export async function getFallbackProducts(): Promise<{ products: Product[]; total: number }> {
  const { items, total } = await getProductsPage({ ...DEFAULT_CATALOG_PARAMS, sort: "newest" });
  return { products: items.map(toProduct), total };
}
