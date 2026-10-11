"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Truck } from "lucide-react";
import Container from "./Container";
import { FREE_SHIPPING_THRESHOLD } from "@repo/utils/pricing";

const sliderBanners = [
  {
    id: 1,
    badge: "Big saving days sale",
    title: "Apple iPhone 17 Pro Max 256GB, Titanium Silver",
    price: "GH₵ 6,500.00",
    link: "/shop?query=iphone",
    bgGradient: "from-[#FBF5E6] via-[#F8EFD7] to-[#F1E3C2]",
    imgSrc: "/assets/images/hero/girl_with_headphone_image.png",
    productImg: "/assets/images/categories/phone.png",
  },
  {
    id: 2,
    badge: "Student Tech Special",
    title: "Apple MacBook Pro M3 Chip 512GB SSD, Space Gray",
    price: "GH₵ 8,999.00",
    link: "/shop?query=macbook",
    bgGradient: "from-[#F3F6FA] via-[#E8EFF7] to-[#D9E5F2]",
    imgSrc: "/assets/images/hero/boy_with_laptop_image.png",
    productImg: "/assets/images/categories/laptop.jpg",
  },
  {
    id: 3,
    badge: "Audio & Accessories Fest",
    title: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
    price: "GH₵ 1,850.00",
    link: "/shop?query=audio",
    bgGradient: "from-[#FDF2F4] via-[#FBE5E9] to-[#F7D3DA]",
    imgSrc: "/assets/images/hero/girl_with_earphone_image.png",
    productImg: "/assets/images/categories/audio.png",
  },
];

const sideBanners = [
  {
    id: 1,
    title: "Buy Flagship Mobiles with low price",
    price: "GH₵ 4,200",
    link: "/shop?query=phone",
    bgGradient: "from-[#D8EFE4] to-[#C9E7D8]",
    imgSrc: "/assets/images/categories/phone.png",
  },
  {
    id: 2,
    title: "Buy Smart Tablets & iPads with low price",
    price: "GH₵ 1,850",
    link: "/shop?query=tablet",
    bgGradient: "from-[#E6E7F8] to-[#D7DAF5]",
    imgSrc: "/assets/images/categories/Tablet.png",
  },
];

const bottomTechCards = [
  {
    id: 1,
    title: "Buy Laptops & Computing with low price",
    price: "GH₵ 3,999",
    link: "/shop?query=laptop",
    bgGradient: "from-[#F6ECE0] to-[#EFE1D0]",
    imgSrc: "/assets/images/categories/laptop.jpg",
  },
  {
    id: 2,
    title: "Buy Pro Gaming Consoles & Gear",
    price: "GH₵ 2,999",
    link: "/shop?query=gaming",
    bgGradient: "from-[#DCEEF8] to-[#C8E4F5]",
    imgSrc: "/assets/images/categories/Gaming.png",
  },
  {
    id: 3,
    title: "Buy Smart Audio & Earbuds with low price",
    price: "GH₵ 650",
    link: "/shop?query=audio",
    bgGradient: "from-[#E7E4F6] to-[#D9D4F3]",
    imgSrc: "/assets/images/categories/audio.png",
  },
  {
    id: 4,
    title: "Buy Smart TVs & Displays with low price",
    price: "GH₵ 4,500",
    link: "/shop?query=tv",
    bgGradient: "from-[#D7EFE4] to-[#C8E8D9]",
    imgSrc: "/assets/images/categories/tvs-video.png",
  },
];

const PromoBannerSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % sliderBanners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + sliderBanners.length) % sliderBanners.length
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <Container className="mt-16 lg:mt-24">
      {/* ─── TIER 1: MAIN SLIDER + 2 SIDE CARDS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Main Slider (approx 68% width on large screens) */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-2xl shadow-sm group">
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {sliderBanners.map((slide) => (
              <div
                key={slide.id}
                className={`min-w-full bg-gradient-to-r ${slide.bgGradient} p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between relative min-h-[360px] md:min-h-[420px] select-none`}
              >
                {/* Left Content */}
                <div className="flex-1 space-y-3 sm:space-y-4 z-10 max-w-md">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium tracking-wide">
                    {slide.badge}
                  </span>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                    {slide.title}
                  </h2>

                  <div className="pt-1">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      Starting At Only{" "}
                      <span className="text-lg sm:text-2xl font-bold text-ushop-red tracking-tight ml-1">
                        {slide.price}
                      </span>
                    </p>
                  </div>

                  <div className="pt-3">
                    <Link
                      href={slide.link}
                      className="inline-block px-7 py-2.5 sm:py-3 bg-[#FF4F5A] hover:bg-ushop-red text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg shadow-sm hover:shadow-md hoverEffect transform hover:-translate-y-0.5"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>

                {/* Right Visual Image */}
                <div className="relative w-full md:w-1/2 h-56 sm:h-72 md:h-80 flex items-center justify-center mt-4 md:mt-0">
                  <div className="relative w-full h-full">
                    <Image
                      src={slide.imgSrc}
                      alt={slide.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain drop-shadow-xl"
                      priority={slide.id === 1}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 shadow-md border border-gray-200/80 text-gray-700 hover:text-ushop-red hover:bg-white flex items-center justify-center transition-all hover:scale-105 z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 shadow-md border border-gray-200/80 text-gray-700 hover:text-ushop-red hover:bg-white flex items-center justify-center transition-all hover:scale-105 z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {sliderBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  currentSlide === idx
                    ? "w-4 h-2 bg-[#FF4F5A]"
                    : "w-2 h-2 bg-gray-400/60 hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: Two Stacked Side Cards (approx 32% width on large screens) */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-5 justify-between">
          {sideBanners.map((banner) => (
            <div
              key={banner.id}
              className={`flex-1 bg-gradient-to-r ${banner.bgGradient} rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group`}
            >
              <div className="space-y-2 z-10 max-w-[62%]">
                <h3 className="text-sm sm:text-base font-bold text-gray-800 leading-snug line-clamp-2">
                  {banner.title}
                </h3>
                <p className="text-base sm:text-lg font-extrabold text-[#FF4F5A]">
                  {banner.price}
                </p>
                <Link
                  href={banner.link}
                  className="inline-block text-xs font-bold text-gray-900 hover:text-ushop-red uppercase tracking-wider underline underline-offset-4 hoverEffect pt-1"
                >
                  Shop Now
                </Link>
              </div>

              <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0">
                <Image
                  src={banner.imgSrc}
                  alt={banner.title}
                  fill
                  sizes="130px"
                  className="object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── TIER 2: FREE SHIPPING STRIP ─── */}
      <div className="mt-7 bg-white border-2 border-[#FF4F5A] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-[#FF4F5A] flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-wide">
              Free Shipping
            </h4>
            <p className="text-xs sm:text-sm text-gray-500">
              {`Free delivery on orders of GH₵${FREE_SHIPPING_THRESHOLD} and above`}
            </p>
          </div>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#FF4F5A] hover:bg-ushop-red text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg shadow-xs hover:shadow-md hoverEffect transform hover:-translate-y-0.5 shrink-0"
        >
          Shop Now
        </Link>
      </div>

      {/* ─── TIER 3: 4-COLUMN TECH DEALS ROW ─── */}
      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {bottomTechCards.map((card) => (
          <div
            key={card.id}
            className={`bg-gradient-to-r ${card.bgGradient} rounded-2xl p-5 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group`}
          >
            <div className="space-y-1.5 z-10 max-w-[62%]">
              <h4 className="text-xs sm:text-sm font-bold text-gray-800 leading-snug line-clamp-2">
                {card.title}
              </h4>
              <p className="text-sm sm:text-base font-extrabold text-[#FF4F5A]">
                {card.price}
              </p>
              <Link
                href={card.link}
                className="inline-block text-[11px] font-bold text-gray-900 hover:text-ushop-red uppercase tracking-wider underline underline-offset-4 hoverEffect pt-1"
              >
                Shop Now
              </Link>
            </div>

            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
              <Image
                src={card.imgSrc}
                alt={card.title}
                fill
                sizes="100px"
                className="object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
              />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default PromoBannerSection;
