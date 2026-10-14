"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Gamepad2,
  Layers,
  Flame,
  Package,
  ArrowRight,
  Grid,
  Search,
} from "lucide-react";
import { Category } from "@repo/sanity";
import { ProductClassificationItem } from "@repo/sanity"
import { urlFor } from "@repo/sanity";
import HorizontalScrollContainer from "@/components/common/HorizontalScrollContainer";

interface CategoryClientProps {
  initialCategories: Category[];
  classifications: ProductClassificationItem[];
}

// Popular categories mapped with specific fallback slugs & icons
const POPULAR_SLUGS_CONFIG = [
  {
    title: "Phones & Smartphones",
    slug: "smartphones",
    altSlug: "phones",
    icon: Smartphone,
    color: "from-blue-500/10 to-indigo-500/10 text-indigo-600 border-indigo-200/60",
    badgeColor: "bg-indigo-600 text-white",
  },
  {
    title: "Laptops & Computers",
    slug: "laptops",
    altSlug: "computers",
    icon: Laptop,
    color: "from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200/60",
    badgeColor: "bg-purple-600 text-white",
  },
  {
    title: "Accessories & Audio",
    slug: "accessories",
    altSlug: "audio",
    icon: Headphones,
    color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200/60",
    badgeColor: "bg-amber-600 text-white",
  },
  {
    title: "Appliances & Electronics",
    slug: "appliances",
    altSlug: "tvs-video",
    icon: Tv,
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200/60",
    badgeColor: "bg-emerald-600 text-white",
  },
  {
    title: "Gaming & Consoles",
    slug: "gaming",
    altSlug: "gaming-gear",
    icon: Gamepad2,
    color: "from-rose-500/10 to-red-500/10 text-rose-600 border-rose-200/60",
    badgeColor: "bg-rose-600 text-white",
  },
];

export default function CategoryClient({
  initialCategories,
  classifications,
}: CategoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassificationId, setSelectedClassificationId] = useState<string>("all");

  // Helper to find Sanity category by slug
  const findSanityCategory = useCallback(
    (slug: string, altSlug?: string) => {
      return initialCategories.find((c) => {
        const s = (c.slug?.current || "").toLowerCase();
        return s === slug.toLowerCase() || (altSlug && s === altSlug.toLowerCase());
      });
    },
    [initialCategories]
  );

  // 1. Featured Categories (Phones, Laptops, Accessories on ONE line)
  const featuredThree = useMemo(() => {
    const phonesCat = findSanityCategory("smartphones", "phones");
    const laptopsCat = findSanityCategory("laptops", "computers");
    const accessoriesCat = findSanityCategory("accessories", "audio");

    return [
      {
        title: "Phones & Smartphones",
        slug: phonesCat?.slug?.current || "smartphones",
        description: "Latest iPhones, Samsung Galaxy, Pixels & budget smartphones.",
        icon: Smartphone,
        image: phonesCat?.image,
        productCount: (phonesCat as { productCount?: number })?.productCount || 0,
        gradient: "from-slate-900 via-indigo-950 to-slate-900",
        accent: "text-indigo-400 border-indigo-500/30",
        btnBg: "bg-indigo-600 hover:bg-indigo-700",
      },
      {
        title: "Laptops & Computing",
        slug: laptopsCat?.slug?.current || "laptops",
        description: "MacBooks, Windows Ultrabooks, Workstations & Gaming rigs.",
        icon: Laptop,
        image: laptopsCat?.image,
        productCount: (laptopsCat as { productCount?: number })?.productCount || 0,
        gradient: "from-slate-900 via-purple-950 to-slate-900",
        accent: "text-purple-400 border-purple-500/30",
        btnBg: "bg-ushop-pink hover:bg-ushop-pink-dark",
      },
      {
        title: "Accessories & Audio",
        slug: accessoriesCat?.slug?.current || "accessories",
        description: "AirPods, chargers, smartwatches, cases & tech gear.",
        icon: Headphones,
        image: accessoriesCat?.image,
        productCount: (accessoriesCat as { productCount?: number })?.productCount || 0,
        gradient: "from-slate-900 via-emerald-950 to-slate-900",
        accent: "text-emerald-400 border-emerald-500/30",
        btnBg: "bg-emerald-600 hover:bg-emerald-700",
      },
    ];
  }, [findSanityCategory]);

  // 2. Popular Categories (One line scrollable: Phones, Laptops, Accessories, Appliances, Gaming)
  const popularCategoriesList = useMemo(() => {
    return POPULAR_SLUGS_CONFIG.map((cfg) => {
      const sanityMatch = findSanityCategory(cfg.slug, cfg.altSlug);
      return {
        ...cfg,
        realSlug: sanityMatch?.slug?.current || cfg.slug,
        title: sanityMatch?.title || cfg.title,
        description: sanityMatch?.description || `Explore ${cfg.title} on UShop.`,
        image: sanityMatch?.image,
        productCount: (sanityMatch as { productCount?: number })?.productCount || 0,
      };
    });
  }, [findSanityCategory]);

  // 3. Filtered Top Categories by Classification & Search Query
  const topCategories = useMemo(() => {
    let list = initialCategories;

    // Filter by classification tab if selected
    if (selectedClassificationId !== "all") {
      list = list.filter((c) => {
        const productType = (c as { productType?: { _id?: string; title?: string } }).productType;
        return (
          productType?._id === selectedClassificationId ||
          productType?.title?.toLowerCase() === selectedClassificationId.toLowerCase()
        );
      });
    }

    // Filter by search query if typed
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return list.filter((c) => {
        const titleMatch = c.title?.toLowerCase().includes(q);
        const descMatch = c.description?.toLowerCase().includes(q);
        const slugMatch = c.slug?.current?.toLowerCase().includes(q);
        return titleMatch || descMatch || slugMatch;
      });
    }

    // Default to top level categories (level == "category" or parent == null)
    const topLevelOnly = list.filter((c) => {
      const parent = (c as { parent?: unknown }).parent;
      const level = (c as { level?: string }).level;
      return !parent || level === "category";
    });

    return topLevelOnly.length > 0 ? topLevelOnly : list;
  }, [initialCategories, selectedClassificationId, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Dark Storefront Banner matching Stores & Universities design */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden mb-8 shadow-2xl min-h-[260px] sm:min-h-[300px] md:min-h-[340px] flex flex-col items-center justify-center text-center p-6 sm:p-10 border border-slate-800/40">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1600&q=80"
          alt="Tech Marketplace Categories"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />

        {/* Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-slate-900/85" />
        <div className="absolute inset-0 bg-black/40 backdrop-brightness-90" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-red-600/15 blur-[100px] rounded-full pointer-events-none" />

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-full mb-3 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-ushop-pink" />
            <span>Product Directory</span>
          </div>

          {/* Main Banner Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
            Explore All Categories
          </h1>

          {/* Red Curved Brush Stroke Underline */}
          <div className="relative w-48 sm:w-64 md:w-80 h-3.5 mx-auto mt-1 sm:mt-1.5 mb-6 sm:mb-8">
            <svg
              viewBox="0 0 240 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-red-600 drop-shadow-[0_2px_10px_rgba(232,0,11,0.7)]"
            >
              <path
                d="M 3 9 C 45 4, 125 3, 237 8 C 175 4, 85 5, 3 9 Z"
                fill="currentColor"
              />
            </svg>
          </div>

          {/* Floating Glassmorphism Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="relative w-full max-w-xl mx-auto shadow-2xl group"
          >
            <div className="absolute -inset-0.5 rounded-2xl sm:rounded-full bg-gradient-to-r from-red-600/40 via-purple-600/30 to-red-600/40 blur-sm opacity-60 group-hover:opacity-90 transition-opacity" />

            <div className="relative flex items-center bg-slate-900/65 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3.5 text-white shadow-inner focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/30 transition-all">
              <button
                type="submit"
                className="text-gray-300 hover:text-white shrink-0 mr-3 transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories by title, keyword, or classification..."
                className="w-full bg-transparent text-white text-sm sm:text-base placeholder-gray-300/80 outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-300 hover:text-white text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 ml-2 font-medium transition-colors shrink-0 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* 1. FEATURED CATEGORIES SECTION (Phones, Laptop, Accessories on ONE line) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-ushop-pink" />
              Featured Categories
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Top tech hubs on UShop — Phones, Laptops, and Accessories
            </p>
          </div>
        </div>

        {/* One Line Grid on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredThree.map((item) => {
            const Icon = item.icon;
            const imageUrl = item.image ? urlFor(item.image).url() : null;

            return (
              <Link
                key={item.slug}
                href={`/category/${item.slug}`}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${item.gradient} p-6 text-white shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 border border-white/10 group flex flex-col justify-between min-h-[220px]`}
              >
                {/* Background Image / Glow */}
                {imageUrl && (
                  <div className="absolute right-0 bottom-0 w-36 h-36 opacity-20 group-hover:opacity-35 transition-opacity pointer-events-none">
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      sizes="144px"
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-2xl bg-white/10 backdrop-blur-md border ${item.accent} w-fit`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {item.productCount > 0 && (
                      <span className="text-xs font-bold bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-white">
                        {item.productCount} items
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-4">
                  <span className="text-xs font-semibold text-gray-200">Shop Catalog</span>
                  <div className={`p-2 rounded-xl ${item.btnBg} text-white shadow-xs group-hover:translate-x-1 transition-transform`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES SECTION (One Line Scrollable) */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Popular Categories
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Quick access to Phones, Laptops, Accessories, Appliances, and Gaming
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Trending Now
          </span>
        </div>

        {/* One Line Scrollable Row */}
        <HorizontalScrollContainer>
          {popularCategoriesList.map((cat) => {
            const Icon = cat.icon;
            const imageUrl = cat.image ? urlFor(cat.image).url() : null;

            return (
              <Link
                key={cat.realSlug}
                href={`/category/${cat.realSlug}`}
                className="w-[210px] sm:w-[240px] shrink-0 snap-start bg-gray-50/80 hover:bg-white rounded-2xl border border-gray-200/80 hover:border-ushop-pink/40 p-4 transition-all duration-300 hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  {/* Category Image or Icon Container */}
                  <div className="relative w-full h-28 rounded-xl bg-white border border-gray-100 flex items-center justify-center mb-3 p-3 overflow-hidden group-hover:scale-102 transition-transform">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={cat.title}
                        fill
                        sizes="(max-width: 640px) 210px, 240px"
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${cat.color}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-ushop-pink transition-colors line-clamp-1 mb-1">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-tight">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between text-xs font-semibold text-gray-700 group-hover:text-ushop-pink">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </HorizontalScrollContainer>
      </section>

      {/* 3. ALL CATEGORIES SECTION (Tabs by Product Classification showing Top Categories) */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Grid className="w-5 h-5 text-ushop-purple" />
              All Categories by Classification
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select a classification tab below to filter top marketplace categories
            </p>
          </div>
          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full w-fit">
            {topCategories.length} categories
          </span>
        </div>

        {/* Product Classifications Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-gray-100">
          <button
            type="button"
            onClick={() => setSelectedClassificationId("all")}
            className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
              selectedClassificationId === "all"
                ? "bg-ushop-purple text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Classifications ({initialCategories.length})
          </button>

          {classifications.map((item) => {
            const isSelected = selectedClassificationId === item._id;
            return (
              <button
                key={item._id}
                type="button"
                onClick={() => setSelectedClassificationId(item._id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-ushop-purple text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item.title}
              </button>
            );
          })}
        </div>

        {/* Categories Grid */}
        {topCategories && topCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topCategories.map((category) => {
              const imageUrl = category.image ? urlFor(category.image).url() : null;
              const productCount = (category as { productCount?: number }).productCount || 0;

              return (
                <Link
                  key={category._id}
                  href={`/category/${category.slug?.current}`}
                  className="group bg-gray-50/60 hover:bg-white rounded-2xl border border-gray-200/80 hover:border-ushop-pink/40 p-5 transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative w-full h-36 rounded-xl bg-white border border-gray-100 flex items-center justify-center mb-4 p-3 overflow-hidden group-hover:scale-102 transition-transform">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={category.title || "Category"}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-3"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-ushop-pink/40" />
                      )}

                    </div>

                    <h3 className="font-bold text-gray-900 text-base group-hover:text-ushop-pink transition-colors mb-1">
                      {category.title}
                    </h3>

                    {category.description ? (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                        {category.description}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic mb-3">
                        Explore all items in {category.title}.
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700 group-hover:text-ushop-pink transition-colors">
                    <span>Shop {category.title}</span>
                    <div className="flex items-center gap-1.5">
                      {productCount > 0 && (
                        <span className="text-[11px] font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {productCount}
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">
              {searchQuery ? `No categories matching "${searchQuery}"` : "No top categories found for this classification."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
