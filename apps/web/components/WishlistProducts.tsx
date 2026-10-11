"use client";

import useCartStore from "@/store";
import { useState } from "react";
import PriceFormatter from "./PriceFormatter";
import AddToCartBtn from "./AddToCartBtn";
import Image from "next/image";
import Link from "next/link";
import { Product, productImageUrl } from "@repo/sanity";
import Container from "./Container";
import { Heart, X, Trash2, AlertTriangle, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@repo/ui";
import { useUser } from "@clerk/nextjs";
import NoAccessToCart from "./NoAccessToCart";

const WishlistProducts = () => {
  const { user, isLoaded } = useUser();
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { favoriteProduct, removeFromFavorite, resetFavorite, addItem } = useCartStore();

  if (isLoaded && !user) {
    return (
      <NoAccessToCart details="Log in to save and view your favorite products. Don't miss out on the items you love!" />
    );
  }

  const loadMore = () => {
    setVisibleProducts((prev) => Math.min(prev + 8, favoriteProduct.length));
  };

  const handleResetFavorite = () => {
    setShowDeleteModal(true);
  };

  const confirmResetFavorite = () => {
    resetFavorite();
    setShowDeleteModal(false);
    toast.success("All products removed from wishlist");
  };

  const handleAddAllToCart = () => {
    const inStockProducts = favoriteProduct.filter(
      (p) => p.stock === undefined || p.stock > 0
    );
    if (inStockProducts.length === 0) {
      toast.error("No items in stock to add to cart");
      return;
    }
    inStockProducts.forEach((product) => {
      addItem(product);
    });
    toast.success(`Added ${inStockProducts.length} item(s) to your cart!`);
  };

  return (
    <Container className="my-8 sm:my-12">
      {favoriteProduct.length > 0 ? (
        <>
          {/* Wishlist Header & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border border-gray-100 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ushop-pink/10 flex items-center justify-center text-ushop-pink shrink-0">
                <Heart className="w-5 h-5 fill-ushop-pink text-ushop-pink" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-ushop-purple-dark flex items-center gap-2">
                  My Wishlist
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-ushop-pink/10 text-ushop-pink border border-ushop-pink/20">
                    {favoriteProduct.length} {favoriteProduct.length === 1 ? "item" : "items"}
                  </span>
                </h1>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Saved tech items and gadgets on UShop
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleAddAllToCart}
                className="bg-gradient-to-r from-ushop-purple to-ushop-pink hover:from-ushop-purple-dark hover:to-ushop-pink-dark text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add All to Cart</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleResetFavorite}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Wishlist</span>
              </Button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteProduct
              ?.slice(0, visibleProducts)
              .map((product: Product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 flex flex-col gap-4 relative group hover:shadow-md hover:border-ushop-pink/30 transition-all duration-200"
                >
                  <button
                    onClick={() => {
                      removeFromFavorite(product._id);
                      toast.success("Product removed from wishlist");
                    }}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-xs cursor-pointer"
                    aria-label="Remove from wishlist"
                  >
                    <X size={16} />
                  </button>

                  <Link
                    href={{
                      pathname: `/product/${product?.slug?.current}`,
                      query: { id: product?._id },
                    }}
                    className="block rounded-xl overflow-hidden bg-gray-50/80 p-2"
                  >
                    <Image
                      src={
                        product?.images && product.images[0]
                          ? productImageUrl(product.images[0]) ?? "/placeholder.svg"
                          : "/placeholder.jpg"
                      }
                      alt={product?.name ?? "Product"}
                      width={200}
                      height={200}
                      className={`w-full h-48 object-contain group-hover:scale-105 transition-transform duration-200 ${
                        product?.stock && product.stock === 0
                          ? "opacity-50"
                          : ""
                      }`}
                    />
                  </Link>

                  <div className="flex flex-col gap-2 flex-1">
                    <Link
                      href={{
                        pathname: `/product/${product?.slug?.current}`,
                        query: { id: product?._id },
                      }}
                    >
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight group-hover:text-ushop-pink transition-colors">
                        {product?.name}
                      </h3>
                    </Link>

                    {product?.categories && product?.categories.length > 0 && (
                      <span className="text-[11px] text-ushop-purple font-semibold uppercase tracking-wider">
                        {product.categories
                          .slice(0, 2)
                          .map((cat) => (typeof cat === "string" ? cat : null))
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          product?.stock && product.stock > 0
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-200/60"
                            : "text-rose-700 bg-rose-50 border border-rose-200/60"
                        }`}
                      >
                        {product?.stock && product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <PriceFormatter
                        amount={product?.price}
                        className="text-lg font-extrabold text-ushop-purple-dark"
                      />
                    </div>

                    <div className="mt-2">
                      <AddToCartBtn
                        product={product}
                        className="w-full h-10 text-sm font-semibold rounded-xl bg-ushop-pink hover:bg-ushop-pink-dark text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {visibleProducts < favoriteProduct.length && (
            <div className="mt-8 text-center">
              <Button
                onClick={loadMore}
                variant="outline"
                className="border-ushop-purple/30 text-ushop-purple hover:bg-ushop-purple hover:text-white font-semibold px-8 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Load More Products
              </Button>
            </div>
          )}
          {visibleProducts > 8 && (
            <div className="mt-4 text-center">
              <Button
                onClick={() => setVisibleProducts(8)}
                variant="ghost"
                className="text-gray-500 hover:text-ushop-purple font-medium cursor-pointer"
              >
                Show Less
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex min-h-[420px] flex-col items-center justify-center space-y-6 px-4 text-center bg-white border border-gray-100 rounded-3xl p-8 shadow-xs">
          <div className="relative mb-2">
            <div className="w-20 h-20 rounded-full bg-ushop-pink/10 flex items-center justify-center text-ushop-pink">
              <Heart className="h-10 w-10 text-ushop-pink fill-ushop-pink/20" />
            </div>
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ushop-purple-dark tracking-tight">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Save your favorite smartphones, laptops, and tech accessories to view or purchase them anytime.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mt-4 w-full">
            <div className="flex flex-col items-center space-y-1.5 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
              <Heart className="h-6 w-6 text-ushop-pink" />
              <h3 className="font-bold text-xs text-gray-900">Save Favorites</h3>
              <p className="text-[11px] text-gray-500 text-center">
                Keep track of items you love
              </p>
            </div>
            <div className="flex flex-col items-center space-y-1.5 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
              <ShoppingBag className="w-6 h-6 text-ushop-purple" />
              <h3 className="font-bold text-xs text-gray-900">Quick Shopping</h3>
              <p className="text-[11px] text-gray-500 text-center">
                Move items to cart in one click
              </p>
            </div>
            <div className="flex flex-col items-center space-y-1.5 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
              <span className="text-xl">🔥</span>
              <h3 className="font-bold text-xs text-gray-900">Track Deals</h3>
              <p className="text-[11px] text-gray-500 text-center">
                Never miss price drops or offers
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button asChild size="lg" className="bg-gradient-to-r from-ushop-purple to-ushop-pink hover:from-ushop-purple-dark hover:to-ushop-pink-dark text-white font-bold px-8 rounded-xl shadow-md">
              <Link href="/shop" className="flex items-center gap-2">
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold px-8 rounded-xl">
              <Link href="/category">Shop by Category</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-4 border-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-extrabold text-gray-900">
                Clear Wishlist
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 leading-relaxed font-medium">
                You&apos;re about to remove{" "}
                <span className="font-bold text-red-600">
                  {favoriteProduct.length} {favoriteProduct.length === 1 ? "product" : "products"}
                </span>{" "}
                from your wishlist. This action cannot be undone.
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="w-full sm:w-1/2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl"
            >
              Keep Products
            </Button>
            <Button
              type="button"
              onClick={confirmResetFavorite}
              className="w-full sm:w-1/2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-white shrink-0" />
              <span className="text-white">Clear All Products</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default WishlistProducts;
