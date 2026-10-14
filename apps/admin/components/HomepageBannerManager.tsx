"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui";
import {
  BANNER_ICONS,
  HOMEPAGE_PLACEMENTS,
  stylesForPlacement,
  type HomepagePlacement,
} from "@repo/sanity";

export interface BannerRow {
  _id: string;
  placement: HomepagePlacement;
  title: string;
  badge?: string;
  subtitle?: string;
  price?: string;
  buttonText?: string;
  link: string;
  style?: string;
  icon?: string;
  imageUrl?: string;
  imageAssetId?: string;
  imageUrlResolved?: string;
  order?: number;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
}

const input = "w-full rounded-md border bg-background px-3 py-2 text-sm";
const toLocal = (iso?: string) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

interface Form {
  title: string; badge: string; subtitle: string; price: string; buttonText: string;
  link: string; style: string; icon: string; imageUrl: string; imageAssetId: string;
  preview: string; removeImage: boolean; isActive: boolean; startsAt: string; endsAt: string;
}
const blank = (): Form => ({
  title: "", badge: "", subtitle: "", price: "", buttonText: "", link: "/shop", style: "", icon: "",
  imageUrl: "", imageAssetId: "", preview: "", removeImage: false, isActive: true, startsAt: "", endsAt: "",
});

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function HomepageBannerManager({ banners }: { banners: BannerRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<HomepagePlacement>("hero");
  const [editing, setEditing] = useState<BannerRow | "new" | null>(null);
  const [form, setForm] = useState<Form>(blank());
  const [busy, setBusy] = useState(false);

  const placement = HOMEPAGE_PLACEMENTS.find((p) => p.value === tab)!;
  const fields = placement.fields as readonly string[];
  const rows = banners.filter((b) => b.placement === tab);
  const styles = stylesForPlacement(tab);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try { await fn(); toast.success(ok); router.refresh(); return true; }
    catch (e) { toast.error(e instanceof Error ? e.message : "Something went wrong"); return false; }
    finally { setBusy(false); }
  };

  const openNew = () => { setForm(blank()); setEditing("new"); };
  const openEdit = (b: BannerRow) => {
    setForm({
      title: b.title, badge: b.badge ?? "", subtitle: b.subtitle ?? "", price: b.price ?? "",
      buttonText: b.buttonText ?? "", link: b.link, style: b.style ?? "", icon: b.icon ?? "",
      imageUrl: b.imageUrl ?? "", imageAssetId: "", preview: b.imageUrlResolved ?? "", removeImage: false,
      isActive: b.isActive !== false, startsAt: toLocal(b.startsAt), endsAt: toLocal(b.endsAt),
    });
    setEditing(b);
  };

  const upload = async (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/homepage-banners/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({ ...f, imageAssetId: data.assetId, preview: data.url, removeImage: false }));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
    finally { setBusy(false); }
  };

  const save = async () => {
    const payload: Record<string, unknown> = {
      title: form.title, link: form.link, isActive: form.isActive,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "",
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : "",
      imageAssetId: form.imageAssetId || undefined, removeImage: form.removeImage,
    };
    for (const k of ["badge", "subtitle", "price", "buttonText", "style", "icon", "imageUrl"] as const)
      if (fields.includes(k) || (k === "imageUrl" && fields.includes("image"))) payload[k] = form[k];
    const isNew = editing === "new";
    const ok = await run(
      () => isNew
        ? call("/api/admin/homepage-banners", "POST", { ...payload, placement: tab, order: (rows.length + 1) * 10 })
        : call(`/api/admin/homepage-banners/${(editing as BannerRow)._id}`, "PATCH", payload),
      isNew ? "Banner created" : "Banner updated"
    );
    if (ok) setEditing(null);
  };

  const move = (i: number, dir: -1 | 1) => {
    const ids = rows.map((r) => r._id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    run(() => call("/api/admin/homepage-banners/reorder", "POST", { ids }), "Order saved");
  };

  const field = (name: string, label: string, el: React.ReactNode) =>
    fields.includes(name) ? (<label className="block space-y-1"><span className="text-xs font-medium">{label}</span>{el}</label>) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {HOMEPAGE_PLACEMENTS.map((p) => (
          <Button key={p.value} size="sm" variant={tab === p.value ? "default" : "outline"} onClick={() => setTab(p.value)}>
            {p.title} ({banners.filter((b) => b.placement === p.value).length})
          </Button>
        ))}
      </div>

      <div className="bg-card border rounded-lg shadow-xs p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground">{placement.hint}</p>
          <Button size="sm" onClick={openNew}><Plus className="size-4 mr-1" />Add banner</Button>
        </div>

        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-dashed rounded-md p-6 text-center space-y-3">
            <p>No banners here, so the storefront shows the built-in defaults.</p>
            <Button size="sm" variant="outline" disabled={busy}
              onClick={() => run(() => call("/api/admin/homepage-banners/seed", "POST", { placement: tab }), "Defaults loaded")}>
              Load defaults to edit them
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map((b, i) => (
              <li key={b._id} className="flex items-center gap-3 py-3">
                {b.imageUrlResolved ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.imageUrlResolved} alt="" className="h-12 w-16 rounded border object-contain bg-muted"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
                ) : <div className="h-12 w-16 rounded border bg-muted" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{b.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {b.link}{b.startsAt || b.endsAt ? " · scheduled" : ""}
                  </p>
                </div>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={b.isActive !== false} disabled={busy}
                    onChange={(e) => run(() => call(`/api/admin/homepage-banners/${b._id}`, "PATCH", { isActive: e.target.checked }), e.target.checked ? "Activated" : "Hidden")} />
                  Active
                </label>
                <Button size="icon" variant="ghost" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="size-4" /></Button>
                <Button size="icon" variant="ghost" disabled={busy || i === rows.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="size-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(b)} aria-label="Edit"><Pencil className="size-4" /></Button>
                <Button size="icon" variant="ghost" disabled={busy} aria-label="Delete"
                  onClick={() => { if (confirm(`Delete "${b.title}"?`)) run(() => call(`/api/admin/homepage-banners/${b._id}`, "DELETE"), "Banner deleted"); }}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Add" : "Edit"} banner · {placement.title}</DialogTitle>
            <DialogDescription>Leave optional fields empty to hide them.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {field("title", "Title *", <input className={input} maxLength={120} value={form.title} onChange={(e) => set("title", e.target.value)} />)}
            {field("badge", "Badge / label", <input className={input} maxLength={80} value={form.badge} onChange={(e) => set("badge", e.target.value)} />)}
            {field("subtitle", "Subtitle", <input className={input} maxLength={160} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />)}
            {field("price", "Price text", <input className={input} maxLength={40} placeholder="GH₵ 1,850" value={form.price} onChange={(e) => set("price", e.target.value)} />)}
            {field("buttonText", "Button text", <input className={input} maxLength={40} placeholder="Shop Now" value={form.buttonText} onChange={(e) => set("buttonText", e.target.value)} />)}
            {field("link", "Link *", <input className={input} placeholder="/shop?query=laptop or https://…" value={form.link} onChange={(e) => set("link", e.target.value)} />)}
            {field("style", "Colour", (
              <select className={input} value={form.style} onChange={(e) => set("style", e.target.value)}>
                <option value="">Default</option>
                {styles.map((s) => <option key={s.value} value={s.value}>{s.title}</option>)}
              </select>
            ))}
            {field("icon", "Icon", (
              <select className={input} value={form.icon} onChange={(e) => set("icon", e.target.value)}>
                <option value="">Default</option>
                {BANNER_ICONS.map((s) => <option key={s.value} value={s.value}>{s.title}</option>)}
              </select>
            ))}
            {fields.includes("image") && (
              <div className="space-y-2">
                <span className="text-xs font-medium">Image (PNG/JPEG/WebP, max 5MB)</span>
                {form.preview && !form.removeImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.preview} alt="" className="h-28 rounded border object-contain bg-muted" />
                )}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="block text-xs"
                  onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                {form.preview && (
                  <button type="button" className="text-xs text-destructive underline"
                    onClick={() => setForm((f) => ({ ...f, preview: "", imageAssetId: "", imageUrl: "", removeImage: true }))}>
                    Remove image
                  </button>
                )}
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} /> Active
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1"><span className="text-xs font-medium">Show from (optional)</span>
                <input type="datetime-local" className={input} value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} /></label>
              <label className="block space-y-1"><span className="text-xs font-medium">Hide after (optional)</span>
                <input type="datetime-local" className={input} value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} /></label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button disabled={busy || !form.title.trim()} onClick={save}>{busy ? "Saving…" : "Save"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
