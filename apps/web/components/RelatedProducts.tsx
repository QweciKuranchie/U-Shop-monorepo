"use client";

import { memo, useRef } from "react";
import Link from "next/link";
import { Product } from "@repo/sanity";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RelatedProductsProps {
  currentProduct?: Product;
  relatedProducts?: Product[];
  title?: string;
  subtitle?: string;
  viewMoreHref?: string;
}

const RelatedProducts = memo(({
  relatedProducts = [],
  title = "You May Also Like",
  subtitle = "Discover similar products in this category",
  viewMoreHref = "/shop",
}: RelatedProductsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <div className="my-12 pt-10 border-t border-zinc-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-zinc-900 mb-1">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Left / Right Arrow Navigation */}
          <div className="flex items-center gap-1.5 bg-zinc-100/90 p-1 rounded-full border border-zinc-200/80">
            <button
              onClick={handleScrollLeft}
              aria-label="Scroll left"
              className="p-1.5 rounded-full bg-white hover:bg-ushop-pink hover:text-white text-zinc-700 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleScrollRight}
              aria-label="Scroll right"
              className="p-1.5 rounded-full bg-white hover:bg-ushop-pink hover:text-white text-zinc-700 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {viewMoreHref && (
            <Link
              href={viewMoreHref}
              className="text-xs font-semibold text-ushop-pink hover:text-ushop-purple transition-colors flex items-center gap-1 px-3 py-1.5 bg-ushop-pink/10 rounded-full border border-ushop-pink/20"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          )}
        </div>
      </div>

      {/* Scrollable Container with Visible Custom Scrollbar */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-ushop-pink/40 hover:scrollbar-thumb-ushop-pink scrollbar-track-zinc-100/80 rounded-lg -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {relatedProducts.map((product: Product) => (
          <div key={product._id} className="w-[260px] sm:w-[280px] flex-shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
});

RelatedProducts.displayName = "RelatedProducts";

export default RelatedProducts;
