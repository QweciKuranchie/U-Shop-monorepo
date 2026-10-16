"use client";

import { Product } from "@repo/sanity";
import { Badge } from "@repo/ui";
import { FREE_SHIPPING_THRESHOLD, MIN_SHIPPING_FEE } from "@repo/utils/pricing";
import { Package, Truck, Shield, Award } from "lucide-react";

interface ProductSpecsProps {
  product: Product;
}

interface ListingWarranty {
  warrantyType?: string | null;
  warrantyDuration?: number | null;
  warrantyDescription?: string | null;
  freeTechSupport?: boolean | null;
}

const CONDITION_LABELS: Record<string, string> = {
  new: "Brand New",
  refurbished: "Refurbished",
  like_new: "Used - Like New",
  good: "Used - Good",
  fair: "Used - Fair",
  for_parts: "Used - For Parts",
  used: "Used / Refurbished",
};

function formatWarrantyDuration(months?: number | null) {
  if (!months) return "";
  if (months % 12 === 0) {
    const years = months / 12;
    return `${years} ${years === 1 ? "Year" : "Years"}`;
  }
  return `${months} ${months === 1 ? "Month" : "Months"}`;
}

const ProductSpecs = ({ product }: ProductSpecsProps) => {
  const listing = product as unknown as ListingWarranty;
  const { condition, store } = product as unknown as {
    condition?: string | null;
    store?: { verifiedSeller?: boolean | null; verifiedStudent?: boolean | null } | null;
  };
  const hasWarranty =
    (listing.warrantyType === "seller_warranty" || listing.warrantyType === "manufacturer_warranty") &&
    Boolean(listing.warrantyDuration);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {/* Product Features */}
      <div className="bg-zinc-50/80 rounded-xl p-4.5 space-y-3 transition-colors hover:bg-zinc-100/60">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-ushop-pink" />
          <h3 className="text-sm font-semibold text-gray-900">
            Product Info
          </h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Stock:</span>
            <Badge
              variant={product?.stock === 0 ? "destructive" : "default"}
              className={
                product?.stock === 0
                  ? ""
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100/60"
              }
            >
              {product?.stock === 0
                ? "Out of Stock"
                : `${product?.stock} Available`}
            </Badge>
          </div>
          {Boolean(product?.brand || (product as unknown as Record<string, unknown>)?.brandName) && (
            <div className="flex justify-between">
              <span className="text-gray-600">Brand:</span>
              <span className="font-medium">
                {((product?.brand as unknown as Record<string, string>)?.name) ||
                  ((product?.brand as unknown as Record<string, string>)?.title) ||
                  ((product as unknown as Record<string, string>)?.brandName) ||
                  "Generic"}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">SKU:</span>
            <span className="font-medium text-xs text-gray-500">
              #{product?.slug?.current?.slice(-8).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="bg-zinc-50/80 rounded-xl p-4.5 space-y-3 transition-colors hover:bg-zinc-100/60">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-ushop-pink" />
          <h3 className="text-sm font-semibold text-gray-900">Shipping</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-medium">
              Free on orders of GH₵{FREE_SHIPPING_THRESHOLD}+
            </span>
          </div>
          <div className="text-gray-600">Delivery from GH₵{MIN_SHIPPING_FEE}, shown at checkout</div>
        </div>
      </div>

      {/* Warranty: comes from the seller's listing, never hardcoded */}
      <div className="bg-zinc-50/80 rounded-xl p-4.5 space-y-3 transition-colors hover:bg-zinc-100/60">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-ushop-pink" />
          <h3 className="text-sm font-semibold text-gray-900">Warranty</h3>
        </div>
        <div className="space-y-2 text-sm">
          {hasWarranty ? (
            <div className="text-gray-600">
              <span className="font-medium text-ushop-purple">
                {formatWarrantyDuration(listing.warrantyDuration)}
              </span>{" "}
              {listing.warrantyType === "manufacturer_warranty" ? "Manufacturer" : "Seller"} Warranty
            </div>
          ) : (
            <div className="text-gray-600">No warranty offered by the seller</div>
          )}
          {hasWarranty && listing.warrantyDescription && (
            <p className="text-gray-500 text-xs whitespace-pre-line">{listing.warrantyDescription}</p>
          )}
          <div className="text-gray-600">
            <span className="font-medium text-ushop-purple">7 Days</span>{" "}
            Return Policy (defective items)
          </div>
          {listing.freeTechSupport && <div className="text-gray-600">Free Tech Support from the seller</div>}
        </div>
      </div>

      {/* Trust: only facts that come from the listing and the seller's store */}
      <div className="bg-zinc-50/80 rounded-xl p-4.5 space-y-3 transition-colors hover:bg-zinc-100/60">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-ushop-pink" />
          <h3 className="text-sm font-semibold text-gray-900">Condition & Seller</h3>
        </div>
        <div className="space-y-2 text-sm">
          {condition && (
            <div className="flex justify-between">
              <span className="text-gray-600">Condition:</span>
              <span className="font-medium">{CONDITION_LABELS[condition] ?? "Used / Refurbished"}</span>
            </div>
          )}
          {store?.verifiedSeller ? (
            <div className="text-emerald-600 font-medium">✓ Verified seller</div>
          ) : (
            <div className="text-gray-600">Seller not yet verified</div>
          )}
          {store?.verifiedStudent && <div className="text-emerald-600 font-medium">✓ Verified student</div>}
          <p className="text-xs text-gray-500">
            Check the seller&apos;s reviews below and pay securely through UShop checkout.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductSpecs;
