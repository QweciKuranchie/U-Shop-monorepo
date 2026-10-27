import { client, writeClient } from "@repo/sanity";
import { NextRequest, NextResponse } from "next/server";
import { pickAllowedFields, normalizeListingScalars, SELLER_LISTING_FIELDS } from "@repo/utils";
import { requireActiveStore } from "@/lib/activeStore";
import { parseMedia } from "@/lib/media";
import { buyerPriceFromSellerPrice } from "@repo/utils/platform-fee";
import { roundMoney } from "@repo/utils/pricing";
import { parseWarranty } from "@/lib/warranty";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireActiveStore();
  if (guard instanceof NextResponse) return guard;
  const { store } = guard;

  const { id } = await params;

  // Verify the product belongs to the seller's store
  const product = await client.fetch(
    `*[_type == "product" && _id == $id && store._ref == $storeId][0]{ _id }`,
    { id, storeId: store._id }
  );
  if (!product) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  // Allow-list: anything not named in SELLER_LISTING_FIELDS (ownership, deal
  // flags, status, slug, ratings, sellerPrice…) is silently ignored.
  const updates = pickAllowedFields(await request.json().catch(() => null), SELLER_LISTING_FIELDS);
  if (!updates || Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No permitted fields to update" }, { status: 400 });
  }
  const scalars = normalizeListingScalars(updates);
  if (!scalars.ok) return NextResponse.json({ error: scalars.error }, { status: 400 });
  Object.assign(updates, scalars.data);
  // The seller sends their own price; the listing price adds the 8% platform fee.
  if ("price" in updates) {
    const sellerPrice = roundMoney(Number((updates as Record<string, unknown>).price));
    if (!Number.isFinite(sellerPrice) || sellerPrice <= 0 || sellerPrice > 1_000_000) {
      return NextResponse.json({ error: "Enter a price between 0.01 and 1,000,000" }, { status: 400 });
    }
    Object.assign(updates, { sellerPrice, price: buyerPriceFromSellerPrice(sellerPrice) });
  }
  const unset: string[] = [];
  // Images/video are validated and normalised (ImageKit URLs only, max 8 photos).
  if ("images" in updates || "video" in updates) {
    const media = parseMedia(updates as Record<string, unknown>);
    if ("error" in media) return NextResponse.json({ error: media.error }, { status: 400 });
    delete (updates as Record<string, unknown>).images;
    delete (updates as Record<string, unknown>).video;
    Object.assign(updates, media.data);
    unset.push(...media.unset);
  }
  // Warranty fields are validated and stored as one block, and cleared when
  // the seller switches to "no warranty".
  if ("warrantyType" in updates || "warrantyDuration" in updates || "freeTechSupport" in updates) {
    const warranty = parseWarranty(updates as Record<string, unknown>);
    if ("error" in warranty) return NextResponse.json({ error: warranty.error }, { status: 400 });
    for (const k of ["warrantyDuration", "warrantyDescription"] as const)
      if (!(k in warranty.data)) { unset.push(k); delete (updates as Record<string, unknown>)[k]; }
    Object.assign(updates, warranty.data);
  }
  let patch = writeClient.patch(id).set(updates);
  if (unset.length) patch = patch.unset(unset);
  const updated = await patch.commit();
  return NextResponse.json({ product: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireActiveStore();
  if (guard instanceof NextResponse) return guard;
  const { store } = guard;

  const { id } = await params;

  // Verify the product belongs to the seller's store
  const product = await client.fetch(
    `*[_type == "product" && _id == $id && store._ref == $storeId][0]{ _id }`,
    { id, storeId: store._id }
  );
  if (!product) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  await writeClient.delete(id);
  return NextResponse.json({ success: true });
}