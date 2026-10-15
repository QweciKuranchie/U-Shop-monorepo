/**
 * Platform fee: the price a buyer sees is the seller's price plus 8%.
 *
 *   buyer price  = seller price x 1.08
 *   seller share = buyer-paid amount / 1.08   (the fee is 8% of the seller's price)
 *
 * Pure module (no I/O), shared by the seller app and the storefront.
 */
import { roundMoney } from "./pricing";

export const PLATFORM_FEE_RATE = 0.08;
export const PLATFORM_FEE_PERCENT = PLATFORM_FEE_RATE * 100;

/** The listing price buyers pay for a seller's price. */
export function buyerPriceFromSellerPrice(sellerPrice: number): number {
  return roundMoney((Number(sellerPrice) || 0) * (1 + PLATFORM_FEE_RATE));
}

/** The seller's share of an amount a buyer paid (price at purchase, discount applied). */
export function sellerShareOfAmount(buyerAmount: number): number {
  return roundMoney((Number(buyerAmount) || 0) / (1 + PLATFORM_FEE_RATE));
}

/** The platform's cut of an amount a buyer paid. */
export function platformFeeOfAmount(buyerAmount: number): number {
  const amount = Number(buyerAmount) || 0;
  return roundMoney(amount - sellerShareOfAmount(amount));
}
