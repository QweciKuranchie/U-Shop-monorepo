import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";
import { logAdminAction } from "@/lib/adminLog";
import { countReferences, describeRefs } from "@/lib/references";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "hot", "like_new", "excellent", "good", "fair", "for_parts"];
const CONDITIONS = ["new", "used"];
const BOOLEAN_FLAGS = ["featured", "isFlashSale", "isStudentDeal", "isClearance", "isBlackFriday"] as const;

/**
 * Quick-edit a product's commercial fields. Stock changes through this route
 * are recorded in the stock-movement ledger (reason "adjustment") so the
 * Inventory history stays complete; use /inventory/[id]/restock to add stock.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const set: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 10 || name.length > 100) {
      return NextResponse.json({ error: "Name must be 10 to 100 characters" }, { status: 400 });
    }
    set.name = name;
  }
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
    set.price = price;
  }
  if (body.discount !== undefined) {
    const d = Number(body.discount);
    if (!Number.isFinite(d) || d < 0 || d > 100) return NextResponse.json({ error: "Discount must be between 0 and 100" }, { status: 400 });
    set.discount = d;
  }
  let newStock: number | undefined;
  if (body.stock !== undefined) {
    const s = Number(body.stock);
    if (!Number.isInteger(s) || s < 0) return NextResponse.json({ error: "Stock must be a non-negative whole number" }, { status: 400 });
    newStock = s;
    set.stock = s;
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(String(body.status))) return NextResponse.json({ error: `status must be one of ${STATUSES.join(", ")}` }, { status: 400 });
    set.status = body.status;
  }
  if (body.condition !== undefined) {
    if (!CONDITIONS.includes(String(body.condition))) return NextResponse.json({ error: `condition must be one of ${CONDITIONS.join(", ")}` }, { status: 400 });
    set.condition = body.condition;
  }
  if (body.shortDescription !== undefined) set.shortDescription = String(body.shortDescription);
  for (const flag of BOOLEAN_FLAGS) {
    if (body[flag] !== undefined) set[flag] = !!body[flag];
  }
  if (!Object.keys(set).length) return NextResponse.json({ error: "No changes provided" }, { status: 400 });

  try {
    const current = await writeClient.fetch<{ _id: string; _rev: string; name?: string; stock?: number } | null>(
      `*[_type == "product" && _id == $id][0]{ _id, _rev, name, stock }`,
      { id }
    );
    if (!current) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const tx = writeClient.transaction().patch(id, (p) => p.ifRevisionId(current._rev).set(set));
    if (newStock !== undefined && newStock !== (current.stock ?? 0)) {
      tx.create({
        _type: "stockMovement",
        product: { _type: "reference", _ref: id },
        quantity: newStock - (current.stock ?? 0),
        reason: "adjustment",
        stockAfter: newStock,
        actorClerkId: guard.userId,
        createdAt: new Date().toISOString(),
      });
    }
    try {
      await tx.commit();
    } catch (error) {
      if ((error as { statusCode?: number })?.statusCode === 409) {
        return NextResponse.json({ error: "Product changed while saving. Please reload and try again." }, { status: 409 });
      }
      throw error;
    }

    await logAdminAction("info", "Product updated", { productId: id, name: current.name, fields: Object.keys(set) }, guard.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  try {
    const current = await writeClient.fetch<{ name?: string } | null>(
      `*[_type == "product" && _id == $id][0]{ name }`,
      { id }
    );
    if (!current) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Orders keep a hard reference to purchased products; stock history and
    // restocks are ours to clean up, anything else blocks the delete.
    const refs = await countReferences(id);
    const own = ["restock", "stockMovement"];
    const blocking = Object.fromEntries(Object.entries(refs).filter(([t]) => !own.includes(t)));
    if (Object.keys(blocking).length) {
      return NextResponse.json(
        { error: `Cannot delete: this product is still referenced by ${describeRefs(blocking)}.` },
        { status: 409 }
      );
    }

    const tx = writeClient.transaction().delete(id);
    const ledger = await writeClient.fetch<string[]>(
      `*[_type in $own && product._ref == $id]._id`,
      { own, id }
    );
    ledger.forEach((l) => tx.delete(l));
    await tx.commit();

    await logAdminAction("warn", "Product deleted", { productId: id, name: current.name }, guard.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
