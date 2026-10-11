"use client";

import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";
import { ChevronDown, Grid3X3 } from "lucide-react";

export interface NavCategory {
  _id: string;
  title: string;
  slug: { current: string };
  level?: number;
  parentId?: string;
  group?: { _id: string; title: string } | null;
}

const MAX_PER_GROUP = 8;

/**
 * Header "Categories" mega menu. Opens on hover, focus or click and closes on
 * Escape or when focus leaves, so it works without a mouse. The trigger is a
 * real button; "All categories" inside the panel links to /category.
 */
const CategoriesMegaMenu = ({
  categories,
  isActive,
}: {
  categories: NavCategory[];
  isActive: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => {
    // Top-level categories only; children are reached from the category page.
    const top = categories.filter((c) => !c.parentId);
    const map = new Map<string, { title: string; items: NavCategory[] }>();
    for (const c of top.length ? top : categories) {
      const key = c.group?._id ?? "other";
      const title = c.group?.title ?? "More";
      if (!map.has(key)) map.set(key, { title, items: [] });
      map.get(key)!.items.push(c);
    }
    // "More" always last
    return [...map.entries()]
      .sort(([a], [b]) => (a === "other" ? 1 : b === "other" ? -1 : 0))
      .map(([key, g]) => ({ key, ...g }));
  }, [categories]);

  if (groups.length === 0) {
    return (
      <Link
        href="/category"
        className="flex items-center gap-1.5 text-sm font-semibold py-1 text-gray-700 hover:text-ushop-pink"
      >
        <Grid3X3 className="w-4 h-4 shrink-0" />
        <span>Categories</span>
      </Link>
    );
  }

  return (
    <div
      ref={root}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          (root.current?.querySelector("button") as HTMLButtonElement | null)?.focus();
        }
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="categories-menu"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-sm font-semibold py-1 transition-colors ${
          isActive || open ? "text-ushop-pink" : "text-gray-700 hover:text-ushop-pink"
        }`}
      >
        <Grid3X3 className="w-4 h-4 shrink-0" />
        <span>Categories</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        id="categories-menu"
        hidden={!open}
        className="absolute left-0 top-full z-50 pt-2"
      >
        <div className="w-[min(56rem,90vw)] rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
            {groups.map((g) => (
              <div key={g.key}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  {g.title}
                </p>
                <ul className="space-y-1">
                  {g.items.slice(0, MAX_PER_GROUP).map((c) => (
                    <li key={c._id}>
                      <Link
                        href={`/category/${c.slug.current}`}
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-2 py-1.5 text-sm text-gray-800 hover:bg-gray-50 hover:text-ushop-pink"
                      >
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm font-semibold">
            <Link href="/category" onClick={() => setOpen(false)} className="text-ushop-pink hover:underline">
              All categories →
            </Link>
            <Link href="/shop" onClick={() => setOpen(false)} className="text-gray-700 hover:text-ushop-pink">
              Shop all products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesMegaMenu;
