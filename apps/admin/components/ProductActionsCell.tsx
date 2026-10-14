"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";
import type { ProductType } from "@/types/admin";

const STATUS_OPTIONS = [
  ["new", "Brand new / sealed"],
  ["hot", "Trending / hot deal"],
  ["like_new", "Used: like new"],
  ["excellent", "Used: excellent"],
  ["good", "Used: good"],
  ["fair", "Used: fair"],
  ["for_parts", "Used: for parts"],
] as const;

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function ProductActionsCell({ product }: { product: ProductType }) {
  const router = useRouter();
  const id = String(product._id ?? product.id);
  const slugValue = typeof product.slug === "object" && product.slug !== null ? product.slug.current : product.slug;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: product.name,
    price: String(product.price ?? 0),
    discount: String(product.discount ?? 0),
    stock: String(product.stock ?? 0),
    condition: product.condition ?? "new",
    status: String(product.status ?? "new"),
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await call(`/api/admin/products/${id}`, "PATCH", {
        name: form.name,
        price: Number(form.price),
        discount: Number(form.discount),
        stock: Number(form.stock),
        condition: form.condition,
        status: form.status,
      });
      toast.success("Product updated");
      setEditOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await call(`/api/admin/products/${id}`, "DELETE");
      toast.success("Product deleted");
      setDeleteOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm";
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(id)}>Copy Product ID</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>Edit product</DropdownMenuItem>
          <DropdownMenuSeparator />
          {slugValue && (
            <DropdownMenuItem asChild>
              <Link href={`/product/${slugValue}`} target="_blank" className="flex items-center justify-between">
                <span>View in Storefront</span>
                <ExternalLink className="h-3.5 w-3.5 ml-2" />
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="text-red-600" onSelect={() => setDeleteOpen(true)}>
            Delete product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
            <DialogDescription>Stock changes are recorded in the inventory history.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <label className="block text-sm">
              Name
              <input className={input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="block text-sm">
                Price (GHS)
                <input type="number" min={0} step="0.01" className={input} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
              </label>
              <label className="block text-sm">
                Discount %
                <input type="number" min={0} max={100} className={input} value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} />
              </label>
              <label className="block text-sm">
                Stock
                <input type="number" min={0} step={1} className={input} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Condition
                <select className={input} value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as "new" | "used" }))}>
                  <option value="new">Brand new</option>
                  <option value="used">Used / pre-owned</option>
                </select>
              </label>
              <label className="block text-sm">
                Status
                <select className={input} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              “{product.name}” will be permanently removed. This is blocked if any order references it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {busy ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
