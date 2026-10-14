"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { slugify } from "@/lib/slug";

export interface AttributeRow {
  _id: string;
  title: string;
  slug: string;
  type: string;
  options?: string[];
  unit?: string;
  categoryCount: number;
}

const TYPE_LABELS: Record<string, string> = {
  string: "Free text",
  number: "Number",
  boolean: "Yes / No",
  select: "Single choice",
  multiSelect: "Multiple choice",
};

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

const blank = { title: "", slug: "", type: "string", options: "", unit: "" };

export default function AttributeManager({ attributes }: { attributes: AttributeRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AttributeRow | null>(null);
  const [form, setForm] = useState(blank);
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AttributeRow | null>(null);

  const isChoice = form.type === "select" || form.type === "multiSelect";

  function openCreate() {
    setEditing(null);
    setForm(blank);
    setSlugTouched(false);
    setError(null);
    setOpen(true);
  }
  function openEdit(a: AttributeRow) {
    setEditing(a);
    setForm({ title: a.title, slug: a.slug, type: a.type, options: (a.options ?? []).join("\n"), unit: a.unit ?? "" });
    setSlugTouched(true);
    setError(null);
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    const options = form.options.split("\n").map((o) => o.trim()).filter(Boolean);
    if (isChoice && options.length === 0) return setError("Add at least one option (one per line)");
    setError(null);
    setBusy(true);
    const payload = { title: form.title, slug: form.slug || slugify(form.title), type: form.type, options, unit: form.unit };
    try {
      if (editing) await call(`/api/admin/attributes/${editing._id}`, "PATCH", payload);
      else await call("/api/admin/attributes", "POST", payload);
      toast.success(editing ? "Attribute updated" : "Attribute created");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!toDelete) return;
    setBusy(true);
    try {
      await call(`/api/admin/attributes/${toDelete._id}`, "DELETE");
      toast.success("Attribute deleted");
      setToDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm";
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" /> Add attribute
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Categories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No attributes yet.
                </TableCell>
              </TableRow>
            ) : (
              attributes.map((a) => (
                <TableRow key={a._id}>
                  <TableCell className="font-medium">
                    {a.title}
                    <span className="block font-mono text-[11px] text-muted-foreground">{a.slug}</span>
                  </TableCell>
                  <TableCell>{TYPE_LABELS[a.type] ?? a.type}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground" title={(a.options ?? []).join(", ")}>
                    {(a.options ?? []).join(", ") || "—"}
                  </TableCell>
                  <TableCell>{a.unit || "—"}</TableCell>
                  <TableCell className="text-right">{a.categoryCount}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" aria-label="Edit" onClick={() => openEdit(a)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" aria-label="Delete" onClick={() => setToDelete(a)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit attribute" : "Add attribute"}</DialogTitle>
            <DialogDescription>e.g. “RAM” (select: 4, 8, 16) with unit “GB”.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <label className="block text-sm">
              Title
              <input
                className={input}
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) }))
                }
              />
            </label>
            <label className="block text-sm">
              Slug
              <input
                className={input}
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Value type
                <select className={input} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Unit (optional)
                <input className={input} value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
              </label>
            </div>
            {isChoice && (
              <label className="block text-sm">
                Options (one per line)
                <textarea
                  rows={5}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
                  value={form.options}
                  onChange={(e) => setForm((f) => ({ ...f, options: e.target.value }))}
                />
              </label>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete attribute?</DialogTitle>
            <DialogDescription>
              “{toDelete?.title}” will be permanently removed. This is blocked while categories or products still use it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {busy ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
