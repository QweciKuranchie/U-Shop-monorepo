import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { writeClient } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";
import { isLowStock } from "@/lib/inventory";

export const dynamic = "force-dynamic";

/**
 * Restock a product.
 *
 * Unlike the source platform (three separate writes inside a "transaction"
 * that did not actually share a transaction), the stock increment, the
 * `restock` record and the `stockMovement` entry are committed in ONE Sanity
 * transaction guarded by the product's revision, so concurrent restocks can
 * never lose an update or leave the ledger out of sync.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { productId } = await params;

  let body: { quantity?: unknown; notes?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const quantity = Number(body.quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "Quantity must be a positive whole number" }, { status: 400 });
  }
  if (quantity > 100000) {
    return NextResponse.json({ error: "Quantity is unreasonably large (max 100,000 per restock)" }, { status: 400 });
  }
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 1000) : "";

  try {
    const product = await writeClient.fetch<{ _id: string; _rev: string; name?: string; stock?: number } | null>(
      `*[_type == "product" && _id == $productId][0]{ _id, _rev, name, stock }`,
      { productId }
    );
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const user = await currentUser().catch(() => null);
    const actorName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "" : "";
    const now = new Date().toISOString();
    const stockAfter = (product.stock ?? 0) + quantity;
    const productRef = { _type: "reference" as const, _ref: product._id };

    try {
      await writeClient
        .transaction()
        .patch(product._id, (p) => p.ifRevisionId(product._rev).set({ stock: stockAfter }))
        .create({
          _type: "restock",
          product: productRef,
          quantity,
          notes: notes || undefined,
          actorClerkId: guard.userId,
          actorName: actorName || undefined,
          createdAt: now,
        })
        .create({
          _type: "stockMovement",
          product: productRef,
          quantity,
          reason: "restock",
          stockAfter,
          actorClerkId: guard.userId,
          createdAt: now,
        })
        .commit();
    } catch (error) {
      const status = (error as { statusCode?: number })?.statusCode;
      if (status === 409) {
        return NextResponse.json({ error: "Stock changed while restocking. Please try again." }, { status: 409 });
      }
      throw error;
    }

    await logAdminAction(
      "info",
      "Product restocked",
      { productId: product._id, product: product.name, quantity, stockAfter },
      guard.userId
    );

    return NextResponse.json({ success: true, stock: stockAfter, isLowStock: isLowStock(stockAfter) });
  } catch (error) {
    console.error("Error restocking product:", error);
    return NextResponse.json({ error: "Failed to restock product" }, { status: 500 });
  }
}
