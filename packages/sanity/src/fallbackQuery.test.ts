import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluate, parse } from "groq-js";
import { FIRST_PRODUCTS_QUERY } from "./fallbackQuery";

/** The removed ALL_PRODUCTS_QUERY, verbatim: the oracle for "same result, fewer documents". */
const LEGACY_ALL_PRODUCTS = `*[_type=="product"] | order(name asc){
    ...,
    "categories": categories[]->title,
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0)
  }`;

const ref = (id: string) => ({ _type: "reference", _ref: id });
// Mixed-case and duplicate names stress the ordering; ids make ties observable.
const NAMES = ["zeta", "Alpha", "alpha", "Beta", "beta", "Gamma", "delta", "Delta", "omega", "Omega", "same", "same", "same", "kappa", "Kappa"];
const dataset: any[] = [
  { _id: "c1", _type: "category", title: "Phones" },
  { _id: "c2", _type: "category", title: "Laptops" },
  ...NAMES.map((name, i) => ({
    _id: `p${String(i).padStart(2, "0")}`, _type: "product", name, price: 10 + i, stock: 1,
    categories: i % 3 === 0 ? [{ _key: "a", ...ref("c1") }, { _key: "b", ...ref("c2") }] : i % 3 === 1 ? [{ _key: "a", ...ref("c1") }] : undefined,
    averageRating: i % 4 === 0 ? 3.5 : undefined, totalReviews: i % 4 === 0 ? 7 : undefined, // stored aggregates
  })),
  { _id: "r1", _type: "review", product: ref("p01"), status: "approved", rating: 5 },
  { _id: "r2", _type: "review", product: ref("p01"), status: "approved", rating: 3 },
  { _id: "r3", _type: "review", product: ref("p01"), status: "pending", rating: 1 }, // must not count
  { _id: "r4", _type: "review", product: ref("p02"), status: "approved", rating: 4 },
];

const run = async (query: string, params: Record<string, unknown> = {}) =>
  (await (await evaluate(parse(query, { params }), { dataset, params })).get()) as any[];

describe("FIRST_PRODUCTS_QUERY replaces `ALL products then slice`", () => {
  for (const limit of [0, 1, 3, 8, 15, 50]) {
    it(`identical products, order and fields for limit=${limit}`, async () => {
      const legacy = (await run(LEGACY_ALL_PRODUCTS)).slice(0, limit);
      const next = await run(FIRST_PRODUCTS_QUERY, { limit });
      assert.deepEqual(next, legacy);
    });
  }

  it("never returns more than `limit` documents, however large the catalogue", async () => {
    const big = Array.from({ length: 500 }, (_, i) => ({ _id: `b${i}`, _type: "product", name: `n${i}` }));
    const params = { limit: 8 };
    const out = (await (await evaluate(parse(FIRST_PRODUCTS_QUERY, { params }), { dataset: big, params })).get()) as any[];
    assert.equal(out.length, 8);
  });

  it("keeps the computed fields the homepage cards use", async () => {
    const out = await run(FIRST_PRODUCTS_QUERY, { limit: 15 });
    const p01 = out.find((p) => p._id === "p01")!;
    assert.equal(p01.totalReviews, 2); // approved only
    assert.equal(p01.averageRating, 4);
    assert.deepEqual(out.find((p) => p._id === "p00")!.categories, ["Phones", "Laptops"]);
    assert.equal(out.find((p) => p._id === "p03")!.averageRating, 0); // no reviews, no stored value
  });
});
