import React from "react";
import Image from "next/image";
import { productImageUrl } from "@repo/sanity";
import { Product } from "@repo/sanity";
import Link from "next/link";
import { Flame, GraduationCap, Tag, StarIcon } from "lucide-react";
import AddToWishlistBtn from "./AddToWishlistBtn";
import PriceView from "./PriceView";
import AddToCartBtn from "./AddToCartBtn";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new: {
    label: "NEW",
    className: "bg-emerald-100 text-emerald-700 border-emerald-300 group-hover:border-emerald-400",
  },
  refurbished: {
    label: "REFURBISHED",
    className: "bg-blue-100 text-blue-700 border-blue-300 group-hover:border-blue-400",
  },
  like_new: {
    label: "LIKE NEW",
    className: "bg-teal-100 text-teal-700 border-teal-300 group-hover:border-teal-400",
  },
  excellent: {
    label: "EXCELLENT",
    className: "bg-cyan-100 text-cyan-700 border-cyan-300 group-hover:border-cyan-400",
  },
  good: {
    label: "GOOD",
    className: "bg-gray-100 text-gray-700 border-gray-300 group-hover:border-gray-400",
  },
  fair: {
    label: "FAIR",
    className: "bg-amber-100 text-amber-700 border-amber-300 group-hover:border-amber-400",
  },
  for_parts: {
    label: "FOR PARTS",
    className: "bg-red-100 text-red-700 border-red-300 group-hover:border-red-400",
  },
};

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  isFlashSale?: boolean;
  dealType?: "flash" | "student" | "clearance" | "black-friday" | "special" | string;
}

const ProductCard = ({
  product,
  priority = false,
  isFlashSale = false,
  dealType,
}: ProductCardProps) => {
  // Determine deal icon badges under Wishlist button
  const statusStr = product?.status as string | undefined;

  const isFlash =
    isFlashSale ||
    dealType === "flash" ||
    Boolean(product?.isFlashSale) ||
    statusStr === "hot" ||
    statusStr === "flash";

  const isStudent =
    dealType === "student" ||
    Boolean((product as unknown as { isStudentDeal?: boolean })?.isStudentDeal) ||
    statusStr === "student";

  const isClearance =
    dealType === "clearance" ||
    Boolean((product as unknown as { isClearance?: boolean })?.isClearance) ||
    statusStr === "clearance" ||
    statusStr === "refurbished";

  return (
    <div className="text-xs sm:text-sm border border-gray-200/80 rounded-2xl bg-white group hover:shadow-xl hover:border-ushop-pink/30 hoverEffect flex flex-col h-full overflow-hidden">
      {/* Product Image Area */}
      <div className="relative group overflow-hidden bg-[#fbfbfb] p-3 sm:p-4 aspect-square w-full flex items-center justify-center">
        {product?.images && product.images[0] && (
          <Link
            href={`/product/${product?.slug?.current}`}
            aria-label={product.name || "View product"}
            title={product.name || "View product"}
            className="relative w-full h-full flex items-center justify-center"
          >
            <Image
              src={(productImageUrl(product.images[0]) ?? "/placeholder.svg")}
              alt={product.name || "Product Image"}
              priority={priority}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className={`w-full h-full object-contain p-1 transition-transform duration-300
                  ${product?.stock !== 0 ? "group-hover:scale-105" : "opacity-50"}`}
            />
          </Link>
        )}

        {/* Top-right action icons container (Wishlist + Deal Badges) */}
        <div className="absolute top-2 right-2 z-10 flex flex-col items-center gap-1.5">
          <AddToWishlistBtn product={product} />

          {/* Flash Sale Flame Badge */}
          {isFlash && (
            <Link
              href="/deals/flash"
              aria-label="Flash Sale Deal"
              title="Flash Sale Deal"
              className="p-1 sm:p-1.5 rounded-full bg-white/95 shadow-md border border-red-100 hover:scale-110 transition-transform duration-200"
            >
              <Flame
                size={14}
                className="text-ushop-red fill-ushop-red animate-pulse"
              />
            </Link>
          )}

          {/* Student Deal Graduation Cap Badge */}
          {!isFlash && isStudent && (
            <Link
              href="/deals/students"
              aria-label="Student Deal"
              title="Student Deal"
              className="p-1 sm:p-1.5 rounded-full bg-white/95 shadow-md border border-emerald-100 hover:scale-110 transition-transform duration-200"
            >
              <GraduationCap
                size={14}
                className="text-emerald-600 fill-emerald-600/20"
              />
            </Link>
          )}

          {/* Clearance Sale Tag Badge */}
          {!isFlash && !isStudent && isClearance && (
            <Link
              href="/deals/clearance"
              aria-label="Clearance Sale"
              title="Clearance Sale"
              className="p-1 sm:p-1.5 rounded-full bg-white/95 shadow-md border border-amber-100 hover:scale-110 transition-transform duration-200"
            >
              <Tag
                size={14}
                className="text-amber-600 fill-amber-600/20"
              />
            </Link>
          )}
        </div>

        {/* Top-left badges: Status & Discount stacked cleanly */}
        <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1">
          {!product?.isFlashSale && product?.status && STATUS_CONFIG[product.status] && (
            <span
              className={`text-[9px] sm:text-[10px] uppercase font-bold border px-2 py-0.5 rounded-full tracking-wider shadow-2xs ${STATUS_CONFIG[product.status].className}`}
            >
              {STATUS_CONFIG[product.status].label}
            </span>
          )}

          {typeof product?.discount === "number" && product.discount > 0 ? (
            <span className="bg-[#FF4F5A] text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
              -{product.discount}%
            </span>
          ) : null}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div className="space-y-1.5">
          {(() => {
            const prod = product as { category?: { title?: string; name?: string } | string; categories?: unknown[] };
            const hasCategory = prod?.category || (prod?.categories && prod.categories.length > 0);
            if (!hasCategory) return null;

            let categoryLabel = "";
            if (typeof prod?.category === "object" && prod.category !== null) {
              categoryLabel = prod.category.title || prod.category.name || "";
            } else if (typeof prod?.category === "string") {
              categoryLabel = prod.category;
            } else if (Array.isArray(prod?.categories)) {
              categoryLabel = prod.categories
                .map((cat: unknown) => {
                  if (typeof cat === "string") return cat;
                  if (cat && typeof cat === "object") {
                    const obj = cat as { title?: string; name?: string };
                    return obj.title || obj.name || "";
                  }
                  return "";
                })
                .filter(Boolean)
                .join(", ");
            }

            if (!categoryLabel) return null;

            return (
              <p className="uppercase line-clamp-1 text-[10px] text-ushop-light-text font-semibold tracking-wider">
                {categoryLabel}
              </p>
            );
          })()}

          <Link href={`/product/${product?.slug?.current}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-ushop-purple hoverEffect leading-snug">
              {product?.name}
            </h3>
          </Link>

          {/* Real Ratings Display from Sanity */}
          {(() => {
            const avgRating = typeof product?.averageRating === "number" ? product.averageRating : 0;
            const reviewCount = typeof product?.totalReviews === "number" ? product.totalReviews : 0;

            return (
              <div className="flex items-center gap-1.5 pt-0.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, index) => (
                    <StarIcon
                      key={index}
                      size={11}
                      className={
                        index < Math.round(avgRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200 fill-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 font-medium">
                  {reviewCount > 0 ? (
                    <>
                      {avgRating > 0 ? avgRating.toFixed(1) : null} ({reviewCount})
                    </>
                  ) : (
                    "(0)"
                  )}
                </span>
              </div>
            );
          })()}
        </div>

        <div className="space-y-2.5 pt-1 border-t border-gray-100">
          <div className="flex flex-wrap items-baseline justify-between gap-1">
            <PriceView 
              price={product?.price} 
              discount={product?.discount}
              className="text-xs sm:text-sm font-extrabold"
            />
            <span className={`text-[10px] font-bold ${product?.stock === 0 ? "text-ushop-red" : "text-emerald-600"}`}>
              {(product?.stock as number) > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <AddToCartBtn product={product} className="w-full text-xs py-2 sm:py-2.5 rounded-xl font-bold" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
