import { test } from "node:test";
import assert from "node:assert/strict";
import { SELLER_LISTING_FIELDS, normalizeListingScalars } from "./listingFields";
import { pickAllowedFields } from "./safePatch";

test("allow-list drops merchandising and ownership fields a seller must not set", () => {
  const body = {
    name: "Laptop",
    price: 100,
    isFlashSale: true,
    isStudentDeal: true,
    isClearance: true,
    status: "hot",
    featured: true,
    store: { _ref: "someone-else" },
    slug: { current: "x" },
    "store._ref": "someone-else",
    "isFlashSale[0]": true,
  };
  const out = pickAllowedFields(body, SELLER_LISTING_FIELDS)!;
  assert.deepEqual(Object.keys(out).sort(), ["name", "price"]);
});

test("discount is bounded to 0..90 whole numbers", () => {
  for (const bad of [-1, 91, 1000, 12.5, "abc", NaN, Infinity]) {
    assert.equal(normalizeListingScalars({ discount: bad }).ok, false, `discount ${String(bad)}`);
  }
  assert.deepEqual(normalizeListingScalars({ discount: "15" }), { ok: true, data: { discount: 15 } });
  assert.deepEqual(normalizeListingScalars({ discount: "" }), { ok: true, data: { discount: 0 } });
});

test("stock is a bounded non-negative integer", () => {
  for (const bad of [-5, 1e9, 1.5, "lots"]) {
    assert.equal(normalizeListingScalars({ stock: bad }).ok, false, `stock ${String(bad)}`);
  }
  assert.deepEqual(normalizeListingScalars({ stock: 0 }), { ok: true, data: { stock: 0 } });
  assert.deepEqual(normalizeListingScalars({ stock: "7" }), { ok: true, data: { stock: 7 } });
});

test("name must be a trimmed string of sane length", () => {
  assert.equal(normalizeListingScalars({ name: "" }).ok, false);
  assert.equal(normalizeListingScalars({ name: "a" }).ok, false);
  assert.equal(normalizeListingScalars({ name: { $ne: 1 } }).ok, false);
  assert.equal(normalizeListingScalars({ name: "x".repeat(151) }).ok, false);
  assert.deepEqual(normalizeListingScalars({ name: "  Phone  " }), { ok: true, data: { name: "Phone" } });
});

test("absent keys are not invented (PATCH-safe)", () => {
  assert.deepEqual(normalizeListingScalars({}), { ok: true, data: {} });
});
