"use client";

import React, { useState } from "react";
import {  Button  } from "@repo/ui";
import {  Card, CardContent, CardHeader, CardTitle  } from "@repo/ui";
import {  RadioGroup, RadioGroupItem  } from "@repo/ui";
import {  Label  } from "@repo/ui";
import {  Separator  } from "@repo/ui";
import {
  CreditCard,
  MapPin,
  Package,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import PriceFormatter from "@/components/PriceFormatter";
import Image from "next/image";
import { productImageUrl } from "@repo/sanity";
import { toast } from "sonner";
import { PAYMENT_METHODS, PaymentMethod } from "@/lib/orderStatus";
import Link from "next/link";
import {  Badge  } from "@repo/ui";
import { SanityOrder } from "@repo/sanity";

interface OrderCheckoutContentProps {
  order: SanityOrder;
}

export function OrderCheckoutContent({ order }: OrderCheckoutContentProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(PAYMENT_METHODS.CARD);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayNow = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/orders/${order._id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to create payment session");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Order Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Order Info */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-ushop-pink" />
              <h2 className="text-lg font-bold text-gray-900">
                Order #{order.orderNumber?.slice(-8)}
              </h2>
            </div>
            <Badge variant="outline" className="capitalize bg-ushop_light_pink text-ushop-purple-dark border-ushop-pink/20">
              {order.orderStatus}
            </Badge>
          </div>
          <div className="bg-zinc-50/70 rounded-2xl p-5 sm:p-6">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-muted-foreground">{order.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleDateString()
                      : order._createdAt
                      ? new Date(order._createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
          </div>
        </section>

        {/* Shipping Address */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-ushop-pink" />
            <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
          </div>
          <div className="bg-zinc-50/70 rounded-2xl p-5 sm:p-6">
              <div className="space-y-1">
                <p className="font-medium">{order.address?.name}</p>
                <p className="text-muted-foreground">{order.address?.address}</p>
                <p className="text-muted-foreground">
                  {order.address?.city}, {order.address?.state} {order.address?.zip}
                </p>
              </div>
          </div>
        </section>

        {/* Payment Method */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-ushop-pink" />
            <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
          </div>
          <div className="bg-zinc-50/70 rounded-2xl p-5 sm:p-6">
              <RadioGroup
                value={selectedPaymentMethod}
                onValueChange={(value) =>
                  setSelectedPaymentMethod(value as PaymentMethod)
                }
                className="space-y-3"
              >
                <div className={`flex items-start space-x-3 p-3.5 border rounded-xl transition-colors ${selectedPaymentMethod === PAYMENT_METHODS.CARD ? "border-ushop-pink bg-ushop_light_pink/30" : "border-gray-200 hover:border-gray-300"}`}>
                  <RadioGroupItem
                    value={PAYMENT_METHODS.CARD}
                    id="card"
                    className="mt-1 accent-ushop-purple"
                  />
                  <div className="flex-1">
                    <Label htmlFor="card" className="cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <CreditCard className="w-4 h-4 text-ushop-purple-dark" />
                        Credit/Debit Card
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pay securely with your credit or debit card via Paystack
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
          </div>
        </section>

        {/* Order Items */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-ushop-pink" />
            <h2 className="text-lg font-bold text-gray-900">
              Order Items ({order.products?.length ?? 0})
            </h2>
          </div>
          <div className="bg-zinc-50/70 rounded-2xl p-5 sm:p-6 space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(order.products ?? []).map((item: any, index: number) => (
                <div key={index} className="flex gap-3 p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-16 h-16 flex-shrink-0">
                    <Image
                      src={
                        item.product?.images?.[0]
                          ? productImageUrl(item.product.images[0]) ?? "/placeholder.svg"
                          : "/placeholder.jpg"
                      }
                      alt={item.product?.name || "Product"}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base line-clamp-1">{item.product?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm sm:text-base">
                      <PriceFormatter
                        amount={(item.product?.price ?? 0) * (item.quantity ?? 0)}
                      />
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <PriceFormatter amount={item.product?.price} /> each
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>

      {/* Order Summary & Actions */}
      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          {(() => {
            const subtotalAmount = typeof order.subtotal === "number" ? order.subtotal : (typeof order.totalPrice === "number" ? order.totalPrice : 0);
            const discountAmount = typeof order.discount === "number" ? order.discount : 0;
            const shippingAmount = typeof order.shipping === "number" ? order.shipping : 0;
            const totalAmount = typeof order.totalPrice === "number" ? order.totalPrice : 0;

            return (
              <div className="bg-zinc-50/70 rounded-2xl p-5 sm:p-6 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({(order.products || []).length} {(order.products || []).length === 1 ? "item" : "items"})</span>
                  <PriceFormatter amount={subtotalAmount} />
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Discount Applied</span>
                  {discountAmount > 0 ? (
                    <span className="text-emerald-600 font-medium">
                      -<PriceFormatter amount={discountAmount} />
                    </span>
                  ) : (
                    <span><PriceFormatter amount={0} /></span>
                  )}
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping Fee</span>
                  {shippingAmount === 0 ? (
                    <span className="text-emerald-600 font-medium">Free</span>
                  ) : (
                    <PriceFormatter amount={shippingAmount} />
                  )}
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <PriceFormatter amount={totalAmount} />
                </div>
              </div>
            );
          })()}
        </section>

        <Button
          onClick={handlePayNow}
          disabled={isProcessing}
          className="w-full h-12 text-lg font-semibold bg-ushop-purple-dark hover:bg-ushop-purple text-white shadow-md shadow-purple-900/10 cursor-pointer transition-colors"
          size="lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-ushop_light_pink" />
              Pay <PriceFormatter amount={order.totalPrice} />
            </div>
          )}
        </Button>

        <Button asChild variant="outline" className="w-full border-ushop-pink/40 text-ushop-purple hover:bg-ushop-pink hover:text-white font-semibold transition-colors">
          <Link href="/user/orders" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          <p>Secure payment</p>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}
export default OrderCheckoutContent;
