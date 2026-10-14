"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { safeHref, type HomepageBanner } from "@repo/sanity";

interface HomeBannerProps {
  slides: HomepageBanner[];
}

function HomeBanner({ slides }: HomeBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Autoplay stops while the user hovers/focuses the banner, if they press pause,
  // or if their OS asks for reduced motion (WCAG 2.2.2).
  const [hoverOrFocus, setHoverOrFocus] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const count = slides.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const autoplay = count > 1 && !hoverOrFocus && !userPaused && !reducedMotion;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(count, 1));
  }, [count]);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, autoplay]);

  // If banners are removed while the page is open, never point past the end.
  const active = currentSlide < count ? currentSlide : 0;
  if (count === 0) return null;

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section
      className="relative overflow-hidden rounded-3xl"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setHoverOrFocus(true)}
      onMouseLeave={() => setHoverOrFocus(false)}
      onFocus={() => setHoverOrFocus(true)}
      onBlur={() => setHoverOrFocus(false)}
    >
      {/* Slides container */}
      <div
        aria-live={autoplay ? "off" : "polite"}
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slide._id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} of ${count}`}
            aria-hidden={slideIndex !== active}
            inert={slideIndex !== active}
            className="relative flex flex-col-reverse md:flex-row items-center justify-between bg-ushop-purple-dark text-white py-10 px-8 md:px-16 min-w-full min-h-[480px]"
          >
            {/* Background decorative elements */}
            <div className="absolute top-1/2 -translate-y-1/2 right-12 lg:right-32 w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border border-white/10 pointer-events-none" />

            {/* Left content */}
            <div className="flex-1 space-y-5 z-10 max-w-lg mt-8 md:mt-0">
              {slide.badge && (
                <p className="text-sm font-semibold text-white/90">{slide.badge}</p>
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
                  preload={slideIndex === 0}
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
            aria-current={active === index}
            className={`rounded-full transition-all duration-300 hoverEffect ${
              active === index
                ? "w-7 h-2.5 bg-ushop-pink"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>}

      {count > 1 && (
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
          className="absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
        >
          {userPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
        </button>
      )}
    </section>
  );
}

export default HomeBanner;
