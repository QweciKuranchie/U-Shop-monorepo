import { createServerClient } from "@repo/supabase/server";
import { client } from "@repo/sanity";
import { SELLER_STORE_QUERY } from "@repo/sanity/queries";
import { NextResponse } from "next/server";

export interface ActiveStore {
  user: { id: string };
  store: { _id: string; name?: string; status?: string; sellerType?: string };
}

/**
 * Guard for seller API routes that change marketplace data.
 *
 * The dashboard layout redirects sellers whose store is not "active", but that
 * only hides the pages: every API route is directly callable, so a seller whose
 * KYC is pending, rejected or SUSPENDED could still publish listings and move
 * orders. Mutating routes call this instead of re-implementing the lookup.
 *
 *   const guard = await requireActiveStore();
 *   if (guard instanceof NextResponse) return guard;
 *   const { user, store } = guard;
 */
export async function requireActiveStore(): Promise<ActiveStore | NextResponse> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await client.fetch(SELLER_STORE_QUERY, { userId: user.id });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  if (store.status !== "active") {
    return NextResponse.json(
      { error: "Your store is not active. Listings and orders are unavailable until it is approved." },
      { status: 403 }
    );
  }
  return { user, store };
}
