"use client";

import React, { useState, useMemo } from "react";
import { Category, Product } from "@repo/sanity";
import ProductCard from "../ProductCard";
import NoProductsAvailable from "./NoProductsAvailable";
import { ArrowUpDown, LayoutGrid, X } from "lucide-react";
import {  Badge  } from "@repo/ui";

interface Props {
  categories: Category[];
  slug: string;
  initialProducts: Product[];
}

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

export default function CategoryProducts({ categories, slug, initialProducts }: Props) {
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedWarranty, setSelectedWarranty] = useState<string | null>(null);

  const currentCategory = useMemo(() => {
    return categories.find((cat) => cat.slug?.current === slug);
  }, [categories, slug]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // Condition filter
    if (selectedCondition) {
      result = result.filter(
        (p) =>
          p.status === selectedCondition ||
          (p as Record<string, unknown>).attributes === selectedCondition
      );
    }

    // Warranty filter
    if (selectedWarranty) {
      result = result.filter((p) => (p as Record<string, unknown>).warrantyType === selectedWarranty);
    }

    // Sorting
    if (sortBy === "price-asc") {
      return result.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    if (sortBy === "price-desc") {
      return result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    if (sortBy === "name-asc") {
      return result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return result;
  }, [initialProducts, selectedCondition, selectedWarranty, sortBy]);

  if (!initialProducts || initialProducts.length === 0) {
    return (
      <div className="py-10">
        <NoProductsAvailable selectedTab={currentCategory?.title || slug} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sorting bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100/50 shadow-sm">
        <div className="flex items-center gap-2 text-zinc-600 flex-wrap">
          <LayoutGrid size={18} className="text-ushop-pink" />
          <span className="text-sm font-medium mr-2">
            Showing <span className="font-semibold text-ushop-purple">{filteredAndSortedProducts.length}</span> products
          </span>

          {/* Quick attribute filter badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Condition:</span>
            {["new", "refurbished", "like_new", "excellent"].map((cond) => {
              const isSel = selectedCondition === cond;
              const labelMap: Record<string, string> = {
                new: "New",
                refurbished: "Refurbished",
                like_new: "Like New",
                excellent: "Excellent",
              };
              return (
                <Badge
                  key={cond}
                  variant={isSel ? "default" : "outline"}
                  onClick={() => setSelectedCondition(isSel ? null : cond)}
                  className={`cursor-pointer text-xs py-0.5 px-2 rounded-full ${
                    isSel
                      ? "bg-ushop-purple text-white border-ushop-purple"
                      : "border-gray-200 text-gray-600 hover:border-ushop-purple"
                  }`}
                >
                  {labelMap[cond]}
                </Badge>
              );
            })}

            {(selectedCondition || selectedWarranty) && (
              <button
                onClick={() => {
                  setSelectedCondition(null);
                  setSelectedWarranty(null);
                }}
                className="text-xs text-red-600 hover:underline flex items-center gap-0.5 ml-1 font-medium"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <ArrowUpDown size={16} />
            <span>Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 hover:border-ushop-pink focus:border-ushop-purple rounded-xl px-3 py-1.5 outline-none cursor-pointer hoverEffect shadow-xs"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredAndSortedProducts.map((product, index) => (
            <ProductCard key={product._id} product={product} priority={index < 4} />
          ))}
        </div>
      ) : (
        <div className="py-12 bg-white rounded-xl text-center border border-gray-100">
          <p className="text-gray-500 text-sm">No products match your selected condition/attribute filters.</p>
          <button
            onClick={() => {
              setSelectedCondition(null);
              setSelectedWarranty(null);
            }}
            className="mt-3 text-sm text-ushop-purple font-medium hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
