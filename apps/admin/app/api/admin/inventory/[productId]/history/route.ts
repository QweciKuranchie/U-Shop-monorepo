import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

/** Paged restock history (and signed stock-movement ledger) for one product. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { productId } = await params;

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") || "10", 10) || 10));
  const kind = sp.get("kind") === "movements" ? "stockMovement" : "restock";
  const q = { productId, from: (page - 1) * limit, to: page * limit };

  try {
    const [rows, total] = await Promise.all([
      writeClient.fetch(
        `*[_type == $kind && product._ref == $productId] | order(createdAt desc) [$from...$to]{
          _id, quantity, notes, reason, stockAfter, actorName, actorClerkId, createdAt
        }`,
        { ...q, kind }
      ),
      writeClient.fetch<number>(`count(*[_type == $kind && product._ref == $productId])`, { productId, kind }),
    ]);
    return NextResponse.json({
      rows,
      totalResults: total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      currentPage: page,
      resultsPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching restock history:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
