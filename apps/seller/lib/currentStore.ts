import { createServerClient } from "@repo/supabase/server";
import { client } from "@repo/sanity";
import { SELLER_STORE_QUERY } from "@repo/sanity/queries";

/** The signed-in seller's store, or null. Every seller data page scopes its queries by `_id`. */
export async function getCurrentStore(): Promise<{ _id: string; name?: string; status?: string } | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return (await client.fetch(SELLER_STORE_QUERY, { userId: user.id })) ?? null;
}
