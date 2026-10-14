"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { History, Plus } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";

interface HistoryRow {
  _id: string;
  quantity: number;
  notes?: string;
  reason?: string;
  stockAfter?: number;
  actorName?: string;
  actorClerkId?: string;
  createdAt: string;
}

export default function InventoryActions({ productId, name }: { productId: string; name: string }) {
  const router = useRouter();
  const [restockOpen, setRestockOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Restock form
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // History
  const [kind, setKind] = useState<"restocks" | "movements">("restocks");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = Number(quantity);
    if (!quantity) return setError("Quantity is required");
    if (!Number.isInteger(q) || q < 1) return setError("Quantity must be a positive whole number");
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/inventory/${productId}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: q, notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Restock failed");
      toast.success(`Added ${q} units. New stock: ${data.stock}`);
      setQuantity("");
      setNotes("");
      setRestockOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Restock failed");
    } finally {
      setBusy(false);
    }
  }

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/inventory/${productId}/history?page=${page}&limit=10&kind=${kind === "movements" ? "movements" : "restocks"}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load history");
      setRows(data.rows);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [productId, page, kind]);

  useEffect(() => {
    if (historyOpen) void loadHistory();
  }, [historyOpen, loadHistory]);

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" onClick={() => setRestockOpen(true)}>
        <Plus className="mr-1 h-4 w-4" /> Restock
      </Button>
      <Button
        size="sm"
        variant="ghost"
        aria-label="View history"
        onClick={() => {
          setPage(1);
          setHistoryOpen(true);
        }}
      >
        <History className="h-4 w-4" />
      </Button>

      <Dialog open={restockOpen} onOpenChange={setRestockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock</DialogTitle>
            <DialogDescription>{name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm">
              Quantity to add
              <input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                className="mt-1 h-9 w-full rounded-md border bg-background px-3"
              />
            </label>
            <label className="block text-sm">
              Notes (optional)
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={1000}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRestockOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Restocking..." : "Restock"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock history</DialogTitle>
            <DialogDescription>{name}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 text-xs">
            {(["restocks", "movements"] as const).map((k) => (
              <button
                key={k}
                onClick={() => {
                  setKind(k);
                  setPage(1);
                }}
                className={`rounded-full border px-3 py-1 capitalize ${kind === k ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {k === "movements" ? "Stock movements" : "Restocks"}
              </button>
            ))}
          </div>
          <div className="rounded-md border max-h-80 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Qty</TableHead>
                  {kind === "restocks" ? <TableHead>Notes</TableHead> : <TableHead>Reason</TableHead>}
                  {kind === "restocks" ? <TableHead>By</TableHead> : <TableHead>Stock after</TableHead>}
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                      No history available
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell className={r.quantity > 0 ? "text-green-600" : "text-red-600"}>
                        {r.quantity > 0 ? "+" : ""}
                        {r.quantity}
                      </TableCell>
                      <TableCell>{kind === "restocks" ? r.notes || "—" : r.reason || "—"}</TableCell>
                      <TableCell>
                        {kind === "restocks" ? r.actorName || r.actorClerkId?.slice(0, 10) || "Unknown" : (r.stockAfter ?? "—")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(r.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
