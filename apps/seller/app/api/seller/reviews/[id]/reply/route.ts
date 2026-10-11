import { createServerClient } from "@repo/supabase/server";
import { client, writeClient } from "@repo/sanity";
import { SELLER_STORE_QUERY } from "@repo/sanity/queries";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

/** Returns the seller's store id if the review is on one of their products. */
async function authorise(id: string): Promise<{ error: NextResponse } | { ok: true }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const store = await client.fetch(SELLER_STORE_QUERY, { userId: user.id });
  if (!store) return { error: NextResponse.json({ error: "Store not found" }, { status: 404 }) };

  const review = await client.fetch(
    `*[_type == "review" && _id == $id && product->store._ref == $storeId][0]{ _id }`,
    { id, storeId: store._id }
  );
  if (!review) return { error: NextResponse.json({ error: "Review not found" }, { status: 404 }) };
  return { ok: true };
}

/** Create or replace the seller's public reply to a review. */
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const auth = await authorise(id);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (text.length < 2 || text.length > 500)
    return NextResponse.json({ error: "Reply must be between 2 and 500 characters" }, { status: 400 });

  await writeClient
    .patch(id)
    .set({ sellerReply: { text, repliedAt: new Date().toISOString() } })
    .commit();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const auth = await authorise(id);
  if ("error" in auth) return auth.error;
  await writeClient.patch(id).unset(["sellerReply"]).commit();
  return NextResponse.json({ ok: true });
}
