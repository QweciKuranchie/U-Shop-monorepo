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

export interface CategoryRow {
  _id: string;
  title: string;
  slug: string;
  level?: string;
  description?: string;
  parentId?: string;
  parentTitle?: string;
  classificationId?: string;
  classificationTitle?: string;
  attributes: Array<{ attributeId: string; required?: boolean }>;
  productCount: number;
  childCount: number;
}
interface Option {
  _id: string;
  title: string;
}

interface FormState {
  title: string;
  slug: string;
  level: string;
  description: string;
  parentId: string;
  productClassificationId: string;
  attributes: Record<string, { selected: boolean; required: boolean }>;
}

const empty = (attrs: Option[]): FormState => ({
  title: "",
  slug: "",
  level: "leaf",
  description: "",
  parentId: "",
  productClassificationId: "",
  attributes: Object.fromEntries(attrs.map((a) => [a._id, { selected: false, required: false }])),
});

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

export default function CategoryManager({
  categories,
  classifications,
  attributes,
}: {
  categories: CategoryRow[];
  classifications: Option[];
  attributes: Option[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState<FormState>(empty(attributes));
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<CategoryRow | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(empty(attributes));
    setSlugTouched(false);
    setError(null);
    setOpen(true);
  }

  function openEdit(c: CategoryRow) {
    const f = empty(attributes);
    for (const a of c.attributes) f.attributes[a.attributeId] = { selected: true, required: !!a.required };
    setEditing(c);
    setForm({
      ...f,
      title: c.title,
      slug: c.slug,
      level: c.level || "leaf",
      description: c.description || "",
      parentId: c.parentId || "",
      productClassificationId: c.classificationId || "",
    });
    setSlugTouched(true);
    setError(null);
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    if (!form.slug.trim()) return setError("Slug is required");
    if (!form.productClassificationId) return setError("Choose a product type (classification)");
    setError(null);
    setBusy(true);
    const attrs = Object.entries(form.attributes)
      .filter(([, v]) => v.selected)
      .map(([attributeId, v]) => ({ attributeId, required: v.required }));
    try {
      if (editing) {
        await call(`/api/admin/categories/${editing._id}`, "PATCH", {
          title: form.title,
          slug: form.slug,
          level: form.level,
          description: form.description,
          parentId: form.parentId || null,
          productClassificationId: form.productClassificationId,
          attributes: attrs,
        });
        toast.success("Category updated");
      } else {
        await call("/api/admin/categories", "POST", {
          title: form.title,
          slug: form.slug,
          level: form.level,
          description: form.description,
          parentId: form.parentId || undefined,
          productClassificationId: form.productClassificationId,
          attributes: attrs,
        });
        toast.success("Category created");
      }
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
      await call(`/api/admin/categories/${toDelete._id}`, "DELETE");
      toast.success("Category deleted");
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
          <Plus className="mr-1 h-4 w-4" /> Add category
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Product type</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-right">Attributes</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No categories yet.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">
                    {c.title}
                    <span className="block font-mono text-[11px] text-muted-foreground">{c.slug}</span>
                  </TableCell>
                  <TableCell>{c.classificationTitle ?? "—"}</TableCell>
                  <TableCell>{c.parentTitle ?? "—"}</TableCell>
                  <TableCell className="capitalize">{c.level ?? "—"}</TableCell>
                  <TableCell className="text-right">{c.attributes.length}</TableCell>
                  <TableCell className="text-right">{c.productCount}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" aria-label="Edit" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" aria-label="Delete" onClick={() => setToDelete(c)}>
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
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
            <DialogDescription>Assign attributes to control the spec fields sellers fill in.</DialogDescription>
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
                Product type
                <select
                  className={input}
                  value={form.productClassificationId}
                  onChange={(e) => setForm((f) => ({ ...f, productClassificationId: e.target.value }))}
                >
                  <option value="">Select…</option>
                  {classifications.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Level
                <select className={input} value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
                  <option value="category">Top category</option>
                  <option value="subcategory">Subcategory</option>
                  <option value="leaf">Leaf category</option>
                </select>
              </label>
            </div>
            <label className="block text-sm">
              Parent category
              <select className={input} value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}>
                <option value="">None (top level)</option>
                {categories
                  .filter((c) => c._id !== editing?._id)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
              </select>
            </label>
            <label className="block text-sm">
              Description
              <textarea
                rows={2}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Attributes</legend>
              {attributes.length === 0 && <p className="text-xs text-muted-foreground">No attributes defined yet.</p>}
              <div className="max-h-48 overflow-y-auto rounded-md border divide-y">
                {attributes.map((a) => {
                  const st = form.attributes[a._id] ?? { selected: false, required: false };
                  return (
                    <div key={a._id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={st.selected}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              attributes: { ...f.attributes, [a._id]: { ...st, selected: e.target.checked } },
                            }))
                          }
                        />
                        {a.title}
                      </label>
                      <label className="flex items-center gap-1 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          disabled={!st.selected}
                          checked={st.required}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              attributes: { ...f.attributes, [a._id]: { ...st, required: e.target.checked } },
                            }))
                          }
                        />
                        Required
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>

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
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              “{toDelete?.title}” will be permanently removed. This is blocked while products or subcategories still use it.
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
