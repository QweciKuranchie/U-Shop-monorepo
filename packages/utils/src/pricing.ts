/**
 * Checkout pricing — the single source of truth.
 *
 * Previously these formulas lived inline in `CheckoutContent.tsx` and the
 * resulting totals were POSTed to the server, which trusted them. They now live
 * here so that:
 *   - the checkout UI uses them for display, and
 *   - the order API uses the very same function with server-fetched prices as
 *     the authority.
 *
 * This module is pure (no I/O, no Next.js imports) so it is safe for both
 * client and server bundles and trivially unit-testable.
 */

export const FREE_SHIPPING_THRESHOLD = 500;
export const BUSINESS_DISCOUNT_RATE = 0.02;
export const DEFAULT_SHIPPING_FEE = 20;
const OTHER_REGIONS_FEE = 35;

/** Evaluated in order; first match wins (mirrors the original if-chain). */
const SHIPPING_ZONES: ReadonlyArray<{ fee: number; keywords: readonly string[] }> = [
  {
    fee: 15, // Greater Accra
    keywords: [
      "accra", "tema", "legon", "madina", "spintex",
      "east legon", "kasoa", "adenta", "dome", "achimota",
    ],
  },
  { fee: 25, keywords: ["kumasi", "obuasi", "ashanti"] }, // Ashanti
];

/** Cheapest delivery fee (Greater Accra), for "from GH₵X" copy. */
export const MIN_SHIPPING_FEE = Math.min(
  DEFAULT_SHIPPING_FEE,
  OTHER_REGIONS_FEE,
  ...SHIPPING_ZONES.map((z) => z.fee)
);

export type PromoType = "percentage" | "fixed";

export interface PromoDefinition {
  type: PromoType;
  amount: number;
}

export interface AppliedPromo extends PromoDefinition {
  code: string;
}

/**
 * Promo registry. These are the two codes that were previously hard-coded as a
 * "mock" in the checkout component. Keeping them here (server-evaluated) keeps
 * behaviour identical while removing client authority.
 *
 * TODO: replace with a Sanity `promoCode` document (expiry, usage limits).
 */
export const PROMO_CODES: Readonly<Record<string, PromoDefinition>> = Object.freeze({
  SAVE10: { type: "percentage", amount: 10 },
  FLAT20: { type: "fixed", amount: 20 },
});

export function resolvePromoCode(code?: string | null): AppliedPromo | null {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  if (!normalized || !Object.prototype.hasOwnProperty.call(PROMO_CODES, normalized)) {
    return null;
  }
  return { code: normalized, ...PROMO_CODES[normalized] };
}

export interface PricingLine {
  /** Current (already discounted) unit price, GHS. */
  price?: number | null;
  /** Discount percentage that was applied to reach `price`. */
  discount?: number | null;
  quantity: number;
}

export interface PricingAddress {
  city?: string | null;
  state?: string | null;
  address?: string | null;
}

export interface ComputeTotalsInput {
  lines: readonly PricingLine[];
  isBusiness?: boolean;
  promoCode?: string | null;
  address?: PricingAddress | null;
}

export interface OrderTotals {
  /** Pre-discount list value (display only). */
  grossSubtotal: number;
  /** Product-level discount total (display only). */
  productDiscount: number;
  /** Sum of price × quantity before account/promo discounts. */
  currentSubtotal: number;
  businessDiscount: number;
  /** Subtotal after business discount; what `order.subtotal` stores. */
  subtotal: number;
  promoDiscount: number;
  promo: AppliedPromo | null;
  shipping: number;
  tax: number;
  /** Final payable amount, GHS. */
  total: number;
}

/**
 * Round to whole pesewas. Deliberately the SAME operation the payment layer uses
 * to convert GHS → pesewas (`Math.round(amount * 100)`), so a total rounded here
 * is exactly the amount that is charged.
 */
export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

const safeNumber = (n: number | null | undefined): number =>
  typeof n === "number" && Number.isFinite(n) ? n : 0;

export function calculateShippingFee(
  address: PricingAddress | null | undefined,
  subtotal: number
): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  if (!address) return DEFAULT_SHIPPING_FEE;

  const location = `${address.city || ""} ${address.state || ""} ${address.address || ""}`.toLowerCase();
  for (const zone of SHIPPING_ZONES) {
    if (zone.keywords.some((keyword) => location.includes(keyword))) return zone.fee;
  }
  return OTHER_REGIONS_FEE;
}

export function computeOrderTotals(input: ComputeTotalsInput): OrderTotals {
  let gross = 0;
  let discount = 0;

  for (const line of input.lines) {
    const price = safeNumber(line.price);
    const pct = safeNumber(line.discount);
    const qty = Math.max(0, Math.floor(safeNumber(line.quantity)));
    const discountPerUnit = (pct * price) / 100;
    gross += (price + discountPerUnit) * qty;
    discount += discountPerUnit * qty;
  }
  // Same expression order as the legacy checkout (`gross - discount`, NOT a
  // direct sum of price × qty). The two are algebraically equal but differ in
  // float noise, and on exact half-pesewa ties (e.g. SAVE10 on GHS 935.55 →
  // 841.995) that noise decides whether the customer is charged .99 or 1.00.
  // Replicating the order keeps every previously-charged amount unchanged.
  const current = gross - discount;

  // Rounding policy: keep full precision through the whole calculation and round
  // only what we REPORT. This reproduces the amounts customers were charged
  // before this refactor to the pesewa (rounding each intermediate instead drifts
  // by 0.01 on some carts). Displayed lines may therefore differ from the total
  // by a pesewa, exactly as they did before.
  const businessExact = input.isBusiness ? current * BUSINESS_DISCOUNT_RATE : 0;
  const subtotalExact = current - businessExact;

  const promo = resolvePromoCode(input.promoCode);
  const promoExact = promo
    ? promo.type === "percentage"
      ? (subtotalExact * promo.amount) / 100
      : promo.amount
    : 0;

  // Free-shipping threshold is evaluated on the pre-promo subtotal (unchanged),
  // but on the pesewa-rounded value so float noise such as 499.99999999999994
  // can't deny free shipping to a cart that is exactly GHS 500.00.
  const shipping = calculateShippingFee(input.address, roundMoney(subtotalExact));
  const tax = 0; // Tax removed from the order summary (unchanged).
  const totalExact = Math.max(0, subtotalExact - promoExact + shipping + tax);

  return {
    grossSubtotal: roundMoney(gross),
    productDiscount: roundMoney(discount),
    currentSubtotal: roundMoney(current),
    businessDiscount: roundMoney(businessExact),
    subtotal: roundMoney(subtotalExact),
    promoDiscount: roundMoney(promoExact),
    promo,
    shipping,
    tax,
    total: roundMoney(totalExact),
  };
}
