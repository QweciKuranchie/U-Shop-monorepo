import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { client } from "@repo/sanity";
import { requireAdminApi } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

export interface SearchHit {
  id: string;
  type: "product" | "order" | "user";
  title: string;
  subtitle: string;
  href: string;
}

/** Dashboard search across products, orders and users (admin only). */
export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ results: [] satisfies SearchHit[] });

  // `match` is a prefix/word match; the term is passed as a parameter, never interpolated.
  const pattern = `*${q}*`;
  try {
    const [products, orders, users] = await Promise.all([
      client.fetch<Array<{ _id: string; name: string; stock?: number; price?: number }>>(
        `*[_type == "product" && name match $p][0...5]{ _id, name, stock, price }`,
        { p: pattern }
      ),
      client.fetch<Array<{ _id: string; orderNumber?: string; customerName?: string; orderStatus?: string }>>(
        `*[_type == "order" && (orderNumber match $p || customerName match $p || email match $p)][0...5]{ _id, orderNumber, customerName, orderStatus }`,
        { p: pattern }
      ),
      clerkClient()
        .then((c) => c.users.getUserList({ query: q, limit: 5 }))
        .then((r) => r.data)
        .catch(() => []),
    ]);

    const results: SearchHit[] = [
      ...products.map((p) => ({
        id: p._id,
        type: "product" as const,
        title: p.name,
        subtitle: `${p.stock ?? 0} in stock`,
        href: "/admin/products",
      })),
      ...orders.map((o) => ({
        id: o._id,
        type: "order" as const,
        title: `Order ${o.orderNumber ?? o._id.slice(0, 8)}`,
        subtitle: [o.customerName, o.orderStatus].filter(Boolean).join(", "),
        href: `/admin/orders/${o._id}`,
      })),
      ...users.map((u) => ({
        id: u.id,
        type: "user" as const,
        title: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "User",
        subtitle: u.primaryEmailAddress?.emailAddress ?? "",
        href: `/admin/users/${u.id}`,
      })),
    ];
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Admin search failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
