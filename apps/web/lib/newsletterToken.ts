import { createHmac, timingSafeEqual } from "crypto";

function secret(): string | null {
  return process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.CLERK_SECRET_KEY || null;
}

/** HMAC token that proves an unsubscribe link was issued by us for this email. */
export function unsubscribeToken(email: string): string | null {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key).update(email.toLowerCase().trim()).digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: unknown): boolean {
  const expected = unsubscribeToken(email);
  // No secret configured (local dev): nothing to verify against.
  if (!expected) return process.env.NODE_ENV !== "production";
  if (typeof token !== "string" || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
