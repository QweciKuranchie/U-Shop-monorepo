"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Store as StoreIcon,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Star,
  Package,
  ArrowRight,
  Search,
} from "lucide-react";
import { Store } from "@repo/sanity";
import { urlFor } from "@repo/sanity";

export type ExtendedStore = Omit<Store, "location"> & {
  logo?: unknown;
  image?: unknown;
  productCount?: number;
  location?: { name?: string };
};

interface StoresClientProps {
  initialStores: ExtendedStore[];
}

export default function StoresClient({ initialStores }: StoresClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "student" | "verified">("all");

  const filteredStores = useMemo(() => {
    let result = initialStores || [];

    // Filter by quick tags
    if (selectedFilter === "student") {
      result = result.filter((s) => s.verifiedStudent);
    } else if (selectedFilter === "verified") {
      result = result.filter((s) => s.verifiedSeller);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        const nameMatch = s.name?.toLowerCase().includes(q);
        const descMatch = s.description?.toLowerCase().includes(q);
        const ownerMatch = s.ownerName?.toLowerCase().includes(q);
        const locationMatch = s.location?.name?.toLowerCase().includes(q);
        return nameMatch || descMatch || ownerMatch || locationMatch;
      });
    }

    return result;
  }, [initialStores, searchQuery, selectedFilter]);

  return (
    <div>
      {/* Premium Hero Banner matching exact design */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden mb-8 shadow-2xl min-h-[260px] sm:min-h-[300px] md:min-h-[340px] flex flex-col items-center justify-center text-center p-6 sm:p-10 border border-slate-800/40">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80"
          alt="Tech Storefront at Night"
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
          {/* Main Banner Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
            Browse All Stores
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

            <div className="relative flex items-center bg-slate-900/65 border border-white/20 rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3.5 text-white shadow-inner focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/30 transition-all">
              <button
                type="submit"
                className="text-gray-300 hover:text-white shrink-0 mr-3 transition-colors cursor-pointer"
                aria-label="Search stores"
              >
                <Search className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stores by name or category..."
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

      {/* Filter Tabs & Store Count Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedFilter === "all"
                ? "bg-ushop-purple text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All Merchant Stores ({initialStores.length})
          </button>
          <button
            onClick={() => setSelectedFilter("verified")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedFilter === "verified"
                ? "bg-ushop-pink text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Merchants
          </button>
          <button
            onClick={() => setSelectedFilter("student")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedFilter === "student"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Student Sellers
          </button>
        </div>

        <div className="text-xs text-gray-500 font-medium self-end sm:self-center">
          Showing <span className="font-bold text-gray-900">{filteredStores.length}</span> stores
        </div>
      </div>

      {/* Stores Grid */}
      {filteredStores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredStores.map((store: ExtendedStore) => {
            const logoUrl = store.logo ? urlFor(store.logo as Parameters<typeof urlFor>[0]).url() : null;
            const slug = store.slug?.current || "";

            return (
              <div
                key={store._id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:shadow-md hover:border-ushop-pink/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Store Header Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-14 h-14 rounded-2xl bg-ushop-pink/10 border border-ushop-pink/20 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs transition-transform">
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={store.name || "Store Logo"}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <StoreIcon className="w-7 h-7 text-ushop-pink" />
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-ushop-pink transition-colors">
                          {store.name}
                        </h3>
                        {store.verifiedStudent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200/80 rounded-md font-semibold text-xs shrink-0" title="Verified Student Seller">
                            <GraduationCap className="w-3 h-3 text-emerald-600" />
                            Verified Student
                          </span>
                        )}

                        {store.verifiedSeller && (
                          <span title="Verified Merchant">
                            <CheckCircle2 className="w-4 h-4 text-ushop-pink fill-ushop-pink/10 shrink-0" />
                          </span>
                        )}
                      </div>

                      {store.ownerName && (
                        <p className="text-xs text-gray-500 truncate mb-1">
                          Owner: <span className="font-medium text-gray-700">{store.ownerName}</span>
                        </p>
                      )}

                      {/* Location Tag */}
                      {store.location?.name && (
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-medium text-xs">
                            <MapPin className="w-3 h-3 text-ushop-pink" />
                            {store.location.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Store Description */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                    {store.description || "Verified merchant store on UShop."}
                  </p>
                </div>

                {/* Footer Metrics & Action */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {store.rating || 5.0}
                    </span>

                    <span className="flex items-center gap-1 text-gray-600">
                      <Package className="w-3.5 h-3.5 text-zinc-400" />
                      {store.productCount || 0} products
                    </span>
                  </div>

                  <Link
                    href={`/stores/${slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-ushop-purple hover:bg-ushop-purple-dark text-white text-xs font-semibold rounded-xl transition-all shadow-2xs group-hover:gap-2"
                  >
                    <span>Visit Store</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
          <StoreIcon className="w-12 h-12 text-ushop-pink/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No Stores Found
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            {searchQuery
              ? `No merchant stores match "${searchQuery}". Try searching another name or category.`
              : "There are currently no active merchant stores registered."}
          </p>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFilter("all");
              }}
              className="px-4 py-2 bg-ushop-purple text-white text-xs font-semibold rounded-xl hover:bg-ushop-purple-dark transition-colors"
            >
              Clear Search & Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
