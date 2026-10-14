import type { Product } from "@repo/sanity";

/**
 * Which products belong on each /deals/[slug] page. Extracted verbatim from the page
 * so the rule is unit-tested against the previous inline logic.
 */
export function filterDealProducts(dealKey: string, products: readonly Product[]): Product[] {
  switch (dealKey) {
    case "flash":
      return products.filter((p) => p.isFlashSale || p.status === "hot" || (p.discount && p.discount >= 20));
    case "students":
      return products.filter((p) => Boolean(p.discount || p.isFlashSale || p.featured));
    case "clearance":
      return products.filter(
        (p) => (p.discount && p.discount > 0) || (p.status as string) === "refurbished" || p.status === "good"
      );
    case "black-friday":
      return products.filter((p) => Boolean(p.discount || p.isFlashSale || p.status === "hot"));
    default:
      return products.filter((p) => Boolean(p.discount || p.featured || p.isFlashSale));
  }
}

/** The matching products, or everything we have when nothing matches (unchanged behaviour). */
export function pickDisplayProducts(dealKey: string, raw: readonly Product[]): Product[] {
  const filtered = filterDealProducts(dealKey, raw);
  return filtered.length > 0 ? filtered : [...raw];
}
