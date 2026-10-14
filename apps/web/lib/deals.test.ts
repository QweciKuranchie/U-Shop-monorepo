import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Product } from "@repo/sanity";
import { filterDealProducts, pickDisplayProducts } from "./deals";

/** The page's previous inline logic, copied verbatim, as the behavioural oracle. */
function legacy(dealKey: string, rawProducts: Product[]): Product[] {
  let filteredProducts: Product[] = [];
  if (dealKey === "flash") {
    filteredProducts = rawProducts.filter((p) => p.isFlashSale || p.status === "hot" || (p.discount && p.discount >= 20));
  } else if (dealKey === "students") {
    filteredProducts = rawProducts.filter((p) => Boolean(p.discount || p.isFlashSale || p.featured));
  } else if (dealKey === "clearance") {
    filteredProducts = rawProducts.filter((p) => (p.discount && p.discount > 0) || (p.status as string) === "refurbished" || p.status === "good");
  } else if (dealKey === "black-friday") {
    filteredProducts = rawProducts.filter((p) => Boolean(p.discount || p.isFlashSale || p.status === "hot"));
  } else {
    filteredProducts = rawProducts.filter((p) => Boolean(p.discount || p.featured || p.isFlashSale));
  }
  return filteredProducts.length > 0 ? filteredProducts : rawProducts;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const KEYS = ["flash", "students", "clearance", "black-friday", "special-offers", "anything-else"];
const STATUSES = ["new", "hot", "refurbished", "good", "fair", undefined];

describe("deal product selection", () => {
  it("matches the previous inline logic on 3,000 random catalogues, for every deal type", () => {
    const rand = mulberry32(7);
    for (let n = 0; n < 3000; n++) {
      const raw = Array.from({ length: Math.floor(rand() * 12) }, (_, i) => ({
        _id: `p${i}`,
        discount: rand() < 0.4 ? undefined : Math.floor(rand() * 60),
        isFlashSale: rand() < 0.2 ? true : undefined,
        featured: rand() < 0.2 ? true : undefined,
        status: STATUSES[Math.floor(rand() * STATUSES.length)],
      })) as unknown as Product[];
      for (const key of KEYS) {
        assert.deepEqual(
          pickDisplayProducts(key, raw).map((p) => p._id),
          legacy(key, raw).map((p) => p._id),
          `${key} #${n}`
        );
      }
    }
  });

  it("an empty list stays empty (nothing to fall back to)", () => {
    for (const key of KEYS) assert.deepEqual(pickDisplayProducts(key, []), []);
  });

  it("falls back to everything when nothing matches, but returns only matches otherwise", () => {
    const plain = [{ _id: "a" }, { _id: "b" }] as unknown as Product[];
    assert.equal(pickDisplayProducts("flash", plain).length, 2);
    const mixed = [{ _id: "a" }, { _id: "b", isFlashSale: true }] as unknown as Product[];
    assert.deepEqual(filterDealProducts("flash", mixed).map((p) => p._id), ["b"]);
  });
});
