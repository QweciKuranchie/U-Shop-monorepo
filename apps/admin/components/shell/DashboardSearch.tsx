"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Shirt, ShoppingBasket, User, X } from "lucide-react";
import type { SearchHit } from "@/app/api/admin/search/route";

const ICONS = { product: Shirt, order: ShoppingBasket, user: User } as const;
const GROUPS: Array<{ type: SearchHit["type"]; label: string }> = [
  { type: "product", label: "Products" },
  { type: "order", label: "Orders" },
  { type: "user", label: "Users" },
];

const DashboardSearch = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd+K opens, Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const json = await res.json();
        setResults(res.ok ? json.results : []);
      } catch {
        /* aborted or offline: keep the previous results */
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the dashboard"
        className="flex h-10 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground hover:border-foreground/30"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search dashboard</span>
        <kbd className="ml-2 hidden rounded bg-muted px-1.5 py-0.5 text-xs sm:inline">Ctrl K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search the dashboard">
          <button type="button" aria-label="Close search" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl overflow-hidden rounded-xl border bg-card shadow-xl">
            <div className="flex items-center gap-2 border-b px-4">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, orders and users"
                aria-label="Search products, orders and users"
                className="h-12 flex-1 bg-transparent text-sm outline-none"
              />
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Searching" />
              ) : (
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {query.trim().length < 2 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">Type at least 2 characters.</p>
              ) : results.length === 0 && !loading ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches for &ldquo;{query.trim()}&rdquo;.</p>
              ) : (
                GROUPS.map(({ type, label }) => {
                  const hits = results.filter((r) => r.type === type);
                  if (!hits.length) return null;
                  const Icon = ICONS[type];
                  return (
                    <div key={type} className="mb-2">
                      <p className="px-3 py-1 text-xs font-medium text-muted-foreground">{label}</p>
                      {hits.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => go(h.href)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{h.title}</span>
                            {h.subtitle && <span className="block truncate text-xs text-muted-foreground">{h.subtitle}</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardSearch;
