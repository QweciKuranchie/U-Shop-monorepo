"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { safeHref, type HomepageBanner } from "@repo/sanity";

interface HomeBannerProps {
  slides: HomepageBanner[];
}

function HomeBanner({ slides }: HomeBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const count = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(count, 1));
  }, [count]);

  useEffect(() => {
    if (count < 2) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide, count]);

  // If banners are removed while the page is open, never point past the end.
  const active = currentSlide < count ? currentSlide : 0;
  if (count === 0) return null;

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Slides container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slide._id}
            className="relative flex flex-col-reverse md:flex-row items-center justify-between bg-ushop-purple-dark text-white py-10 px-8 md:px-16 min-w-full min-h-[480px]"
          >
            {/* Background decorative elements */}
            <div className="absolute top-1/2 -translate-y-1/2 right-12 lg:right-32 w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border border-white/10 pointer-events-none" />

            {/* Left content */}
            <div className="flex-1 space-y-5 z-10 max-w-lg mt-8 md:mt-0">
              {slide.badge && (
                <div className="inline-flex items-center gap-2 bg-ushop-pink text-white text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-widest w-max">
                  {slide.badge}
                </div>
              )}

              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold text-white">
                {slide.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={safeHref(slide.link)}
                  className="inline-flex items-center gap-2 bg-white text-ushop-purple-dark font-semibold px-7 py-2.5 md:px-10 md:py-3 rounded-full hover:bg-gray-100 transition-all shadow-lg shadow-black/10 text-sm hoverEffect group"
                >
                  {slide.buttonText || "Shop Now"}
                  <ArrowRight className="w-4 h-4 text-ushop-pink group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right image */}
            <div className="relative z-10 flex items-center justify-center flex-1">
              {/* Decorative circle */}
              <div className="absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] rounded-full bg-white/5 border border-white/10 pointer-events-none" />
              {slide.imageUrl && (
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  width={400}
                  height={400}
                  className="relative z-10 w-48 sm:w-56 md:w-72 object-contain drop-shadow-2xl"
                  priority={slideIndex === 0}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      {count > 1 && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`rounded-full transition-all duration-300 hoverEffect ${
              active === index
                ? "w-7 h-2.5 bg-ushop-pink"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>}
    </div>
  );
}

export default HomeBanner;
