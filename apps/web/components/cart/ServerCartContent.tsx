"use client";

import React, { useEffect, useState } from "react";
import useCartStore from "@/store";
import {  Badge  } from "@repo/ui";
import {  Separator  } from "@repo/ui";
import {  Button  } from "@repo/ui";
import EmptyCart from "@/components/EmptyCart";
import PriceFormatter from "@/components/PriceFormatter";
import Link from "next/link";
import Image from "next/image";
import { productImageUrl } from "@repo/sanity";
import { CartItemControls } from "./CartItemControls";
import { AddressSelector } from "./AddressSelector";
import { CheckoutButton } from "./CheckoutButton";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogTitle,
 } from "@repo/ui";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface Address {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default: boolean;
  createdAt: string;
}

interface UserOrder {
  _id: string;
  orderNumber: string;
  totalPrice: number;
  currency: string;
  orderStatus: string;
  orderDate: string;
  customerName: string;
  email: string;
}

interface ServerCartContentProps {
  userEmail: string;
  userAddresses: Address[];
  userOrders: UserOrder[];
  onAddressesRefresh?: () => Promise<void>;
}

export function ServerCartContent({
  userEmail,

  userAddresses,
  userOrders,
  onAddressesRefresh,
}: ServerCartContentProps) {
  const {
    items: cart,
    getSubTotalPrice,
    getTotalDiscount,
    resetCart,
    setOrderPlacementState,
  } = useCartStore();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // Reset order placement state when cart page loads to clear any stale state
  useEffect(() => {
    setOrderPlacementState(false, "validating");
  }, [setOrderPlacementState]);

  const handleResetCart = () => {
    setShowClearModal(true);
  };

  const confirmResetCart = () => {
    resetCart();
    setShowClearModal(false);
    toast.success("Cart cleared successfully");
  };

  // Set default address on mount or when userAddresses changes
  useEffect(() => {
    let active = true;
    if (selectedAddress === null && userAddresses.length > 0) {
      const defaultAddress = userAddresses.find((addr) => addr.default);
      const targetAddress = defaultAddress || userAddresses[0];
      Promise.resolve().then(() => {
        if (active) setSelectedAddress(targetAddress);
      });
    }
    return () => {
      active = false;
    };
  }, [userAddresses, selectedAddress]);

  // New pricing structure:
  // 1. Subtotal = gross amount (sum of original prices before discount)
  // 2. Discount = total discount amount
  // 3. Current total = subtotal - discount
  // 4. Shipping and tax calculated on current total
  // 5. Final total = current total + shipping + tax

  const grossSubtotal = getSubTotalPrice(); // Gross amount (before discount)
  const totalDiscount = getTotalDiscount(); // Total discount amount
  const finalTotal = grossSubtotal - totalDiscount; // Final total on cart page (before shipping/tax at checkout)

  // Don't show order placement skeleton in ServerCartContent
  // The overlay is handled by CheckoutButton component instead

  if (!cart || cart.length === 0) {
    return (
      <div className="space-y-8">
        <EmptyCart />

        {/* Show recent orders if available */}
        {userOrders.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {userOrders.slice(0, 3).map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-center p-3 rounded-xl bg-muted/40"
                >
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <PriceFormatter amount={order.totalPrice} />
                    <Badge
                      variant={
                        order.orderStatus === "delivered" ? "default" : "secondary"
                      }
                      className="ml-2"
                    >
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/user/orders">
                <Button variant="outline" className="w-full h-10 rounded-xl border-ushop-pink/40 text-ushop-purple hover:bg-ushop-pink hover:text-white font-semibold transition-colors">
                  View All Orders
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 pb-16 lg:pb-0">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {cart.map((item) => (
          <div key={item.product._id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex gap-3 sm:gap-4">
              {/* Product Image */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                <Image
                  src={
                    item.product.images?.[0]
                      ? productImageUrl(item.product.images[0]) ?? "/placeholder.svg"
                      : "/placeholder.jpg"
                  }
                  alt={item.product.name || "Product"}
                  fill
                  sizes="96px"
                  className="object-cover rounded-md"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <Link href={`/product/${item.product.slug?.current}`}>
                      <h3 className="font-semibold text-sm sm:text-base hover:text-ushop-pink transition-colors line-clamp-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    {item.product.categories && item.product.categories.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {item.product.categories
                          .slice(0, 2)
                          .map((cat: unknown, idx: number) => {
                            // categories can be strings (from GROQ `categories[]->title`)
                            // or reference objects {_ref, _type, _key} from persisted store
                            const label = typeof cat === "string" ? cat : null;
                            if (!label) return null;
                            return (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-[10px] sm:text-xs bg-ushop_light_pink text-ushop-purple-dark border-ushop-pink/20 font-medium"
                              >
                                {label}
                              </Badge>
                            );
                          })}
                      </div>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-semibold text-sm sm:text-base">
                      <PriceFormatter amount={item.product.price} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      per item
                    </div>
                  </div>
                </div>

                {/* Stock Status */}
                {item.product.stock === 0 && (
                  <Badge variant="destructive" className="mt-2">
                    Out of Stock
                  </Badge>
                )}
                {item.product.stock &&
                  item.product.stock < 5 &&
                  item.product.stock > 0 && (
                    <Badge
                      variant="outline"
                      className="mt-2 text-orange-600 border-orange-600 text-xs"
                    >
                      Only {item.product.stock} left
                    </Badge>
                  )}

                {/* Controls */}
                <div className="flex flex-wrap justify-between items-center gap-2 mt-4 pt-2 border-t sm:border-t-0 border-gray-100">
                  <CartItemControls product={item.product} />
                  <div className="font-bold text-sm sm:text-base">
                    <PriceFormatter
                      amount={(item.product.price || 0) * item.quantity}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Continue Shopping & Clear Cart Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <Link href="/shop" className="inline-flex">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-10 px-5 rounded-xl border-ushop-pink/40 text-ushop-purple hover:bg-ushop-pink hover:text-white font-semibold transition-colors"
            >
              Continue Shopping
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleResetCart}
            className="w-full sm:w-auto h-10 px-4 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>
      </div>

      {/* Order Summary & Checkout */}
      <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        {/* Address Selection */}
        <AddressSelector
          userEmail={userEmail}
          addresses={userAddresses}
          selectedAddress={selectedAddress}
          onAddressSelect={setSelectedAddress}
          onAddressesRefresh={onAddressesRefresh}
        />

        {/* Order Summary (Large Screens) */}
        <div className="space-y-3 hidden lg:block">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} {cart.length === 1 ? "item" : "items"})</span>
                <PriceFormatter amount={finalTotal} />
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <PriceFormatter amount={finalTotal} />
              </div>
            </div>

            {/* Checkout */}
            <div className="pt-2">
              <CheckoutButton cart={cart} selectedAddress={selectedAddress} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-xl lg:hidden flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
            Total ({cart.length} {cart.length === 1 ? "item" : "items"})
          </span>
          <PriceFormatter amount={finalTotal} className="text-base font-bold text-ushop-purple-dark" />
        </div>
        <div className="flex-1 max-w-[210px]">
          <CheckoutButton cart={cart} selectedAddress={selectedAddress} />
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogContent className="max-w-md">
          <VisuallyHidden.Root>
            <DialogTitle>Clear Cart Confirmation</DialogTitle>
          </VisuallyHidden.Root>
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-4 border-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Clear Cart</h3>
              <p className="text-gray-600 leading-relaxed">
                You&apos;re about to remove{" "}
                <span className="font-semibold text-red-600">
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </span>{" "}
                from your cart. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => setShowClearModal(false)}
              className="flex-1 border-gray-300 hover:bg-gray-50 font-medium"
            >
              Keep Items
            </Button>
            <Button
              variant="destructive"
              onClick={confirmResetCart}
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500 font-semibold shadow-lg hover:shadow-red-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
