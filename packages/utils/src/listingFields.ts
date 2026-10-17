/**
 * What a seller may write on their own product listing, and how those values are
 * bounded. Used by the seller listings API (POST and PATCH).
 *
 * This is an ALLOW-list. The previous PATCH used a deny-list, so every field not
 * remembered in it (`status`, `isFlashSale`, `isStudentDeal`, `slug`, `category`…)
 * was seller-writable, letting a seller stamp their own items as flash-sale or
 * clearance deals. New product fields are now read-only for sellers by default.
 */
export const SELLER_LISTING_FIELDS = [
  "name",
  "description",
  "highlights",
  "condition",
  "price",
  "discount",
  "stock",
  "sellerSku",
  "images",
  "video",
  "warrantyType",
  "warrantyDuration",
  "warrantyDescription",
  "freeTechSupport",
] as const;

export const MAX_LISTING_NAME = 150;
export const MAX_LISTING_DESCRIPTION = 5000;
export const MAX_LISTING_DISCOUNT = 90;
export const MAX_LISTING_STOCK = 100_000;
const MAX_SHORT_TEXT = 60;

export type ListingScalarResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string };

const isBlank = (v: unknown) => v === undefined || v === null || v === "";

/**
 * Validate and normalise the scalar fields present in `src`. Only keys that are
 * present are returned, so it works for partial (PATCH) and full (POST) bodies.
 * Numbers must be finite integers inside their range; text is trimmed and capped.
 */
export function normalizeListingScalars(src: Record<string, unknown>): ListingScalarResult {
  const out: Record<string, unknown> = {};

  if ("name" in src) {
    const name = typeof src.name === "string" ? src.name.trim() : "";
    if (name.length < 2 || name.length > MAX_LISTING_NAME) {
      return { ok: false, error: `Title must be 2–${MAX_LISTING_NAME} characters` };
    }
    out.name = name;
  }

  if ("description" in src && !isBlank(src.description)) {
    if (typeof src.description !== "string" || src.description.length > MAX_LISTING_DESCRIPTION) {
      return { ok: false, error: `Description must be at most ${MAX_LISTING_DESCRIPTION} characters` };
    }
    out.description = src.description;
  } else if ("description" in src) {
    out.description = "";
  }

  for (const key of ["condition", "sellerSku"] as const) {
    if (key in src && !isBlank(src[key])) {
      if (typeof src[key] !== "string" || (src[key] as string).length > MAX_SHORT_TEXT) {
        return { ok: false, error: `Invalid ${key}` };
      }
      out[key] = (src[key] as string).trim();
    }
  }

  if ("discount" in src) {
    const d = isBlank(src.discount) ? 0 : Number(src.discount);
    if (!Number.isInteger(d) || d < 0 || d > MAX_LISTING_DISCOUNT) {
      return { ok: false, error: `Discount must be a whole number from 0 to ${MAX_LISTING_DISCOUNT}` };
    }
    out.discount = d;
  }

  if ("stock" in src) {
    const s = isBlank(src.stock) ? 1 : Number(src.stock);
    if (!Number.isInteger(s) || s < 0 || s > MAX_LISTING_STOCK) {
      return { ok: false, error: `Stock must be a whole number from 0 to ${MAX_LISTING_STOCK}` };
    }
    out.stock = s;
  }

  return { ok: true, data: out };
}
