import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluate, parse } from "groq-js";
import { buildShopParams, buildShopQuery, parseShopSort, type ShopFilters } from "./shopQuery";

/** The query exactly as Shop.tsx ran it before this change (parity oracle). */
const LEGACY_QUERY = `
  *[_type == 'product' 
    && (!defined($searchPattern) || name match $searchPattern || description match $searchPattern)
    && (!defined($selectedClassification) || productClassification->slug.current == $selectedClassification || productClassification->_id == $selectedClassification)
    && (!defined($selectedCategory) || references(*[_type == "category" && (slug.current == $selectedCategory || parent->slug.current == $selectedCategory || parent->parent->slug.current == $selectedCategory)]._id))
    && (!defined($selectedBrand) || references(*[_type == "brand" && slug.current == $selectedBrand]._id))
    && (!defined($selectedCondition) || status == $selectedCondition || attributes.condition == $selectedCondition)
    && (!defined($selectedWarranty) || warrantyType == $selectedWarranty)
    && price >= $minPrice && price <= $maxPrice
  ] 
  | order(name asc) {
    ...,
    "categories": categories[]->title,
    attributeValues[]{
      ...,
      attribute->{ _id, title, slug, type }
    }
  }`;

const ref = (id: string) => ({ _type: "reference", _ref: id });
const dataset: any[] = [
  { _id: "cat-root", _type: "category", title: "Electronics", slug: { current: "electronics" } },
  { _id: "cat-phones", _type: "category", title: "Phones", slug: { current: "phones" }, parent: ref("cat-root") },
  { _id: "cat-android", _type: "category", title: "Android", slug: { current: "android" }, parent: ref("cat-phones") },
  { _id: "cat-books", _type: "category", title: "Books", slug: { current: "books" } },
  { _id: "b-apple", _type: "brand", name: "Apple", slug: { current: "apple" } },
  { _id: "b-tecno", _type: "brand", name: "Tecno", slug: { current: "tecno" } },
  { _id: "cl-new", _type: "productClassification", title: "Brand new", slug: { current: "brand-new" } },
  { _id: "a-ram", _type: "attribute", title: "RAM", slug: { current: "ram" }, type: "select" },
  {
    _id: "p1", _type: "product", name: "Apple iPhone", description: "flagship phone", price: 900, stock: 3, status: "new",
    slug: { current: "iphone" }, categories: [{ _key: "a", ...ref("cat-phones") }], brand: ref("b-apple"),
    productClassification: ref("cl-new"), warrantyType: "1-year", averageRating: 4.5, totalReviews: 10,
    images: [{ _key: "1" }, { _key: "2" }, { _key: "3" }, { _key: "4" }, { _key: "5" }],
    attributeValues: [{ _key: "v1", attribute: ref("a-ram"), valueSelect: "8GB" }],
    longBlob: "x".repeat(2000),
  },
  {
    _id: "p2", _type: "product", name: "Tecno Spark", description: "budget android", price: 150, stock: 9, status: "refurbished",
    slug: { current: "spark" }, categories: [{ _key: "a", ...ref("cat-android") }], brand: ref("b-tecno"),
    attributes: { condition: "good" }, averageRating: 3, totalReviews: 2, images: [{ _key: "1" }],
    attributeValues: [{ _key: "v1", attribute: ref("a-ram"), valueSelect: "4GB" }],
  },
  { _id: "p3", _type: "product", name: "Novel", description: "a book", price: 20, stock: 1, status: "new", slug: { current: "novel" }, categories: [{ _key: "a", ...ref("cat-books") }] },
  { _id: "p4", _type: "product", name: "No price item", description: "x", stock: 1 }, // excluded by the price window (legacy behaviour)
  { _id: "p5", _type: "product", name: "Luxury", description: "x", price: 250000, stock: 1, status: "new" }, // above the default window
];

const FILTERS: Array<[string, ShopFilters]> = [
  ["no filters", {}],
  ["search substring", { searchQuery: "phone" }],
  ["parent category covers grand-children", { category: "electronics" }],
  ["child category", { category: "android" }],
  ["brand", { brand: "tecno" }],
  ["classification by slug", { classification: "brand-new" }],
  ["classification by id", { classification: "cl-new" }],
  ["condition via status", { condition: "new" }],
  ["condition via attributes.condition", { condition: "good" }],
  ["warranty", { warranty: "1-year" }],
  ["price range", { price: "100-500" }],
  ["combined", { category: "phones", brand: "apple", condition: "new", price: "0-1000" }],
  ["nothing matches", { category: "books", brand: "apple" }],
];

const exec = async (query: string, f: ShopFilters) => {
  const params = buildShopParams(f);
  return (await (await evaluate(parse(query, { params }), { dataset, params })).get()) as any[];
};

describe("shop query: parity with the legacy query", () => {
  for (const [name, f] of FILTERS) {
    it(`same products in the same order - ${name}`, async () => {
      const legacy = await exec(LEGACY_QUERY, f);
      const next = await exec(buildShopQuery(false), f);
      assert.deepEqual(next.map((p) => p._id), legacy.map((p) => p._id));
    });
  }

  it("card fields are identical to what the legacy query returned (absent == null)", async () => {
    // The old `...` spread OMITS a missing field; an explicit projection yields null.
    // Verified harmless: ProductCard, PriceView, AddToCartBtn only use ?., ??, typeof
    // checks or strict === comparisons, which treat null and undefined alike.
    const legacy = await exec(LEGACY_QUERY, {});
    const next = await exec(buildShopQuery(false), {});
    for (const n of next) {
      const l = legacy.find((x) => x._id === n._id)!;
      for (const k of ["name", "slug", "price", "stock", "status", "averageRating", "totalReviews", "categories"]) {
        assert.deepEqual(n[k] ?? null, l[k] ?? null, `${n._id}.${k}`);
      }
    }
  });
});

describe("shop query: payload", () => {
  it("returns at most 3 images, no description/extra fields, and no attributeValues by default", async () => {
    const [iphone] = (await exec(buildShopQuery(false), { searchQuery: "iphone" }));
    assert.equal(iphone.images.length, 3);
    assert.equal(iphone.attributeValues, undefined);
    assert.equal(iphone.description, undefined);
    assert.equal(iphone.longBlob, undefined);
    assert.ok(!/(\{|,)\s*\.\.\.\s*(,|\})/.test(buildShopQuery(false)), "no ... spread");
  });

  it("includes the attribute data the spec filter needs, only when asked", async () => {
    const [iphone] = (await exec(buildShopQuery(true), { searchQuery: "iphone" }));
    assert.equal(iphone.attributeValues[0].valueSelect, "8GB");
    assert.equal(iphone.attributeValues[0].attribute.slug.current, "ram");
  });
});

describe("buildShopParams", () => {
  it("keeps the old defaults and parsing", () => {
    assert.deepEqual(buildShopParams({}), {
      searchPattern: null, selectedClassification: null, selectedCategory: null, selectedBrand: null,
      selectedCondition: null, selectedWarranty: null, minPrice: 0, maxPrice: 100000,
    });
    const p = buildShopParams({ price: "100-500", searchQuery: "tv" });
    assert.equal(p.minPrice, 100);
    assert.equal(p.maxPrice, 500);
    assert.equal(p.searchPattern, "*tv*");
  });
});

describe("shop sort", () => {
  it("defaults to the original name ordering", () => {
    assert.equal(buildShopQuery(false), buildShopQuery(false, "name-asc"));
    assert.ok(buildShopQuery(false).includes("order(name asc)"));
  });

  it("maps each sort to a fixed order clause", () => {
    assert.ok(buildShopQuery(false, "price-asc").includes("order(price asc, name asc)"));
    assert.ok(buildShopQuery(false, "price-desc").includes("order(price desc, name asc)"));
    assert.ok(buildShopQuery(false, "newest").includes("order(_createdAt desc)"));
  });

  it("never lets an unknown value reach the query", () => {
    assert.equal(parseShopSort("price asc) | bad"), "name-asc");
    assert.equal(parseShopSort(null), "name-asc");
    assert.equal(parseShopSort("newest"), "newest");
  });
});
