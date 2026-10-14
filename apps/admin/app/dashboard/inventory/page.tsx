export const dynamic = "force-dynamic";

import Link from "next/link";
import { writeClient } from "@repo/sanity";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui";
import InventoryActions from "@/components/InventoryActions";
import { isLowStock, LOW_STOCK_THRESHOLD } from "@/lib/inventory";

interface InventoryRow {
  _id: string;
  name: string;
  sellerSku?: string;
  stock?: number;
  store?: string;
  category?: string;
}

const PAGE_SIZE = 20;

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || null;
  const lowOnly = sp.filter === "low";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  // Search matches name or SKU; "low" keeps products at/below the threshold (or with no stock set).
  const filter = `_type == "product"
    && (!defined($q) || name match $q || sellerSku match $q)
    && (!$low || !defined(stock) || stock <= $threshold)`;
  const params = {
    q: q ? `${q}*` : null,
    low: lowOnly,
    threshold: LOW_STOCK_THRESHOLD,
    from: (page - 1) * PAGE_SIZE,
    to: page * PAGE_SIZE,
  };

  let rows: InventoryRow[] = [];
  let total = 0;
  let lowCount = 0;
  try {
    [rows, total, lowCount] = await Promise.all([
      writeClient.fetch<InventoryRow[]>(
        `*[${filter}] | order(coalesce(stock, 0) asc, name asc) [$from...$to]{
          _id, name, sellerSku, stock,
          "store": store->name,
          "category": coalesce(category->title, category->name)
        }`,
        params
      ),
      writeClient.fetch<number>(`count(*[${filter}])`, params),
      writeClient.fetch<number>(
        `count(*[_type == "product" && (!defined(stock) || stock <= $threshold)])`,
        { threshold: LOW_STOCK_THRESHOLD }
      ),
    ]);
  } catch (error) {
    console.error("Error loading inventory:", error);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (over: { page?: number; filter?: string | null }) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    const f = over.filter === undefined ? (lowOnly ? "low" : null) : over.filter;
    if (f) p.set("filter", f);
    p.set("page", String(over.page ?? 1));
    return `/admin/inventory?${p}`;
  };

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-card border rounded-lg shadow-xs">
        <div>
          <h1 className="font-semibold text-lg">Inventory</h1>
          <p className="text-xs text-muted-foreground">
            Manage product stock and restock history. Low stock is {LOW_STOCK_THRESHOLD} units or fewer.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Low stock: <span className="font-bold text-foreground">{lowCount}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form action="/admin/inventory" className="flex gap-2">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search name or SKU"
            className="h-9 w-64 rounded-md border bg-background px-3 text-sm"
          />
          {lowOnly && <input type="hidden" name="filter" value="low" />}
          <button className="h-9 rounded-md border px-3 text-sm hover:bg-muted">Search</button>
        </form>
        <Link
          href={href({ filter: lowOnly ? null : "low" })}
          className={`rounded-full border px-3 py-1 text-xs ${lowOnly ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          Low stock only
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Store</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                const low = isLowStock(r.stock);
                return (
                  <TableRow key={r._id}>
                    <TableCell className="max-w-xs truncate font-medium" title={r.name}>
                      {r.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.sellerSku ?? "—"}</TableCell>
                    <TableCell className="text-sm">{r.store ?? "—"}</TableCell>
                    <TableCell className={`text-right font-semibold ${low ? "text-red-600" : ""}`}>{r.stock ?? 0}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          low
                            ? "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
                            : "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
                        }`}
                      >
                        {(r.stock ?? 0) === 0 ? "Out of stock" : low ? "Low stock" : "In stock"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <InventoryActions productId={r._id} name={r.name} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {total} products · page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={href({ page: page - 1 })} className="rounded-md border px-3 py-1 hover:bg-muted">
              Previous
            </Link>
          )}
          {page < totalPages && (
            <Link href={href({ page: page + 1 })} className="rounded-md border px-3 py-1 hover:bg-muted">
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
