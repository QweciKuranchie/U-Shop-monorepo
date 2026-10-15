"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@repo/sanity";
import ProductCard from "@/components/ProductCard";
import Title from "@/components/Title";
import DealCountdown from "@/components/DealCountdown";
import {  Button  } from "@repo/ui";
import {
  Search,
  SlidersHorizontal,
  Flame,
  Zap,
  GraduationCap,
  Tag,
  ShoppingBag,
  Package,
  Loader2,
  Calendar,
  Clock,
  ArrowLeft,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";

const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  "graduation-cap": GraduationCap,
  tag: Tag,
  "shopping-bag": ShoppingBag,
  flame: Flame,
};

interface SingleDealClientProps {
  slug: string;
  dealInfo: {
    title: string;
    subtitle: string;
    badgeText: string;
    maxDiscount: string;
    bgGradient: string;
    iconName: string;
  };
  initialProducts: Product[];
}

export default function SingleDealClient({
  slug,
  dealInfo,
  initialProducts,
}: SingleDealClientProps) {
  const isFlash = slug === "flash";
  const isSpecialOffers = slug === "special-offers";
  const IconComp = ICON_MAP[dealInfo.iconName] || Zap;

  // Flash Sale sub-tabs: Today vs Tomorrow
  const [flashDayTab, setFlashDayTab] = useState<"today" | "tomorrow">("today");

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [limit, setLimit] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Extract unique categories from products
  const categoryOptions = useMemo(() => {
    const catsSet = new Set<string>();
    initialProducts.forEach((p) => {
      const prod = p as unknown as { category?: { title?: string; name?: string } | string; categories?: unknown[] };
      if (typeof prod?.category === "object" && prod.category !== null) {
        const title = prod.category.title || prod.category.name;
        if (title) catsSet.add(title);
      } else if (typeof prod?.category === "string") {
        catsSet.add(prod.category);
      } else if (Array.isArray(prod?.categories)) {
        prod.categories.forEach((cat: unknown) => {
          if (typeof cat === "string") catsSet.add(cat);
          if (cat && typeof cat === "object") {
            const obj = cat as { title?: string; name?: string };
            const title = obj.title || obj.name;
            if (title) catsSet.add(title);
          }
        });
      }
    });
    return Array.from(catsSet);
  }, [initialProducts]);

  // Process & Filter Products
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Flash Sales Day Tab Filter
    if (isFlash) {
      if (flashDayTab === "today") {
        result = result.filter(
          (p, idx) => p.isFlashSale || p.status === "hot" || idx % 2 === 0 || (p.discount && p.discount >= 20)
        );
      } else {
        result = result.filter(
          (p, idx) => idx % 2 !== 0 || (p.discount && p.discount >= 25)
        );
      }
    }

    // 2. Search Query Filter (Non-Special Offers or when active)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((p) => (p.name || "").toLowerCase().includes(query));
    }

    // 3. Category Filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => {
        const prod = p as unknown as { category?: { title?: string; name?: string } | string; categories?: unknown[] };
        if (typeof prod?.category === "object" && prod.category !== null) {
          const title = prod.category.title || prod.category.name || "";
          return title.toLowerCase() === selectedCategory.toLowerCase();
        }
        if (typeof prod?.category === "string") {
          return prod.category.toLowerCase() === selectedCategory.toLowerCase();
        }
        if (Array.isArray(prod?.categories)) {
          return prod.categories.some((cat: unknown) => {
            if (typeof cat === "string") return cat.toLowerCase() === selectedCategory.toLowerCase();
            if (cat && typeof cat === "object") {
              const obj = cat as { title?: string; name?: string };
              const title = obj.title || obj.name || "";
              return title.toLowerCase() === selectedCategory.toLowerCase();
            }
            return false;
          });
        }
        return false;
      });
    }

    // 4. Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "discount-high") {
      result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    return result;
  }, [initialProducts, isFlash, flashDayTab, searchQuery, selectedCategory, sortBy]);

  const visibleProducts = filteredProducts.slice(0, limit);
  const hasMore = limit < filteredProducts.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setLimit((prev) => prev + 12);
      setIsLoadingMore(false);
    }, 300);
  };

  return (
    <div>
      {/* Hero Header Banner */}
      <div className={`my-6 ${dealInfo.bgGradient} text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 px-3.5 py-1.5 rounded-full mb-4">
              <IconComp className="w-4 h-4 fill-white text-white" />
              <span className="text-xs font-black uppercase tracking-wider">
                {dealInfo.badgeText}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
              {dealInfo.title}
            </h1>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-6">
              {dealInfo.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/deals"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Deals Hub</span>
              </Link>
            </div>
          </div>

          {/* 2. Countdown Box — ONLY shown on Flash Sales */}
          {isFlash && (
            <div className="w-full lg:w-auto bg-white/10 border border-white/20 p-5 rounded-3xl shrink-0">
              <DealCountdown />
            </div>
          )}
        </div>
      </div>

      {/* 5. Flash Sales Sub-Tabs (Today vs Tomorrow) */}
      {isFlash && (
        <div className="mb-6 flex items-center justify-center sm:justify-start gap-3 bg-white border border-gray-100 p-2 rounded-2xl shadow-xs">
          <button
            onClick={() => setFlashDayTab("today")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              flashDayTab === "today"
                ? "bg-ushop-red text-white shadow-md"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Today&apos;s Flash Sales (Live Now)</span>
          </button>

          <button
            onClick={() => setFlashDayTab("tomorrow")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              flashDayTab === "tomorrow"
                ? "bg-slate-900 text-white shadow-md"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Tomorrow&apos;s Upcoming Deals</span>
          </button>
        </div>
      )}

      {/* 4. Product Filters Bar (On all deal pages EXCEPT special-offers) */}
      {!isSpecialOffers && (
        <div className="mb-8 bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-ushop-pink transition-colors">
            <Search className="w-4 h-4 text-gray-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${dealInfo.title}...`}
              className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full font-bold transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Category Filter */}
            {categoryOptions.length > 0 && (
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-ushop-pink transition-colors cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-ushop-pink transition-colors cursor-pointer"
            >
              <option value="default font-medium">Sort: Default</option>
              <option value="discount-high">Biggest Discount</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Catalog Section Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
        <div>
          <Title className="text-xl sm:text-2xl font-bold text-gray-900">
            {dealInfo.title} Collection
          </Title>
          <p className="text-xs text-gray-500 mt-0.5">
            Showing {filteredProducts.length} items on sale.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {visibleProducts && visibleProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                priority={index < 4}
                dealType={slug}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-12 mb-8">
              <Button
                size="lg"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 bg-ushop-pink hover:bg-ushop-pink/90 text-white font-semibold rounded-full hover:shadow-lg transform transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading Products...</span>
                  </>
                ) : (
                  <span>Load More Products</span>
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto my-10 shadow-xs">
          <Package className="w-12 h-12 text-ushop-pink/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Items Found</h3>
          <p className="text-xs text-gray-500 mb-6">
            Try adjusting your search or category filter to find available deals!
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSortBy("default");
            }}
            className="px-5 py-2.5 bg-ushop-pink hover:bg-ushop-pink/90 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
