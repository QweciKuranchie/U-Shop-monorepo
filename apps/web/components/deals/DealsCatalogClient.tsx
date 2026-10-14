"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@repo/sanity";
import ProductCard from "@/components/ProductCard";
import Title from "@/components/Title";
import {  Button  } from "@repo/ui";
import { Flame, Zap, GraduationCap, Tag, ShoppingBag, Loader2, Filter, Package } from "lucide-react";

interface DealsCatalogClientProps {
  initialProducts: Product[];
}

const DEAL_TABS = [
  { id: "all", label: "All Deals", icon: Flame, color: "text-ushop-pink" },
  { id: "flash", label: "Flash Sales", icon: Zap, color: "text-[#E8000B]" },
  { id: "students", label: "Student Deals", icon: GraduationCap, color: "text-emerald-600" },
  { id: "clearance", label: "Clearance", icon: Tag, color: "text-amber-600" },
  { id: "black-friday", label: "Black Friday", icon: ShoppingBag, color: "text-gray-900" },
  { id: "special-offers", label: "Special Offers", icon: Flame, color: "text-purple-600" },
];

export default function DealsCatalogClient({ initialProducts }: DealsCatalogClientProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [limit, setLimit] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter products by selected deal type tab
  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return initialProducts;

    return initialProducts.filter((product) => {
      const p = product as unknown as {
        isFlashSale?: boolean;
        isStudentDeal?: boolean;
        isClearance?: boolean;
        status?: string;
        discount?: number;
      };

      if (activeTab === "flash") {
        return Boolean(p.isFlashSale || p.status === "hot" || p.status === "flash" || (p.discount && p.discount >= 20));
      }
      if (activeTab === "students") {
        return Boolean(p.isStudentDeal || p.status === "student" || (p.discount && p.discount > 0 && p.discount < 25));
      }
      if (activeTab === "clearance") {
        return Boolean(p.isClearance || p.status === "clearance" || p.status === "refurbished" || p.status === "good");
      }
      if (activeTab === "black-friday") {
        return Boolean(p.discount && p.discount >= 30);
      }
      if (activeTab === "special-offers") {
        return Boolean(product.featured || (p.discount && p.discount > 0));
      }
      return true;
    });
  }, [initialProducts, activeTab]);

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
    <div className="mb-16">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col gap-4 mb-8 pb-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <Title className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Flame className="w-6 h-6 text-ushop-pink fill-ushop-pink" />
              All Active Hot Deals
            </Title>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Explore verified discounts, flash markdowns, and campus offers across Ghana
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-ushop-pink/10 text-ushop-pink self-start sm:self-auto border border-ushop-pink/20">
            {filteredProducts.length} deals available
          </span>
        </div>

        {/* 1. Filter Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {DEAL_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setLimit(12);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md scale-[1.02]"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-ushop-pink" : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              priority={index < 4}
              dealType={activeTab}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
          <Package className="w-12 h-12 text-ushop-pink/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">No deals found in this category</h3>
          <p className="text-xs text-gray-500 mb-4">
            Try selecting a different filter tab above to view more offers.
          </p>
          <Button
            onClick={() => setActiveTab("all")}
            variant="outline"
            className="text-xs font-semibold border-ushop-pink text-ushop-pink hover:bg-ushop-pink hover:text-white rounded-xl"
          >
            Show All Deals
          </Button>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-12">
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
              <span>Load More Deals</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
