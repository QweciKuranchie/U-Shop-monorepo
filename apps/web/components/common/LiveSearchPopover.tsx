"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@repo/sanity";
import PriceFormatter from "../PriceFormatter";
import { Search, ChevronRight, Loader2, Package } from "lucide-react";

export interface SearchResultProduct {
  _id: string;
  name?: string;
  slug?: { current?: string };
  price?: number;
  discount?: number;
  images?: unknown[];
}

interface LiveSearchPopoverProps {
  isOpen: boolean;
  isLoading: boolean;
  results: SearchResultProduct[];
  query: string;
  listId: string;
  activeIndex: number;
  onSelect: () => void;
}

export function LiveSearchPopover({
  isOpen,
  isLoading,
  results,
  query,
  listId,
  activeIndex,
  onSelect,
}: LiveSearchPopoverProps) {
  if (!isOpen) return null;

  const getProductImage = (product: SearchResultProduct): string | null => {
    try {
      if (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
        return urlFor(product.images[0] as Parameters<typeof urlFor>[0]).url();
      }
      if (product.images && typeof product.images === "object") {
        return urlFor(product.images as Parameters<typeof urlFor>[0]).url();
      }
    } catch (e) {
      console.error("Error generating product image URL in live search:", e);
    }
    return null;
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {isLoading ? (
        <div className="flex items-center justify-center p-6 text-gray-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-ushop-pink" />
          <span className="text-xs font-medium">Searching tech gear...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-1">
          <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Matching Products
            </span>
            <span className="text-[11px] font-semibold text-ushop-pink" role="status">
              {results.length} found
            </span>
          </div>

          <div id={listId} role="listbox" aria-label="Search suggestions" className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {results.map((product, index) => {
              const imageSrc = getProductImage(product);

              return (
                <Link
                  key={product._id}
                  id={`${listId.replace(/-listbox$/, "")}-opt-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  tabIndex={-1}
                  href={`/product/${product.slug?.current}`}
                  onClick={onSelect}
                  className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-ushop_light_bg transition-colors group ${index === activeIndex ? "bg-ushop_light_bg ring-2 ring-ushop-purple/40" : ""}`}
                >
                  {/* Product Image Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden shrink-0 relative border border-gray-100 flex items-center justify-center p-1">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-contain p-1 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-ushop-pink transition-colors">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <PriceFormatter
                        amount={product.price}
                        className="text-xs font-extrabold text-ushop-purple-dark"
                      />
                      {typeof product.discount === "number" && product.discount > 0 && (
                        <span className="text-[10px] font-bold text-ushop-pink bg-ushop-pink/10 px-1.5 py-0.2 rounded-md">
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-ushop-pink group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>

          <div className="pt-1.5 border-t border-gray-100">
            <Link
              href={`/shop?query=${encodeURIComponent(query)}`}
              onClick={onSelect}
              className="flex items-center justify-center gap-2 w-full py-2 bg-ushop-pink/5 hover:bg-ushop-pink/10 text-ushop-pink text-xs font-bold rounded-xl transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>See all results for &quot;{query}&quot;</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-xs font-semibold text-gray-500">
            No products found matching &quot;{query}&quot;
          </p>
          <Link
            href={`/shop?query=${encodeURIComponent(query)}`}
            onClick={onSelect}
            className="inline-block mt-2 text-xs font-bold text-ushop-pink hover:underline"
          >
            Search all shop items →
          </Link>
        </div>
      )}
    </div>
  );
}
