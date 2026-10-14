import Container from "./Container";
import { getAllBrands } from "@repo/sanity/queries";
import Title from "./Title";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@repo/sanity";
import { Brand } from "@repo/sanity";

const ShopByBrands = async () => {
  const allBrands: Brand[] = await getAllBrands();
  const displayBrands = allBrands?.filter(
    (b: Brand) => b.featured === true || Boolean(b.image || b.logo)
  );

  if (!displayBrands || displayBrands.length === 0) {
    return null;
  }

  return (
    <Container className="mt-16 lg:mt-24">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-3 sm:mb-4">
          <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-ushop-pink rounded-full"></div>
          <Title className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-dark-color">
            Shop By Brands
          </Title>
          <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-ushop-pink rounded-full"></div>
        </div>
        <p className="text-light-color text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-4">
          Discover products from your favorite trusted brands
        </p>
        <Link
          href={"/brands"}
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-ushop-pink/10 text-ushop-pink font-semibold rounded-full hover:bg-ushop-pink hover:text-white border-2 border-ushop-pink/20 hover:border-ushop-pink hoverEffect"
        >
          Explore All Brands
          <svg
            className="w-4 h-4 hoverEffect group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>

      {/* Brands Marquee Carousel */}
      <div className="mt-8 mb-12 overflow-hidden relative">
        <div className="overflow-hidden w-full relative select-none">
          {/* Left Gradient Mask */}
          <div className="absolute left-0 top-0 h-full w-12 sm:w-20 md:w-28 z-10 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent" />

          {/* Marquee Inner Track */}
          <div className="flex will-change-transform min-w-max animate-marquee py-2">
            {[...displayBrands, ...displayBrands].map((brand, index) => {
              const brandImg =
                (brand as Record<string, unknown>).image ||
                (brand as Record<string, unknown>).logo;

              return (
                <Link
                  key={`${brand?._id}-${index}`}
                  href={`/brands/${brand?.slug?.current}`}
                  className="group bg-white rounded-2xl p-4 md:p-5 flex items-center justify-center aspect-square hover:shadow-lg shadow-2xs border border-gray-200/80 hover:border-ushop-pink/40 hoverEffect transform w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-2.5 sm:mx-3 flex-shrink-0"
                >
                  {brandImg ? (
                    <div className="relative w-full h-full flex items-center justify-center p-1">
                      <Image
                        src={urlFor(brandImg).url()}
                        alt={`${brand?.name || "Brand"} logo`}
                        fill
                        sizes="(max-width: 768px) 120px, 160px"
                        className="object-contain p-1 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-1">
                      <div className="w-8 h-8 rounded-full bg-ushop-pink/10 text-ushop-pink font-extrabold flex items-center justify-center text-xs mb-1 group-hover:bg-ushop-pink group-hover:text-white transition-colors shadow-2xs">
                        {brand?.name?.charAt(0) || "B"}
                      </div>
                      <span className="text-xs font-bold text-gray-800 group-hover:text-ushop-pink transition-colors line-clamp-2 leading-tight">
                        {brand?.name}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Gradient Mask */}
          <div className="absolute right-0 top-0 h-full w-12 sm:w-20 md:w-28 z-10 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent" />
        </div>

        {/* Brand Grid Footer */}
        <div className="text-center mt-6 pt-4 border-t border-gray-100">
          <p className="text-dark-text text-xs sm:text-sm">
            <span className="font-semibold text-ushop-pink">
              {displayBrands?.length}+
            </span>{" "}
            trusted brands and counting
          </p>
        </div>
      </div>
    </Container>
  );
};

export default ShopByBrands;

