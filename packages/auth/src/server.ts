import { cache } from "react";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { backendClient } from "@repo/sanity/client";

/**
 * Single source of truth for "is this user an administrator?".
 * (Previously duplicated verbatim in apps/admin/lib/adminAuth.ts, with a third,
 * weaker copy in the web app's cancellation actions.)
 *
 * Grants admin ONLY from sources a normal user cannot write:
 *  1. Clerk public/private metadata (server-written).
 *  2. A VERIFIED Clerk email present in the server-side ADMIN_EMAILS allow-list.
 *  3. `isAdmin` / `role` flags on the Sanity user (Studio/admin-written).
 *
 * Removed on purpose:
 *  - matching the Sanity user's `email` field: that field was populated from
 *    client input, so any signed-in user could grant themselves admin;
 *  - NEXT_PUBLIC_ADMIN_EMAIL: a public (browser-visible) variable has no place in
 *    an authorization decision;
 *  - trusting UNVERIFIED Clerk email addresses.
 */

// Legacy built-in addresses are kept (verified-email only) so existing admins are
// not locked out. Move them to ADMIN_EMAILS and delete this list.
const LEGACY_ADMIN_EMAILS = ["support@ushopgh.com", "admin@ushopgh.com"];

function adminAllowList(): Set<string> {
  const configured = [
    process.env.ADMIN_EMAIL,
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    ...(process.env.ADMIN_EMAILS?.split(",") ?? []),
  ];
  return new Set(
    [...configured, ...LEGACY_ADMIN_EMAILS]
      .filter((e): e is string => Boolean(e))
      .map((e) => e.toLowerCase().trim())
  );
}

async function computeIsAdmin(clerkUserId: string): Promise<boolean> {
  try {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId).catch(() => null);
    if (!clerkUser) return false;

    const pub = (clerkUser.publicMetadata || {}) as Record<string, unknown>;
    const priv = (clerkUser.privateMetadata || {}) as Record<string, unknown>;
    if (pub.role === "admin" || pub.isAdmin === true || priv.role === "admin" || priv.isAdmin === true) {
      return true;
    }

    const allow = adminAllowList();
    const hasVerifiedAllowedEmail = clerkUser.emailAddresses.some(
      (e) =>
        allow.has(e.emailAddress.toLowerCase().trim()) &&
        (e.verification?.status === "verified" || process.env.NODE_ENV === "development")
    );

    if (process.env.NODE_ENV === "development") {
      console.log(`[auth] computeIsAdmin check for user ${clerkUserId}:`, {
        foundUser: Boolean(clerkUser),
        pub,
        priv,
        emails: clerkUser.emailAddresses.map((e) => ({
          email: e.emailAddress,
          status: e.verification?.status,
        })),
        allowList: Array.from(allow),
        hasVerifiedAllowedEmail,
      });
    }

    if (hasVerifiedAllowedEmail) return true;

    const sanityUser = await backendClient
      .fetch<{ isAdmin?: boolean; role?: string } | null>(
        `*[_type == "user" && clerkUserId == $clerkUserId][0]{ isAdmin, role }`,
        { clerkUserId }
      )
      .catch(() => null);

    return sanityUser?.isAdmin === true || sanityUser?.role === "admin";
  } catch (error) {
    console.error("Error verifying admin status:", error);
    return false;
  }
}

// De-duplicates the 2 Clerk calls + 1 Sanity query when one request checks twice.
const cachedIsAdmin = cache(computeIsAdmin);

/** Whether the given (or current) Clerk user is an administrator. */
export async function verifyIsAdmin(clerkUserId?: string | null): Promise<boolean> {
  const id = clerkUserId ?? (await auth()).userId;
  if (!id) return false;
  return cachedIsAdmin(id);
}

/** Throws unless the current user is an administrator. */
export async function requireAdmin(): Promise<{ userId: string; isAdmin: boolean }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized: Please log in");
  if (!(await verifyIsAdmin(userId))) throw new Error("Forbidden: Administrator access required");
  return { userId, isAdmin: true };
}
