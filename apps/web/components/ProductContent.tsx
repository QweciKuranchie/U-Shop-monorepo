"use client";

import Container from "@/components/Container";
import PriceView from "@/components/PriceView";
import ProductCharacteristics from "@/components/ProductCharacteristics";
import ProductsDetails from "@/components/ProductsDetails";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import ProductSpecs from "@/components/ProductSpecs";
import ProductReviews from "@/components/ProductReviews";
import AddToCartBtn from "@/components/AddToCartBtn";
import BuyNowBtn from "@/components/BuyNowBtn";
import AddToWishlistBtn from "@/components/AddToWishlistBtn";

import { Product } from "@repo/sanity";
import { urlFor } from "@repo/sanity";
import { FREE_SHIPPING_THRESHOLD, MIN_SHIPPING_FEE } from "@repo/utils/pricing";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import {
  CornerDownLeft,
  StarIcon,
  Truck,
  Shield,
  RefreshCw,
  Palette,
  HelpCircle,
  Share2,
  Store,
  CheckCircle2,
  MapPin,
  ExternalLink,
} from "lucide-react";
import React, { useState } from "react";
import {  Badge  } from "@repo/ui";
import {  Card  } from "@repo/ui";
import {
  ProductAnimationWrapper,
  ProductImageWrapper,
  ProductDetailsWrapper,
  ProductActionWrapper,
  ProductSectionWrapper,
} from "@/components/ProductClientWrapper";
import RelatedProducts from "./RelatedProducts";
interface ProductContentProps {
  product: Product & {
    averageRating?: number;
    totalReviews?: number;
  };
  relatedProducts: Product[];
  sellerProducts?: Product[];
  brand: { brandName?: string }[] | null;
}

const ProductContent = ({
  product,
  relatedProducts,
  sellerProducts,
  brand,
}: ProductContentProps) => {
  const averageRating = product?.averageRating || 0;
  const totalReviews = product?.totalReviews || 0;

  // Active image selector state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name || "UShop", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      // The user dismissing the share sheet is not an error.
      if ((err as Error)?.name !== "AbortError") toast.error("Couldn't share this product");
    }
  };

  // Build category hierarchy array from root ancestor down to leaf
  const buildCategoryHierarchy = (cat: { title?: string; slug?: { current?: string }; parent?: unknown }) => {
    const list: Array<{ title: string; slug: string }> = [];
    let current: { title?: string; slug?: { current?: string }; parent?: unknown } | undefined = cat;
    while (current) {
      if (current.title) {
        list.unshift({
          title: current.title,
          slug: current.slug?.current || "",
        });
      }
      current = current.parent as typeof current;
    }
    return list;
  };

  const productObj = product as unknown as Record<string, unknown>;
  const productClassification = productObj?.productClassification as { title?: string; slug?: { current?: string } } | undefined;
  const categoryHierarchy = buildCategoryHierarchy(productObj?.category as Parameters<typeof buildCategoryHierarchy>[0]);
  const storeData = productObj?.store as {
    name?: string;
    slug?: { current?: string };
    logo?: unknown;
    location?: { name?: string; city?: string };
    ownerName?: string;
    verifiedStudent?: boolean;
    verifiedSeller?: boolean;
  } | undefined;

  return (
    <ProductAnimationWrapper>
      <Container>
        {/* Breadcrumb Navigation */}
        <DynamicBreadcrumb
          productData={{
            name: product?.name || "",
            slug: product?.slug?.current || "",
            classification: productClassification
              ? {
                  title: productClassification.title,
                  slug: productClassification.slug?.current,
                }
              : undefined,
            categoryHierarchy,
          }}
        />

        <div className="flex flex-col md:flex-row gap-10 pb-6">
          {/* Product Image Gallery */}
          {product?.images && product.images.length > 0 && (
            <ProductImageWrapper>
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-ushop_light_bg border border-zinc-100 shadow-xs group">
                  <Image
                    src={urlFor(product.images[activeImageIndex]).url()}
                    alt={product.name || "Product Image"}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-none sm:flex-wrap">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 bg-ushop_light_bg hoverEffect ${
                          idx === activeImageIndex
                            ? "border-ushop-pink shadow-xs"
                            : "border-zinc-200/60 hover:border-zinc-300"
                        }`}
                      >
                        <Image
                          src={urlFor(img).url()}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ProductImageWrapper>
          )}

          {/* Product Details */}
          <ProductDetailsWrapper>
            {/* Title and Category */}
            <div className="space-y-3">
              {brand && brand.length > 0 && (
                <Badge className="bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/20 hover:bg-ushop-pink/20 w-fit">
                  <span className="font-semibold tracking-wide">
                    {brand[0]?.brandName}
                  </span>
                </Badge>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">
                {product?.name}
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                {product?.description}
              </p>

              {/* Enhanced Rating Display */}
              {totalReviews > 0 ? (
                <a
                  href="#reviews"
                  className="flex items-center gap-3 w-fit hover:opacity-80"
                  aria-label={`Rated ${averageRating.toFixed(1)} out of 5 from ${totalReviews} ${totalReviews === 1 ? "review" : "reviews"}. Jump to reviews`}
                >
                  <div className="flex items-center gap-0.5" aria-hidden="true">
                    {[...Array(5)].map((_, index) => (
                      <StarIcon
                        key={index}
                        size={16}
                        className={`${
                          index < Math.round(averageRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-zinc-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                    {averageRating.toFixed(1)} ({totalReviews}{" "}
                    {totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </a>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, index) => (
                      <StarIcon
                        key={index}
                        size={16}
                        className="text-zinc-300"
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-zinc-500">No reviews yet</span>
                </div>
              )}
            </div>

            {/* Pricing Section */}
            <div className="space-y-4 border-t border-b border-zinc-100 py-4 sm:py-6">
              <PriceView
                price={product?.price}
                discount={product?.discount}
                className="text-2xl sm:text-3xl font-bold text-zinc-900"
              />

              {/* Enhanced Stock Status */}
              <div className="flex items-center gap-3">
                <Badge
                  className={`text-xs font-semibold px-2.5 py-1 ${
                    product?.stock === 0
                      ? "bg-red-50 text-red-700 border border-red-100"
                      : product?.stock && product.stock < 10
                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  }`}
                >
                  {product?.stock === 0
                    ? "Out of Stock"
                    : product?.stock && product.stock < 10
                    ? `Only ${product.stock} left!`
                    : "In Stock"}
                </Badge>
              </div>

              {/* Discount Information */}
              {typeof product?.discount === "number" && product.discount > 0 ? (
                <div className="bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/20 px-3 py-2 rounded-lg text-sm font-semibold">
                  💰 Save {product.discount}% on this item!
                </div>
              ) : null}
            </div>

            {/* Store / Merchant Showcase Card */}
            <ProductActionWrapper delay={0.25}>
              <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 my-4 shadow-2xs hover:border-ushop-pink/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* Store Logo or Fallback Icon */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-ushop-pink/10 border border-ushop-pink/20 flex items-center justify-center shrink-0">
                    {storeData?.logo ? (
                      <Image
                        src={urlFor(storeData.logo).url()}
                        alt={storeData.name || "Store Logo"}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <Store className="w-6 h-6 text-ushop-pink" />
                    )}
                  </div>

                  {/* Store Info */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-zinc-900 text-sm sm:text-base">
                        {storeData?.name || "Verified Student Seller"}
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 shrink-0" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-0.5">
                      {storeData?.location?.name && (
                        <span className="flex items-center gap-1 text-zinc-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-ushop-pink" />
                          {storeData.location.name}
                        </span>
                      )}
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/60">
                        Verified Store
                      </span>
                    </div>
                  </div>
                </div>

                {/* Option to Visit Store before add to cart */}
                <Link
                  href={
                    storeData?.slug?.current
                      ? `/stores/${storeData.slug.current}`
                      : "/stores"
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-ushop-purple hover:bg-ushop-purple-dark text-white text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-xs group"
                >
                  <Store className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Visit Store</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </Link>
              </div>
            </ProductActionWrapper>

            {/* Action Buttons: Add to Cart, Buy Now & Wishlist on same line */}
            <ProductActionWrapper delay={0.3}>
              <div className="flex items-center gap-2 sm:gap-3 w-full">
                <div className="flex-1 min-w-0">
                  <AddToCartBtn
                    product={product}
                    className="w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl h-11 sm:h-12"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <BuyNowBtn
                    product={product}
                    className="w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl h-11 sm:h-12"
                  />
                </div>
                <div className="shrink-0">
                  <AddToWishlistBtn
                    product={product}
                    className="!relative !top-0 !right-0 !z-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border border-zinc-200 hover:border-ushop-pink"
                  />
                </div>
              </div>
            </ProductActionWrapper>

            {/* Product Characteristics */}
            <ProductActionWrapper delay={0.4}>
              <ProductCharacteristics product={product} brand={brand} />
            </ProductActionWrapper>

            {/* Action Links */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 border-b border-zinc-100 py-4 sm:py-5">
              <Link
                href="/contact"
                className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm text-zinc-700 hover:text-ushop-pink hoverEffect transition-colors py-2 min-h-11"
              >
                <HelpCircle size={15} className="shrink-0" />
                <span className="truncate">Ask question</span>
              </Link>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("delivery-info")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
                className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm text-zinc-700 hover:text-ushop-pink hoverEffect transition-colors py-2 min-h-11"
              >
                <Truck size={15} className="shrink-0" />
                <span className="truncate">Delivery & Return</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm text-zinc-700 hover:text-ushop-pink hoverEffect transition-colors py-2 min-h-11"
              >
                <Share2 size={15} className="shrink-0" />
                <span className="truncate">Share</span>
              </button>
            </div>

            {/* Delivery Information */}
            <ProductActionWrapper delay={0.5}>
              <div id="delivery-info" className="flex flex-col border border-zinc-200/80 rounded-2xl overflow-hidden bg-white shadow-xs scroll-mt-24">
                <div className="p-4 flex items-start gap-3.5 border-b border-zinc-100">
                  <Truck size={24} className="text-ushop-pink mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-zinc-800">
                      Delivery from GH₵{MIN_SHIPPING_FEE}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Free on orders of GH₵{FREE_SHIPPING_THRESHOLD}+. The exact fee
                      depends on your delivery location and is shown at checkout.
                    </p>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3.5">
                  <CornerDownLeft size={24} className="text-ushop-pink mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-zinc-800">
                      Returns
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Defective or not-as-described items can be returned within 7 days of delivery.{" "}
                      <Link href="/faqs" className="underline hover:text-ushop-pink transition-colors font-medium">
                        Details
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </ProductActionWrapper>
          </ProductDetailsWrapper>
        </div>

        {/* Product Details Section */}
        <ProductSectionWrapper delay={0.6}>
          <ProductsDetails product={product} />
        </ProductSectionWrapper>

        {/* Trust Indicators & Guarantees */}
        <ProductSectionWrapper delay={0.7}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
            <Card className="border border-zinc-100 text-center p-5 rounded-2xl shadow-xs">
              <Shield className="h-7 w-7 text-ushop-pink mx-auto mb-3" />
              <h3 className="font-semibold text-zinc-800 text-sm mb-1">
                Secure Payment
              </h3>
              <p className="text-xs text-zinc-500">
                Pay by card or Mobile Money through Paystack, or on delivery
              </p>
            </Card>

            <Card className="border border-zinc-100 text-center p-5 rounded-2xl shadow-xs">
              <Truck className="h-7 w-7 text-ushop-pink mx-auto mb-3" />
              <h3 className="font-semibold text-zinc-800 text-sm mb-1">
                Fast Delivery
              </h3>
              <p className="text-xs text-zinc-500">
                {`Free shipping on orders over GH₵${FREE_SHIPPING_THRESHOLD}`}
              </p>
            </Card>

            <Card className="border border-zinc-100 text-center p-5 rounded-2xl shadow-xs">
              <RefreshCw className="h-7 w-7 text-ushop-pink mx-auto mb-3" />
              <h3 className="font-semibold text-zinc-800 text-sm mb-1">
                Easy Returns
              </h3>
              <p className="text-xs text-zinc-500">
                7-day returns for defective items
              </p>
            </Card>
          </div>
        </ProductSectionWrapper>

        {/* Product Specifications */}
        <ProductSectionWrapper delay={0.8}>
          <ProductSpecs product={product} />
        </ProductSectionWrapper>

        {/* Customer Reviews */}
        <ProductSectionWrapper delay={0.9}>
          <div id="reviews" className="scroll-mt-24" />
          <ProductReviews
            productId={product._id}
            productName={product.name || "this product"}
            initialReviews={productObj?.reviews as Parameters<typeof ProductReviews>[0]["initialReviews"]}
          />
        </ProductSectionWrapper>

        {/* More from Seller */}
        {sellerProducts && sellerProducts.length > 0 ? (
          <ProductSectionWrapper delay={0.95}>
            <RelatedProducts
              title={`More from ${storeData?.name || "this Seller"}`}
              subtitle="Other items listed by this vendor"
              relatedProducts={sellerProducts}
              viewMoreHref={
                storeData?.slug?.current
                  ? `/stores/${storeData.slug.current}`
                  : "/stores"
              }
            />
          </ProductSectionWrapper>
        ) : null}

        {/* You May Also Like */}
        <ProductSectionWrapper delay={1.0}>
          <RelatedProducts
            title="You May Also Like"
            subtitle="Discover similar products in this category"
            relatedProducts={relatedProducts}
            viewMoreHref="/shop"
          />
        </ProductSectionWrapper>
      </Container>
    </ProductAnimationWrapper>
  );
};

export default ProductContent;
