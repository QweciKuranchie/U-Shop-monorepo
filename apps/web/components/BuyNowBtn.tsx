"use client";

import React, { useState } from "react";
import { Product } from "@repo/sanity";
import { cn } from "@repo/utils";
import {  Button  } from "@repo/ui";
import { Zap, Loader2 } from "lucide-react";
import useCartStore from "@/store";
import { useRouter } from "next/navigation";
import { trackAddToCart } from "@/lib/analytics";

interface Props {
  product: Product;
  className?: string;
}

const BuyNowBtn = ({ product, className }: Props) => {
  const router = useRouter();
  const { addItem, getItemCount } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const isOutOfStock = product?.stock === 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?._id || isOutOfStock) return;

    setIsLoading(true);

    const currentCount = getItemCount(product._id);
    if (currentCount === 0) {
      addItem(product);
      trackAddToCart({
        productId: product._id,
        name: product.name || "Unknown",
        price: product.price ?? 0,
        quantity: 1,
      });
    }

    router.push("/cart");
  };

  return (
    <Button
      onClick={handleBuyNow}
      disabled={isOutOfStock || isLoading}
      aria-label={isOutOfStock ? "Out of Stock" : "Buy Now"}
      title={isOutOfStock ? "Out of Stock" : "Buy Now"}
      className={cn(
        "bg-ushop-pink hover:bg-pink-600 text-white font-semibold tracking-wide shadow-xs hover:shadow-md hoverEffect flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-white" />
      ) : (
        <Zap className="w-4 h-4 fill-white text-white" />
      )}
      <span>{isOutOfStock ? "Out of Stock" : "Buy Now"}</span>
    </Button>
  );
};

export default BuyNowBtn;
