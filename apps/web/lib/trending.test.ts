import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { topRated } from "./trending";

const p = (id: string, averageRating?: number | null, rating?: number) => ({ _id: id, averageRating, rating });

describe("topRated", () => {
  it("ranks by averageRating, highest first (the old code read a nonexistent `rating` and ranked nothing)", () => {
    const out = topRated([p("a", 3), p("b", 5), p("c", 4.5), p("d", 0)]);
    assert.deepEqual(out.map((x) => x._id), ["b", "c", "a", "d"]);
  });

  it("keeps list order for ties and for unrated products (stable)", () => {
    const out = topRated([p("a"), p("b", null), p("c", 0), p("d", 4), p("e", 4)]);
    assert.deepEqual(out.map((x) => x._id), ["d", "e", "a", "b", "c"]);
  });

  it("still honours a legacy `rating` when averageRating is absent", () => {
    assert.deepEqual(topRated([p("a", undefined, 2), p("b", undefined, 5)]).map((x) => x._id), ["b", "a"]);
  });

  it("limits the result, never mutates its input, and handles empty input", () => {
    const input = Array.from({ length: 30 }, (_, i) => p(`p${i}`, i % 5));
    const snapshot = input.map((x) => x._id);
    assert.equal(topRated(input).length, 10);
    assert.equal(topRated(input, 3).length, 3);
    assert.deepEqual(input.map((x) => x._id), snapshot);
    assert.deepEqual(topRated([]), []);
  });
});
