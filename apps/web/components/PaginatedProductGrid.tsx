"use client";

import React, { useState } from "react";
import { Product } from "@repo/sanity";
import ProductCard from "./ProductCard";
import { Button } from "@repo/ui";
import { Loader2 } from "lucide-react";

interface PaginatedProductGridProps {
  products: Product[];
  initialLimit?: number;
  incrementBy?: number;
  gridCols?: string;
}

const PaginatedProductGrid: React.FC<PaginatedProductGridProps> = ({
  products,
  initialLimit = 12,
  incrementBy = 12,
  gridCols = "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
}) => {
  const [limit, setLimit] = useState(initialLimit);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const visibleProducts = products.slice(0, limit);
  const hasMore = limit < products.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setLimit((prev) => prev + incrementBy);
      setIsLoadingMore(false);
    }, 300);
  };

  return (
    <div>
      {/* Product Grid */}
      <div className={`grid ${gridCols} gap-4 md:gap-6`}>
        {visibleProducts.map((product, index) => (
          <ProductCard key={product._id} product={product} priority={index < 4} />
        ))}
      </div>

      {/* Pagination / Load More Footer */}
      {hasMore && (
        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-8 py-3 bg-ushop-pink hover:bg-ushop-pink/90 text-white font-semibold rounded-full hover:shadow-lg transform hoverEffect transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
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
    </div>
  );
};

export default PaginatedProductGrid;
