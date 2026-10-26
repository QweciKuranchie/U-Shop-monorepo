import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakeSanity } from "./fakeSanity";
import { createOrderReservingStock, releaseExpiredReservations } from "./stock";
import { releaseStock } from "@repo/sanity/order-stock";

const product = (id: string, stock: number) => ({ _id: id, _type: "product", name: `Product ${id}`, stock });
const order = (extra: Record<string, unknown> = {}) => ({ _type: "order", orderNumber: "ORDER-1", orderStatus: "pending", paymentStatus: "pending", paymentMethod: "cod", totalPrice: 100, currency: "GHS", items: [{ _key: "k", product: { _ref: "p1" }, quantity: 1 }], ...extra });

test("RACE: two buyers fight for the last unit of a 1-of-1 item; exactly one wins", async () => {
  const { db, all } = createFakeSanity([product("p1", 1)]);
  const [a, b] = await Promise.all([
    createOrderReservingStock(order({ orderNumber: "A" }), new Map([["p1", 1]]), "userA", db),
    createOrderReservingStock(order({ orderNumber: "B" }), new Map([["p1", 1]]), "userB", db),
  ]);
  const winners = [a, b].filter((r) => r.ok);
  const losers = [a, b].filter((r) => !r.ok);
  assert.equal(winners.length, 1, "exactly one order may be created");
  assert.equal(losers.length, 1);
  assert.deepEqual(losers[0], { ok: false, code: "INSUFFICIENT_STOCK", names: ["Product p1"] });
  assert.equal(all("order").length, 1);
  assert.equal(all("product")[0].stock, 0);
  assert.equal(all("stockMovement").length, 1);
});

test("RACE: 6 concurrent buyers, 3 units in stock: exactly 3 orders, stock never negative", async () => {
  const { db, all } = createFakeSanity([product("p1", 3)]);
  const results = await Promise.all(
    Array.from({ length: 6 }, (_, i) => createOrderReservingStock(order({ orderNumber: `O${i}` }), new Map([["p1", 1]]), `u${i}`, db))
  );
  assert.equal(results.filter((r) => r.ok).length, 3);
  assert.equal(all("order").length, 3);
  assert.equal(all("product")[0].stock, 0);
  assert.ok(results.filter((r) => !r.ok).every((r) => !r.ok && r.code === "INSUFFICIENT_STOCK"));
});

test("a multi-item order is all-or-nothing: a short second line reserves nothing", async () => {
  const { db, all } = createFakeSanity([product("p1", 5), product("p2", 0)]);
  const r = await createOrderReservingStock(order(), new Map([["p1", 2], ["p2", 1]]), "u", db);
  assert.equal(r.ok, false);
  assert.equal(all("product").find((p) => p._id === "p1")!.stock, 5);
  assert.equal(all("order").length, 0);
});

test("a double-submitted request (same document id) reserves stock only once", async () => {
  const { db, all } = createFakeSanity([product("p1", 5)]);
  const data = order({ _id: "order-abc" });
  const [a, b] = await Promise.all([
    createOrderReservingStock(data, new Map([["p1", 2]]), "u", db),
    createOrderReservingStock(data, new Map([["p1", 2]]), "u", db),
  ]);
  assert.ok(a.ok && b.ok);
  assert.equal([a, b].filter((r) => r.ok && r.created).length, 1, "only one request actually created it");
  assert.equal(all("order").length, 1);
  assert.equal(all("product")[0].stock, 3, "decremented once, not twice");
});

test("cancelling releases stock exactly once, even if two cancel paths run at once", async () => {
  const { db, all } = createFakeSanity([product("p1", 5)]);
  const r = await createOrderReservingStock(order({ items: [{ _key: "k", product: { _ref: "p1" }, quantity: 2 }] }), new Map([["p1", 2]]), "u", db);
  assert.ok(r.ok);
  assert.equal(all("product")[0].stock, 3);
  const id = r.ok ? r.order._id : "";
  const results = await Promise.all([releaseStock(id, "customer", db), releaseStock(id, "admin", db), releaseStock(id, "system", db)]);
  assert.equal(results.filter((x) => x.released).length, 1, "only one release acts");
  assert.equal(all("product")[0].stock, 5, "stock restored once, not three times");
  assert.equal((await releaseStock(id, "again", db)).released, false);
  assert.equal(all("product")[0].stock, 5);
});

test("abandoned card orders free their stock; fresh, paid and pay-on-delivery orders are untouched", async () => {
  const old = new Date(Date.now() - 45 * 60_000).toISOString();
  const fresh = new Date(Date.now() - 5 * 60_000).toISOString();
  const base = { stockReserved: true, orderStatus: "pending", paymentStatus: "pending", items: [{ _key: "k", product: { _ref: "p1" }, quantity: 1 }] };
  const { db, docs } = createFakeSanity([
    product("p1", 0),
    { _id: "stale-card", _type: "order", ...base, paymentGateway: "paystack", orderDate: old },
    { _id: "fresh-card", _type: "order", ...base, paymentGateway: "paystack", orderDate: fresh },
    { _id: "old-cod", _type: "order", ...base, paymentGateway: "none", orderDate: old },
    { _id: "old-paid", _type: "order", ...base, paymentGateway: "paystack", paymentStatus: "paid", orderDate: old },
  ]);
  const n = await releaseExpiredReservations(["p1"], db);
  assert.equal(n, 1);
  assert.equal(docs.get("stale-card")!.orderStatus, "cancelled");
  assert.equal(docs.get("stale-card")!.stockReserved, false);
  for (const id of ["fresh-card", "old-cod", "old-paid"]) assert.equal(docs.get(id)!.orderStatus, "pending", id);
  assert.equal(docs.get("p1")!.stock, 1, "exactly one unit returned");
});
