"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Textarea } from "@repo/ui";

export interface SellerReview {
  _id: string;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase?: boolean;
  sellerReply?: { text?: string; repliedAt?: string } | null;
  createdAt: string;
  productName?: string;
  reviewer?: string;
}

export function ReviewReplies({ reviews }: { reviews: SellerReview[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Unanswered first, then newest.
  const sorted = [...reviews].sort(
    (a, b) => Number(Boolean(a.sellerReply?.text)) - Number(Boolean(b.sellerReply?.text))
  );

  const call = async (id: string, method: "PUT" | "DELETE", text?: string) => {
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/seller/reviews/${id}/reply`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: text !== undefined ? JSON.stringify({ text }) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  if (reviews.length === 0)
    return <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center">No approved reviews on your products yet.</p>;

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {sorted.map((r) => {
        const draft = drafts[r._id] ?? r.sellerReply?.text ?? "";
        const replied = Boolean(r.sellerReply?.text);
        return (
          <div key={r._id} className="border rounded-lg bg-card p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{r.productName ?? "Product"}</p>
              <p className="text-xs text-muted-foreground">
                <span aria-label={`${r.rating} out of 5 stars`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                {" · "}{r.reviewer}{r.isVerifiedPurchase ? " · Verified purchase" : ""}
                {" · "}{new Date(r.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold">{r.title}</p>
              <p className="text-sm text-muted-foreground">{r.content}</p>
            </div>
            <div className="space-y-2">
              <label htmlFor={`reply-${r._id}`} className="text-xs font-medium">
                {replied ? "Your reply (public)" : "Reply publicly"}
              </label>
              <Textarea id={`reply-${r._id}`} rows={2} maxLength={500} value={draft}
                onChange={(e) => setDrafts((d) => ({ ...d, [r._id]: e.target.value }))} />
              <div className="flex gap-2">
                <Button size="sm" disabled={busy === r._id || draft.trim().length < 2 || draft.trim() === (r.sellerReply?.text ?? "")}
                  onClick={() => call(r._id, "PUT", draft)}>
                  {replied ? "Update reply" : "Post reply"}
                </Button>
                {replied && (
                  <Button size="sm" variant="outline" disabled={busy === r._id} onClick={() => call(r._id, "DELETE")}>
                    Remove reply
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
