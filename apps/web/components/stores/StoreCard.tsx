import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Store as StoreIcon,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Star,
  Package,
  ArrowRight,
} from "lucide-react";
import { urlFor } from "@repo/sanity";
import { ExtendedStore } from "./StoresClient";

interface StoreCardProps {
  store: ExtendedStore;
  className?: string;
}

export default function StoreCard({ store, className = "" }: StoreCardProps) {
  const logoUrl = store.logo
    ? urlFor(store.logo as Parameters<typeof urlFor>[0]).url()
    : null;
  const slug = store.slug?.current || "";

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md hover:border-ushop-pink/30 transition-all flex flex-col justify-between group ${className}`}
    >
      <div>
        {/* Store Header Info */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="relative w-12 h-12 rounded-2xl bg-ushop-pink/10 border border-ushop-pink/20 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={store.name || "Store Logo"}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <StoreIcon className="w-6 h-6 text-ushop-pink" />
            )}
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-ushop-pink transition-colors">
                {store.name}
              </h3>
              {store.verifiedStudent && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200/80 rounded-md font-semibold text-[10px] shrink-0"
                  title="Verified Student Seller"
                >
                  <GraduationCap className="w-3 h-3 text-emerald-600" />
                  Student
                </span>
              )}

              {store.verifiedSeller && (
                <span title="Verified Merchant">
                  <CheckCircle2 className="w-3.5 h-3.5 text-ushop-pink fill-ushop-pink/10 shrink-0" />
                </span>
              )}
            </div>

            {store.ownerName && (
              <p className="text-[11px] text-gray-500 truncate mb-1">
                Owner:{" "}
                <span className="font-medium text-gray-700">
                  {store.ownerName}
                </span>
              </p>
            )}

            {/* Location Tag */}
            {store.location?.name && (
              <div className="flex flex-wrap gap-1 text-[11px]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-medium text-[11px]">
                  <MapPin className="w-3 h-3 text-ushop-pink" />
                  {store.location.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Store Description */}
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
          {store.description || "Verified merchant store on UShop."}
        </p>
      </div>

      {/* Footer Metrics & Action */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 text-xs text-gray-500">
          <span className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {store.rating || 5.0}
          </span>

          <span className="flex items-center gap-1 text-gray-600 text-[11px]">
            <Package className="w-3 h-3 text-zinc-400" />
            {store.productCount || 0} products
          </span>
        </div>

        <Link
          href={`/stores/${slug}`}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-ushop-purple hover:bg-ushop-purple-dark text-white text-xs font-semibold rounded-xl transition-all shadow-2xs group-hover:gap-1.5"
        >
          <span>Visit</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
