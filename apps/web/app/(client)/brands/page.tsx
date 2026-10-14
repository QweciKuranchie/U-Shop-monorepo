import Container from "@/components/Container";
import Title from "@/components/Title";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { getBrandsWithCount } from "@repo/sanity/queries";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@repo/sanity";
import { Package, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Official Brands | UShop",
  description: "Browse products by your favorite official brands on UShop.",
};

const BrandsPage = async () => {
  const brands = await getBrandsWithCount();

  return (
    <div className="min-h-screen bg-gray-50/50 py-6">
      <Container>
        {/* Breadcrumb */}
        <DynamicBreadcrumb
          customItems={[
            { label: "Brands", href: "/brands" }
          ]}
        />

        {/* Hero Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-xs border border-gray-100 mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-ushop-pink/10 text-ushop-pink text-xs font-semibold rounded-full mb-3">
              Official Partners & Manufacturers
            </span>
            <Title className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
              Browse by Brand
            </Title>
            <p className="text-gray-600 text-sm sm:text-base max-w-xl">
              Explore our curated selection of top global brands and verified sellers.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-ushop-light/50 px-5 py-3 rounded-xl border border-gray-200/60">
            <Package className="w-8 h-8 text-ushop-pink" />
            <div className="text-left">
              <div className="text-lg font-bold text-gray-900">{brands.length} Brands</div>
              <div className="text-xs text-gray-500">Available in store</div>
            </div>
          </div>
        </div>

        {/* Brands Grid */}
        {brands && brands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {brands.map((brand: any) => {
              const brandImg = brand.image || (brand as Record<string, unknown>).logo;
              const imageUrl = brandImg ? urlFor(brandImg).url() : null;
              const slug = brand.slug?.current || "";

              return (
                <Link
                  key={brand._id}
                  href={`/brands/${slug}`}
                  className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md hover:border-ushop-pink/30 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Brand Logo Container */}
                    <div className="relative aspect-video w-full rounded-xl bg-ushop-light/40 border border-gray-100 flex items-center justify-center p-4 mb-4 group-hover:scale-[1.02] transition-transform duration-300">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={brand.name || "Brand"}
                          fill
                          className="object-contain p-3"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      ) : (
                        <div className="text-2xl font-bold text-gray-500 group-hover:text-ushop-pink transition-colors">
                          {brand.name?.charAt(0) || "B"}
                        </div>
                      )}
                    </div>

                    {/* Brand Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-ushop-pink transition-colors truncate">
                        {brand.name}
                      </h3>
                      {brand.productCount !== undefined && brand.productCount > 0 && (
                        <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          {brand.productCount} {brand.productCount === 1 ? "item" : "items"}
                        </span>
                      )}
                    </div>

                    {/* Brand Description */}
                    {brand.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                        {brand.description}
                      </p>
                    )}
                  </div>

                  {/* Footer link button */}
                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-ushop-pink group-hover:translate-x-1 transition-transform">
                    <span>Shop products</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">No brands found</h3>
            <p className="text-sm text-gray-500 mt-1">Check back later as new brands are added.</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BrandsPage;
