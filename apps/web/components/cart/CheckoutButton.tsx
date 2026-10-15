"use client";

import React, { useState } from "react";
import {  Button  } from "@repo/ui";
import { CreditCard } from "lucide-react";
import { CartItem } from "@/store";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { trackCheckoutStarted } from "@/lib/analytics";

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

interface CheckoutButtonProps {
  cart: CartItem[];
  selectedAddress: Address | null;
}

export function CheckoutButton({ cart, selectedAddress }: CheckoutButtonProps) {
  const { user } = useUser();
  const [actionType, setActionType] = useState<"checkout" | null>(null);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    // Check stock status
    const outOfStockItems = cart.filter((item) => item.product.stock === 0);
    if (outOfStockItems.length > 0) {
      toast.error(
        "Some items are out of stock. Please remove them to continue."
      );
      return;
    }

    // Set loading state for checkout button
    setActionType("checkout");

    // Track checkout started
    const cartValue = cart.reduce(
      (sum, item) => sum + (item.product.price || 0) * item.quantity,
      0
    );
    trackCheckoutStarted({
      userId: user?.id,
      cartValue,
      itemCount: cart.length,
    });

    // Redirect with loading effect
    const addressParam = encodeURIComponent(JSON.stringify(selectedAddress));
    window.location.href = `/checkout?address=${addressParam}`;
  };


  const hasOutOfStockItems = cart.some((item) => item.product.stock === 0);

  return (
    <>
      <div className="space-y-4">
        {hasOutOfStockItems && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              Some items are out of stock and need to be removed
            </p>
          </div>
        )}

        {!selectedAddress && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-700">
              Please select a shipping address to continue
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleCheckout}
            disabled={
              actionType === "checkout" ||
              hasOutOfStockItems ||
              !selectedAddress ||
              cart.length === 0
            }
            className="w-full h-12 text-lg font-semibold bg-ushop-purple-dark hover:bg-ushop-purple text-white shadow-md shadow-purple-900/10 cursor-pointer transition-colors"
            size="lg"
          >
            {actionType === "checkout" ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Redirecting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-ushop_light_pink" />
                Proceed to Checkout
              </div>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 font-medium">
          Secure checkout
        </p>
      </div>
    </>
  );
}
