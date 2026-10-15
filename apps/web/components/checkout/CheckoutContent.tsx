"use client";

import { computeOrderTotals, resolvePromoCode } from "@repo/utils/pricing";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import {  Button  } from "@repo/ui";
import {  Card, CardContent, CardHeader, CardTitle  } from "@repo/ui";
import {  RadioGroup, RadioGroupItem  } from "@repo/ui";
import {  Label  } from "@repo/ui";
import {  Separator  } from "@repo/ui";
import {
  CreditCard,
  MapPin,
  ShoppingBag,
  Package,
  Loader2,
  Wallet,
  Smartphone,
  Banknote,
  Tag,
  X,
  Check,
} from "lucide-react";
import useCartStore, { CartItem } from "@/store";
import PriceFormatter from "@/components/PriceFormatter";
import Image from "next/image";
import { productImageUrl } from "@repo/sanity";
import {  Input  } from "@repo/ui";
import { toast } from "sonner";
import { PAYMENT_METHODS, PaymentMethod } from "@/lib/orderStatus";
import { OrderAddressSelector } from "@/components/checkout/OrderAddressSelector";
import { useOrderPlacement } from "@/hooks/useOrderPlacement";
import { CheckoutSkeleton } from "@/components/checkout/CheckoutSkeleton";
import { OrderPlacementOverlay } from "@/components/cart/OrderPlacementSkeleton";
import { validateMomoPhone } from "@/lib/validators";

interface OrderAddress {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default: boolean;
  createdAt: string;
  lastUsed: string;
  orderNumber: string;
  source: "order";
}

export function CheckoutContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const {
    items: cart,
    resetCart,
  } = useCartStore();
  const { placeOrder, isPlacingOrder, orderStep } = useOrderPlacement({
    user: user!,
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(PAYMENT_METHODS.CARD);
  const [momoPhoneNumber, setMomoPhoneNumber] = useState("");
  const [momoPhoneError, setMomoPhoneError] = useState("");
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
    type: "percentage" | "fixed";
  } | null>(null);
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<OrderAddress | null>(
    null,
  );
  const [addresses, setAddresses] = useState<OrderAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [actionType, setActionType] = useState<"pay" | "order" | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasInitialCart, setHasInitialCart] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<{
    isBusiness: boolean;
    isActive: boolean;
  } | null>(null);

  // Display totals come from the SAME function the server uses to price the order
  // (@repo/utils/pricing), so what is shown is what is charged. The server
  // re-computes from the catalogue and rejects the order if prices have moved.
  const totals = computeOrderTotals({
    lines: cart.map((item) => ({
      price: item.product.price,
      discount: item.product.discount,
      quantity: item.quantity,
    })),
    isBusiness: userProfile?.isBusiness === true,
    promoCode: appliedDiscount?.code,
    address: selectedAddress,
  });
  const totalDiscount = totals.productDiscount;
  const businessDiscount = totals.businessDiscount;
  const finalSubtotal = totals.subtotal;
  const promoDiscountAmount = totals.promoDiscount;
  const shipping = totals.shipping;
  const tax = totals.tax;
  const total = totals.total;

  // Fetch user profile for business account status
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;

      try {
        const response = await fetch("/api/user/status");
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserProfile({
              isBusiness: data.user.isBusiness || false,
              isActive: data.user.isActive || false,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (user && isLoaded) {
      fetchUserProfile();
    }
  }, [user, isLoaded]);

  // Fetch user addresses from previous orders
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;

      try {
        const response = await fetch(
          `/api/orders/addresses?email=${encodeURIComponent(
            user.emailAddresses[0].emailAddress,
          )}`,
        );
        if (response.ok) {
          const data = await response.json();
          setAddresses(data.addresses || []);

          // Set default address (most recently used)
          const defaultAddress = data.addresses?.find(
            (addr: OrderAddress) => addr.default,
          );
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
          } else if (data.addresses?.length > 0) {
            setSelectedAddress(data.addresses[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    if (isLoaded && user) {
      fetchAddresses();
    }
  }, [isLoaded, user]);

  // Read address from URL parameters (when coming from cart)
  useEffect(() => {
    let active = true;
    const addressParam = searchParams.get("address");
    if (addressParam) {
      try {
        const decodedAddress = JSON.parse(decodeURIComponent(addressParam));
        // Convert regular address to OrderAddress format
        const orderAddress: OrderAddress = {
          _id: decodedAddress._id,
          name: decodedAddress.name,
          email: decodedAddress.email,
          address: decodedAddress.address,
          city: decodedAddress.city,
          state: decodedAddress.state,
          zip: decodedAddress.zip,
          default: decodedAddress.default,
          createdAt: decodedAddress.createdAt,
          lastUsed: new Date().toISOString(),
          orderNumber: "cart-selected",
          source: "order" as const,
        };
        Promise.resolve().then(() => {
          if (active) setSelectedAddress(orderAddress);
        });

        // Show success message
        toast.success("Ready for checkout", {
          description:
            "Complete your order by selecting a payment method below",
          duration: 4000,
        });
      } catch (error) {
        console.error("Error parsing address from URL:", error);
        toast.error("Error loading address from cart");
      }
    }
    return () => {
      active = false;
    };
  }, [searchParams]);

  // Track initial cart state and redirect if empty
  useEffect(() => {
    let active = true;
    if (hasInitialCart === null && isLoaded && cart !== undefined) {
      Promise.resolve().then(() => {
        if (active) setHasInitialCart(cart.length > 0);
      });

      // If cart is empty on initial load, redirect to cart
      if (cart.length === 0) {
        window.location.href = "/cart";
        return;
      }
    }
    return () => {
      active = false;
    };
  }, [cart, hasInitialCart, isLoaded]);

  const handlePayNow = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    if (selectedPaymentMethod === PAYMENT_METHODS.MOBILE_MONEY) {
      if (!momoPhoneNumber.trim()) {
        setMomoPhoneError("Please enter your Mobile Money phone number");
        return;
      }
      if (!validateMomoPhone(momoPhoneNumber)) {
        setMomoPhoneError(
          "Please enter a valid 10-digit Ghana phone number (e.g. 024XXXXXXX)"
        );
        return;
      }
      setMomoPhoneError("");
    }

    setIsInitiatingPayment(true);
    setActionType(
      selectedPaymentMethod === PAYMENT_METHODS.PAY_ON_DELIVERY ? "order" : "pay"
    );

    try {
      const result = await placeOrder(
        selectedAddress,
        selectedPaymentMethod,
        finalSubtotal,
        shipping,
        tax,
        total,
        false,
        appliedDiscount?.code
      );

      if (!result || !result.success) {
        setIsInitiatingPayment(false);
        setActionType(null);
        return;
      }

      // Cash on Delivery flow
      if (result.isCOD || result.redirectTo) {
        setIsRedirecting(true);
        resetCart();
        window.location.href = result.redirectTo!;
        return;
      }

      // Paystack flow (Card or MoMo)
      if (result.paymentRequired) {
        const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
        const channel =
          selectedPaymentMethod === PAYMENT_METHODS.CARD ? "card" : "momo";

        const initRes = await fetch("/api/checkout/paystack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: result.orderId,
            channel,
            ...(channel === "momo" && { phone: momoPhoneNumber.trim() }),
          }),
        });

        const initData = await initRes.json();

        if (!initRes.ok || !initData.authorizationUrl) {
          toast.error(initData.error || "Failed to initialize payment");
          setIsInitiatingPayment(false);
          setActionType(null);
          return;
        }

        if (channel === "card") {
          // Dynamically import @paystack/inline-js to avoid SSR errors
          const PaystackPop = (await import("@paystack/inline-js")).default;
          const paystack = new PaystackPop();
          const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

          paystack.newTransaction({
            key: publicKey || "",
            email: userEmail,
            amount: Math.round(total * 100),
            currency: "GHS",
            reference: initData.reference,
            accessCode: initData.accessCode,
            onSuccess: (transaction: { reference: string }) => {
              resetCart();
              setIsRedirecting(true);
              window.location.href = `/api/checkout/paystack/callback?reference=${encodeURIComponent(
                transaction.reference
              )}`;
            },
            onCancel: () => {
              setIsInitiatingPayment(false);
              setActionType(null);
              toast.info(
                "Payment cancelled. You can try again whenever you're ready."
              );
            },
          });
        } else {
          // Mobile Money: full-page redirect to Paystack authorizationUrl
          resetCart();
          setIsRedirecting(true);
          window.location.href = initData.authorizationUrl;
        }
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      toast.error("Failed to complete checkout. Please try again.");
      setIsInitiatingPayment(false);
      setActionType(null);
    }
  };

  if (!isLoaded) {
    return <CheckoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          Please sign in to proceed with checkout.
        </p>
      </div>
    );
  }

  // Show loading during redirect process
  if (isRedirecting) {
    return (
      <div className="text-center py-10">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
        <h2 className="text-xl font-semibold mb-2">Processing your order...</h2>
        <p className="text-muted-foreground">
          Please wait while we redirect you to complete your payment.
        </p>
      </div>
    );
  }

  // If cart is empty and we had an initial cart, show loading (likely during order processing)
  if ((!cart || cart.length === 0) && hasInitialCart) {
    return <CheckoutSkeleton />;
  }

  // If cart is empty and no initial cart, this shouldn't happen due to redirect
  // But show fallback just in case
  if (!cart || cart.length === 0) {
    return (
      <div className="text-center py-10 animate-in fade-in-0 duration-500">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-4">
          Add some products to continue with checkout
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <a href="/shop">Continue Shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left Column: Payment, Address, Items */}
      <div className="lg:col-span-2 space-y-6">
        {/* Payment Method */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-ushop-pink" />
            <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
          </div>
          <Card>
            <CardContent className="p-5 sm:p-6">
              <RadioGroup
                value={selectedPaymentMethod}
                onValueChange={(value) => {
                  setSelectedPaymentMethod(value as PaymentMethod);
                  if (value !== PAYMENT_METHODS.MOBILE_MONEY) {
                    setMomoPhoneNumber("");
                    setMomoPhoneError("");
                  }
                }}
                className="space-y-3"
              >
                {/* Credit/Debit Card */}
                <div
                  className={`flex items-start space-x-3 p-3.5 border rounded-xl transition-colors ${
                    selectedPaymentMethod === PAYMENT_METHODS.CARD
                      ? "border-ushop-pink bg-ushop_light_pink/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem
                    value={PAYMENT_METHODS.CARD}
                    id="card"
                    className="mt-1 accent-ushop-purple"
                  />
                  <div className="flex-1">
                    <Label htmlFor="card" className="cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <CreditCard className="w-4 h-4 text-ushop-purple-dark" />
                        Credit / Debit Card
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pay securely with Visa or Mastercard via Paystack popup
                      </p>
                    </Label>
                  </div>
                </div>

                {selectedPaymentMethod === PAYMENT_METHODS.CARD && (
                  <div className="ml-0 mt-3 sm:ml-7 p-4 border border-dashed border-ushop-pink/40 rounded-xl bg-ushop_light_pink/10 space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-sm font-medium text-ushop-purple-dark">
                      Secure Card Payment
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Clicking &quot;Pay Now&quot; will securely launch the Paystack payment popup. No card details are ever saved on our servers.
                    </p>
                  </div>
                )}

                {/* Mobile Money */}
                <div
                  className={`flex items-start space-x-3 p-3.5 border rounded-xl transition-colors ${
                    selectedPaymentMethod === PAYMENT_METHODS.MOBILE_MONEY
                      ? "border-ushop-pink bg-ushop_light_pink/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem
                    value={PAYMENT_METHODS.MOBILE_MONEY}
                    id="mobile_money"
                    className="mt-1 accent-ushop-purple"
                  />
                  <div className="flex-1">
                    <Label htmlFor="mobile_money" className="cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <Smartphone className="w-4 h-4 text-ushop-purple-dark" />
                        Mobile Money
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pay with MTN MoMo, Telecel Cash, or AT Money
                      </p>
                    </Label>
                  </div>
                </div>

                {/* Mobile Money Phone Input Section */}
                {selectedPaymentMethod === PAYMENT_METHODS.MOBILE_MONEY && (
                  <div className="ml-0 mt-3 sm:ml-7 p-4 border border-dashed border-ushop-pink/40 rounded-xl bg-ushop_light_pink/10 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="momoPhone"
                        className="text-xs font-medium text-ushop-purple-dark"
                      >
                        Mobile Money Phone Number (Ghana)
                      </Label>
                      <div className="relative">
                        <Input
                          id="momoPhone"
                          placeholder="024XXXXXXX"
                          value={momoPhoneNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setMomoPhoneNumber(val);
                            if (momoPhoneError) setMomoPhoneError("");
                          }}
                          className={`h-11 text-base ${
                            momoPhoneError
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                          maxLength={10}
                        />
                      </div>
                      {momoPhoneError ? (
                        <p className="text-xs text-red-500 font-medium">
                          {momoPhoneError}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Enter your 10-digit number (e.g. 024, 054, 055, 059, 027, 026, 028, 057, 025). You will approve payment on your device.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Pay on Delivery */}
                <div
                  className={`flex items-start space-x-3 p-3.5 border rounded-xl transition-colors ${
                    selectedPaymentMethod === PAYMENT_METHODS.PAY_ON_DELIVERY
                      ? "border-ushop-pink bg-ushop_light_pink/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem
                    value={PAYMENT_METHODS.PAY_ON_DELIVERY}
                    id="pay_on_delivery"
                    className="mt-1 accent-ushop-purple"
                  />
                  <div className="flex-1">
                    <Label htmlFor="pay_on_delivery" className="cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <Banknote className="w-4 h-4 text-ushop-purple-dark" />
                        Pay on Delivery
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pay with cash or mobile money when your order is delivered
                      </p>
                    </Label>
                  </div>
                </div>

                {/* Pay on Delivery Info */}
                {selectedPaymentMethod === PAYMENT_METHODS.PAY_ON_DELIVERY && (
                  <div className="ml-0 mt-3 sm:ml-7 p-4 border border-dashed border-amber-300 rounded-xl bg-amber-50 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-amber-800">
                          Pay when you receive your order
                        </p>
                        <p className="text-xs text-amber-700">
                          Have the exact amount ready. Our delivery agent will collect payment upon delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </RadioGroup>
            </CardContent>
          </Card>
        </section>

        {/* Shipping Address */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-ushop-pink" />
            <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
          </div>
          <Card>
            <CardContent className="p-5 sm:p-6">
              {isLoadingAddresses ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40">
                    <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse mt-1"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-48"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-40"></div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40">
                    <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse mt-1"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-52"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-36"></div>
                    </div>
                  </div>
                </div>
              ) : searchParams.get("address") ? (
                // Show only selected address when coming from cart
                selectedAddress && (
                  <div className="p-4 rounded-xl bg-muted/40">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{selectedAddress.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAddress.address}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAddress.city}, {selectedAddress.state}{" "}
                          {selectedAddress.zip}
                        </p>
                        {selectedAddress.email && (
                          <p className="text-sm text-muted-foreground">
                            {selectedAddress.email}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-ushop-purple-dark font-semibold bg-ushop_light_pink border border-ushop-pink/20 px-2.5 py-1 rounded">
                        ✓ Selected
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <OrderAddressSelector
                  addresses={addresses}
                  selectedAddress={selectedAddress}
                  onAddressSelect={setSelectedAddress}
                  isLoading={isLoadingAddresses}
                />
              )}
            </CardContent>
          </Card>
        </section>

        {/* Order Items */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-ushop-pink" />
            <h2 className="text-lg font-bold text-gray-900">Order Items ({cart.length})</h2>
          </div>
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-3">
              {cart.map((item: CartItem) => (
                <div
                  key={item.product._id}
                  className="flex gap-3 p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-16 h-16 shrink-0">
                    <Image
                      src={
                        item.product.images?.[0]
                          ? productImageUrl(item.product.images[0]) ?? "/placeholder.svg"
                          : "/placeholder.jpg"
                      }
                      alt={item.product.name || "Product"}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base line-clamp-1">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm sm:text-base">
                      <PriceFormatter
                        amount={(item.product.price || 0) * item.quantity}
                      />
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <PriceFormatter amount={item.product.price || 0} /> each
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Right Column: Order Summary & Actions */}
      <div className="space-y-6">
        {/* Order Summary */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} {cart.length === 1 ? "item" : "items"})</span>
                <PriceFormatter amount={finalSubtotal} />
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600 text-sm font-medium">
                  <span>Product Savings</span>
                  <span>
                    -<PriceFormatter amount={totalDiscount} />
                  </span>
                </div>
              )}
              {businessDiscount > 0 && (
                <div className="flex justify-between text-blue-600 text-sm font-medium">
                  <span>Business Account Discount (2%)</span>
                  <span>
                    -<PriceFormatter amount={businessDiscount} />
                  </span>
                </div>
              )}
              {promoDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 text-sm font-medium">
                  <span>Promo Discount ({appliedDiscount?.code})</span>
                  <span>
                    -<PriceFormatter amount={promoDiscountAmount} />
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <PriceFormatter amount={shipping} />
                )}
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <PriceFormatter amount={total} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Discount Code */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-ushop-pink" />
            <h3 className="text-sm font-semibold text-gray-900">Discount Code</h3>
          </div>
          <Card>
            <CardContent className="p-5">
              <div className="space-y-3">
                {appliedDiscount ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl animate-in fade-in-0 duration-300">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-800">{appliedDiscount.code}</p>
                        <p className="text-xs text-green-600">
                          {appliedDiscount.type === "percentage"
                            ? `${appliedDiscount.amount}% off`
                            : `GH₵${appliedDiscount.amount.toFixed(2)} off`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedDiscount(null);
                        setDiscountCode("");
                        setDiscountError("");
                      }}
                      className="p-1 rounded-full hover:bg-green-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 text-green-700" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value.toUpperCase());
                          setDiscountError("");
                        }}
                        className="h-10 flex-1 uppercase"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          if (!discountCode.trim()) {
                            setDiscountError("Please enter a code");
                            return;
                          }
                          setIsApplyingCode(true);
                          setDiscountError("");
                          const promo = resolvePromoCode(discountCode);
                          if (promo) {
                            setAppliedDiscount({ code: promo.code, amount: promo.amount, type: promo.type });
                            toast.success("Discount applied!", {
                              description:
                              promo.type === "percentage"
                                ? `${promo.amount}% off your order`
                                : `GH₵${promo.amount.toFixed(2)} off your order`,
                          });
                        } else {
                          setDiscountError("Invalid discount code");
                        }
                        setIsApplyingCode(false);
                      }}
                      disabled={isApplyingCode || !discountCode.trim()}
                      className="h-10 px-4 border-ushop-pink/30 text-ushop-purple-dark hover:bg-ushop_light_pink/30 cursor-pointer"
                    >
                      {isApplyingCode ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  {discountError && (
                    <p className="text-xs text-red-500 animate-in fade-in-0 duration-200">{discountError}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

        <div className="space-y-3">
          <Button
            onClick={handlePayNow}
            disabled={
              isPlacingOrder ||
              isInitiatingPayment ||
              !selectedAddress ||
              cart.length === 0 ||
              (selectedPaymentMethod === PAYMENT_METHODS.MOBILE_MONEY &&
                !validateMomoPhone(momoPhoneNumber))
            }
            className="w-full h-12 text-lg font-semibold bg-ushop-purple-dark hover:bg-ushop-purple text-white shadow-md shadow-purple-900/10 cursor-pointer transition-colors"
            size="lg"
          >
            {isPlacingOrder || isInitiatingPayment ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </div>
            ) : selectedPaymentMethod === PAYMENT_METHODS.MOBILE_MONEY ? (
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-ushop_light_pink" />
                Pay with Mobile Money
              </div>
            ) : selectedPaymentMethod === PAYMENT_METHODS.PAY_ON_DELIVERY ? (
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-ushop_light_pink" />
                Place Order
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-ushop_light_pink" />
                Pay Now
              </div>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>Secure checkout</p>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </div>

      {/* Order Placement Overlay */}
      {isPlacingOrder && (
        <OrderPlacementOverlay
          step={orderStep}
          isCheckoutRedirect={actionType === "pay"}
        />
      )}
    </div>
  );
}
