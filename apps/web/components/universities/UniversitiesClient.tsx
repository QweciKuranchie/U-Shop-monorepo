"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Building2,
  ArrowRight,
  Search,
} from "lucide-react";
import { getUniversityImageUrl } from "@/lib/universityImages";

export interface UniversityCardItem {
  _id: string;
  name?: string;
  slug?: { current?: string };
  city?: string;
  domain?: string;
  productCount?: number;
  image?: unknown;
  logo?: unknown;
}

interface UniversitiesClientProps {
  universitiesList: UniversityCardItem[];
}

export default function UniversitiesClient({
  universitiesList,
}: UniversitiesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  // Extract unique cities for filter pills
  const cities = useMemo(() => {
    const set = new Set<string>();
    universitiesList.forEach((uni) => {
      if (uni.city) set.add(uni.city);
    });
    return Array.from(set);
  }, [universitiesList]);

  const filteredUniversities = useMemo(() => {
    let result = universitiesList || [];

    if (selectedCity !== "all") {
      result = result.filter(
        (u) => u.city?.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((u) => {
        const nameMatch = u.name?.toLowerCase().includes(q);
        const cityMatch = u.city?.toLowerCase().includes(q);
        const domainMatch = u.domain?.toLowerCase().includes(q);
        return nameMatch || cityMatch || domainMatch;
      });
    }

    return result;
  }, [universitiesList, searchQuery, selectedCity]);

  return (
    <div>
      {/* Hero Banner matching Stores Banner Style */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden mb-8 shadow-2xl min-h-[260px] sm:min-h-[300px] md:min-h-[340px] flex flex-col items-center justify-center text-center p-6 sm:p-10 border border-slate-800/40">
        {/* Background Image - Modern Campus at Night */}
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80"
          alt="University Campus Architecture"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />

        {/* Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-slate-900/85" />
        <div className="absolute inset-0 bg-black/40 backdrop-brightness-90" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-red-600/15 blur-[100px] rounded-full pointer-events-none" />

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
          {/* Main Banner Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
            Browse Campus Hubs
          </h1>

          {/* Red Curved Brush Stroke Underline */}
          <div className="relative w-48 sm:w-64 md:w-80 h-3.5 mx-auto mt-1 sm:mt-1.5 mb-6 sm:mb-8">
            <svg
              viewBox="0 0 240 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-red-600 drop-shadow-[0_2px_10px_rgba(232,0,11,0.7)]"
            >
              <path
                d="M 3 9 C 45 4, 125 3, 237 8 C 175 4, 85 5, 3 9 Z"
                fill="currentColor"
              />
            </svg>
          </div>

          {/* Floating Glassmorphism Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="relative w-full max-w-xl mx-auto shadow-2xl group"
          >
            <div className="absolute -inset-0.5 rounded-2xl sm:rounded-full bg-gradient-to-r from-red-600/40 via-purple-600/30 to-red-600/40 blur-sm opacity-60 group-hover:opacity-90 transition-opacity" />

            <div className="relative flex items-center bg-slate-900/65 border border-white/20 rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3.5 text-white shadow-inner focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/30 transition-all">
              <button
                type="submit"
                className="text-gray-300 hover:text-white shrink-0 mr-3 transition-colors cursor-pointer"
                aria-label="Search campus"
              >
                <Search className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus by name, city, or domain..."
                className="w-full bg-transparent text-white text-sm sm:text-base placeholder-gray-300/80 outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-300 hover:text-white text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 ml-2 font-medium transition-colors shrink-0 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Filter Bar & City Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCity("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCity === "all"
                ? "bg-ushop-purple text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All Campuses ({universitiesList.length})
          </button>

          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCity === city
                  ? "bg-ushop-pink text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {city}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-500 font-medium self-end sm:self-center">
          Showing <span className="font-bold text-gray-900">{filteredUniversities.length}</span> active campuses
        </div>
      </div>

      {/* Universities Grid */}
      {filteredUniversities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredUniversities.map((uni: UniversityCardItem) => {
            const imageUrl = getUniversityImageUrl(uni);
            const slug = uni.slug?.current || "";

            return (
              <Link
                key={uni._id}
                href={`/universities/${slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md hover:border-ushop-pink/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Campus Image Header */}
                  <div className="relative aspect-video w-full bg-ushop-light/40 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={uni.name || "University Campus"}
                      fill
                      className="object-cover transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* City Tag on Image */}
                    {uni.city && (
                      <div className="absolute top-3 right-3 bg-white text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                        <MapPin className="w-3 h-3 text-ushop-pink" />
                        {uni.city}
                      </div>
                    )}

                    {/* Campus Title Overlay */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg font-bold text-white drop-shadow-xs line-clamp-1">
                        {uni.name}
                      </h3>
                    </div>
                  </div>

                  {/* Campus Body Info */}
                  <div className="p-5">
                    {uni.domain && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-ushop-purple bg-ushop-purple/10 px-2.5 py-1 rounded-md font-medium mb-3">
                        <span>@{uni.domain}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>Available Items</span>
                      <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
                        {uni.productCount ?? 0} listed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-ushop-pink group-hover:bg-ushop-pink group-hover:text-white transition-colors duration-200">
                  <span>Explore Campus Shop</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
          <Building2 className="w-12 h-12 text-ushop-pink/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No Campus Hubs Found
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            {searchQuery
              ? `No campus hubs match "${searchQuery}". Try searching another university name or city.`
              : "No university campus hubs available."}
          </p>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCity("all");
              }}
              className="px-4 py-2 bg-ushop-purple text-white text-xs font-semibold rounded-xl hover:bg-ushop-purple-dark transition-colors"
            >
              Clear Search & Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
