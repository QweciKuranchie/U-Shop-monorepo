"use client";

import React from "react";
import { Product } from "@repo/sanity";
import useCartStore from "@/store";
import { Heart } from "lucide-react";
import BreadcrumbLink from "@/components/BreadcrumbLink";
import { cn } from "@repo/utils";
import { toast } from "sonner";
import isArray from "js-isarray";
import _ from "lodash";
import { trackWishlistAdd, trackWishlistRemove } from "@/lib/analytics";

const AddToWishlistBtn = ({
  showProduct,
  product,
  className,
}: {
  showProduct?: boolean;
  product?: Product;
  className?: string;
}) => {
  const { favoriteProduct, addToFavorite } = useCartStore();
  const existingProduct = product
    ? _.find(favoriteProduct, (item) => item?._id === product?._id) || null
    : null;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product?._id) {
      const isRemoving = !!existingProduct;

      addToFavorite(product).then(() => {
        toast.success(
          isRemoving ? "Removed from wishlist" : "Added to wishlist",
          {
            description: isRemoving
              ? `${product.name ? product.name.substring(0, 18) : "Item"} removed from wishlist!`
              : `${product.name ? product.name.substring(0, 18) : "Item"} added to wishlist!`,
            duration: 2500,
          }
        );

        // Track wishlist analytics
        if (isRemoving) {
          trackWishlistRemove({
            productId: product._id,
            name: product.name || "Unknown Product",
          });
        } else {
          trackWishlistAdd({
            productId: product._id,
            name: product.name || "Unknown Product",
          });
        }
      });
    }
  };

  const isButton = product !== undefined || showProduct === true;

  if (isButton && product) {
    return (
      <button
        onClick={handleFavorite}
        aria-label={existingProduct ? "Remove from wishlist" : "Add to wishlist"}
        title={existingProduct ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "group relative p-2 rounded-full bg-white hover:bg-white shadow-xs border border-gray-200/80 hover:border-ushop-purple hoverEffect cursor-pointer z-10",
          className
        )}
      >
        <Heart
          fill={existingProduct ? "#db2777" : "transparent"}
          className={cn(
            "w-4 h-4 transition-colors duration-200",
            existingProduct
              ? "text-ushop-pink"
              : "text-gray-600 group-hover:text-ushop-pink"
          )}
        />
      </button>
    );
  }

  return (
    <BreadcrumbLink
      href={"/wishlist"}
      aria-label="Wishlist"
      title="Wishlist"
      className={cn("group relative hover:text-ushop-pink hoverEffect", className)}
    >
      <Heart className="group-hover:text-ushop-pink hoverEffect mt-.5" />
      <span
        className={`absolute -top-1 -right-1 bg-ushop-purple-dark text-white rounded-full text-xs font-semibold flex items-center justify-center min-w-[14px] h-[14px] ${
          favoriteProduct.length > 9 ? "px-1" : ""
        }`}
      >
        {isArray(favoriteProduct) && favoriteProduct.length > 0
          ? favoriteProduct.length > 9
            ? "9+"
            : favoriteProduct.length
          : 0}
      </span>
    </BreadcrumbLink>
  );
};

export default AddToWishlistBtn;