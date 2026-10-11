"use client";

import { Product } from "@repo/sanity";
import {  Card, CardContent, CardHeader, CardTitle  } from "@repo/ui";
import {  Badge  } from "@repo/ui";
import { FREE_SHIPPING_THRESHOLD, MIN_SHIPPING_FEE } from "@repo/utils/pricing";
import { Package, Truck, Shield, Award } from "lucide-react";

interface ProductSpecsProps {
  product: Product;
}

const ProductSpecs = ({ product }: ProductSpecsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {/* Product Features */}
      <Card className="border-2 border-gray-100 hover:border-ushop-pink/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-ushop-pink" />
            <CardTitle className="text-sm font-semibold">
              Product Info
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
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
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Brand:</span>
              <span className="font-medium">
                {((product?.brand as unknown as Record<string, string>)?.name) ||
                  ((product?.brand as unknown as Record<string, string>)?.title) ||
                  ((product as unknown as Record<string, string>)?.brandName) ||
                  "Generic"}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">SKU:</span>
            <span className="font-medium text-xs text-gray-500">
              #{product?.slug?.current?.slice(-8).toUpperCase()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Info */}
      <Card className="border-2 border-gray-100 hover:border-ushop-pink/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-ushop-pink" />
            <CardTitle className="text-sm font-semibold">Shipping</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-medium">
              Free on orders of GH₵{FREE_SHIPPING_THRESHOLD}+
            </span>
          </div>
          <div className="text-gray-600">Delivery from GH₵{MIN_SHIPPING_FEE}, shown at checkout</div>
        </CardContent>
      </Card>

      {/* Warranty */}
      <Card className="border-2 border-gray-100 hover:border-ushop-pink/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-ushop-pink" />
            <CardTitle className="text-sm font-semibold">Warranty</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="text-gray-600">
            <span className="font-medium text-ushop-purple">1 Year</span>{" "}
            Manufacturer Warranty
          </div>
          <div className="text-gray-600">
            <span className="font-medium text-ushop-purple">7 Days</span>{" "}
            Return Policy (defective items)
          </div>
          <div className="text-gray-600">Free Tech Support</div>
        </CardContent>
      </Card>

      {/* Quality Assurance */}
      <Card className="border-2 border-gray-100 hover:border-ushop-pink/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-ushop-pink" />
            <CardTitle className="text-sm font-semibold">Quality</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-medium">✓ Quality Tested</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-medium">
              ✓ Authentic Product
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-medium">
              ✓ Secure Packaging
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSpecs;
