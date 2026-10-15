import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buyerPriceFromSellerPrice,
  platformFeeOfAmount,
  sellerShareOfAmount,
} from "./platformFee";

describe("platform fee", () => {
  it("adds 8% to the seller price", () => {
    assert.equal(buyerPriceFromSellerPrice(100), 108);
    assert.equal(buyerPriceFromSellerPrice(2500), 2700);
    assert.equal(buyerPriceFromSellerPrice(49.99), 53.99);
  });

  it("gives the seller their price back from what the buyer paid", () => {
    assert.equal(sellerShareOfAmount(108), 100);
    assert.equal(sellerShareOfAmount(2700), 2500);
  });

  it("splits a payment into seller share plus fee with nothing lost", () => {
    for (const paid of [108, 53.99, 1234.56, 0.01]) {
      assert.equal(
        Math.round((sellerShareOfAmount(paid) + platformFeeOfAmount(paid)) * 100),
        Math.round(paid * 100)
      );
    }
    assert.equal(platformFeeOfAmount(108), 8);
  });

  it("treats bad input as zero", () => {
    assert.equal(buyerPriceFromSellerPrice(Number.NaN), 0);
    assert.equal(sellerShareOfAmount(Number("x")), 0);
  });
});
