/**
 * Which cache tags a changed Sanity document type invalidates.
 *
 * The data layer (`packages/sanity/src/queries/index.ts`) tags every
 * `unstable_cache` entry, but nothing ever called `revalidateTag`, so a price or
 * stock change could take 5–30 minutes to appear. This map is the other half.
 * Keep it in sync with the `tags:` arrays in that file.
 */
const TAGS_BY_TYPE: Readonly<Record<string, readonly string[]>> = {
  product: ["products", "featured", "homepage", "deals", "popular", "new-arrivals", "reviews"],
  category: ["categories", "featured", "homepage", "navigation"],
  brand: ["brands", "products"],
  banner: ["banners", "homepage"],
  homepageBanner: ["banners", "homepage"],
  store: ["stores", "products"],
  location: ["locations", "universities", "products"],
  university: ["locations", "universities", "products"],
  productClassification: ["classifications"],
  review: ["reviews", "products", "popular"],
};

/** Tags to revalidate for a document type; empty for types we don't cache (orders, users…). */
export function tagsForDocumentType(type: unknown): string[] {
  if (typeof type !== "string" || !Object.prototype.hasOwnProperty.call(TAGS_BY_TYPE, type)) {
    return [];
  }
  return [...TAGS_BY_TYPE[type]];
}
