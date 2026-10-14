"use client";

import React, { useRef } from "react";
import { Product } from "@repo/sanity";
import ProductCard from "./ProductCard";
import Container from "./Container";
import Title from "./Title";
import Link from "next/link";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

interface PopularProductSectionProps {
  products: Product[];
}

const PopularProductSection: React.FC<PopularProductSectionProps> = ({
  products,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Container className="mt-16 lg:mt-24">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-3 sm:mb-4">
          <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-ushop-purple rounded-full"></div>
          <Title className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-dark-color flex items-center gap-2">
            Popular Products
          </Title>
          <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-ushop-purple rounded-full"></div>
        </div>
        <p className="text-light-color text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-4">
          Customer favorites and top trending picks loved by students and shoppers
        </p>

        <Link
          href={"/deals"}
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-ushop-pink/10 text-ushop-pink font-semibold rounded-full hover:bg-ushop-pink hover:text-white border-2 border-ushop-pink/20 hover:border-ushop-pink hoverEffect"
        >
          Explore All Trending
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

      {/* Popular Products One-Line Scrollable Track */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ushop-purple/10 text-ushop-purple flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                Top Rated & Trending
              </h3>
              <p className="text-xs sm:text-xs text-light-color">
                Handpicked based on reviews and customer demand
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Scroll Navigation Buttons */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => handleScroll("left")}
                aria-label="Previous products"
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-ushop-purple hover:border-ushop-purple hoverEffect shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll("right")}
                aria-label="Next products"
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-ushop-purple hover:border-ushop-purple hoverEffect shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* One-Line Scrollable Product Track */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 sm:gap-5 pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-ushop-purple/30 scrollbar-track-transparent scroll-smooth"
        >
          {products.map((product, index) => (
            <div
              key={product._id}
              className="w-[165px] sm:w-[220px] md:w-[250px] shrink-0 snap-start hoverEffect transform"
            >
              <ProductCard
                product={product}
                priority={index < 4}
              />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default PopularProductSection;
