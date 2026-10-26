import { test } from "node:test";
import assert from "node:assert/strict";
import { planReservation, quantitiesFromItems, isReservationExpired, UNPAID_HOLD_MS } from "./stockPlan";

const p = (id: string, stock: number | null | undefined, name = id) => ({ _id: id, _rev: `r-${id}`, name, stock });

test("reserves exactly what was asked and reports the new stock", () => {
  const plan = planReservation(new Map([["a", 2]]), [p("a", 5)]);
  assert.deepEqual(plan, { ok: true, updates: [{ id: "a", rev: "r-a", name: "a", quantity: 2, before: 5, after: 3 }] });
});

test("the last unit of a 1-of-1 item can be taken once, never twice", () => {
  const first = planReservation(new Map([["x", 1]]), [p("x", 1)]);
  assert.equal(first.ok, true);
  // after the first buyer's transaction the stock is 0
  const second = planReservation(new Map([["x", 1]]), [p("x", 0, "Used laptop")]);
  assert.deepEqual(second, { ok: false, code: "INSUFFICIENT_STOCK", names: ["Used laptop"] });
});

test("one short line fails the whole order (all-or-nothing)", () => {
  const plan = planReservation(new Map([["a", 1], ["b", 3]]), [p("a", 10), p("b", 2, "Phone")]);
  assert.deepEqual(plan, { ok: false, code: "INSUFFICIENT_STOCK", names: ["Phone"] });
});

test("unknown product and missing/invalid stock are rejected", () => {
  assert.deepEqual(planReservation(new Map([["gone", 1]]), []), { ok: false, code: "PRODUCT_UNAVAILABLE", names: ["gone"] });
  for (const bad of [null, undefined, NaN]) {
    assert.equal(planReservation(new Map([["a", 1]]), [p("a", bad as number)]).ok, false);
  }
  assert.equal(planReservation(new Map([["a", 0]]), [p("a", 5)]).ok, false);
  assert.equal(planReservation(new Map([["a", 1.5]]), [p("a", 5)]).ok, false);
});

test("quantitiesFromItems merges duplicate lines and skips junk", () => {
  const m = quantitiesFromItems([
    { product: { _ref: "a" }, quantity: 1 },
    { product: { _ref: "a" }, quantity: 2 },
    { productId: "b", quantity: 4 },
    { product: { _ref: "c" }, quantity: 0 },
    { product: null, quantity: 3 },
  ]);
  assert.deepEqual([...m], [["a", 3], ["b", 4]]);
  assert.equal(quantitiesFromItems(null).size, 0);
});

test("unpaid holds expire after the TTL only", () => {
  const now = Date.parse("2026-10-26T12:00:00Z");
  assert.equal(isReservationExpired("2026-10-26T11:20:00Z", now), true);
  assert.equal(isReservationExpired("2026-10-26T11:45:00Z", now), false);
  assert.equal(isReservationExpired(undefined, now), false);
  assert.equal(UNPAID_HOLD_MS, 30 * 60 * 1000);
});
