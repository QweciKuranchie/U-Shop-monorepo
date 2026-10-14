"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Flame, ChevronDown, Zap, GraduationCap, Tag, ShoppingBag } from "lucide-react";
import { headerData } from "@/Constants/data";
import { usePathname } from "next/navigation";
import CategoriesMegaMenu, { type NavCategory } from "./layout/CategoriesMegaMenu";

const dealsDropdownItems = [
  {
    title: "Flash Sales",
    badge: "Up to 90% off",
    href: "/deals/flash",
    icon: Zap,
    color: "text-ushop-red",
  },
  {
    title: "Student Deals",
    badge: "Up to 90% off",
    href: "/deals/students",
    icon: GraduationCap,
    color: "text-emerald-600",
  },
  {
    title: "Clearance",
    badge: "Up to 50% off",
    href: "/deals/clearance",
    icon: Tag,
    color: "text-amber-600",
  },
  {
    title: "Black Friday",
    badge: "Mega Deals",
    href: "/deals/black-friday",
    icon: ShoppingBag,
    color: "text-gray-900",
  },
  {
    title: "Special Offers",
    badge: "Exclusive",
    href: "/deals/special-offers",
    icon: Flame,
    color: "text-ushop-pink",
  },
];

const HeaderNavBar = ({ categories = [] }: { categories?: NavCategory[] }) => {
  const pathname = usePathname();
  const [isDealsOpen, setIsDealsOpen] = useState(false);

  return (
    <div className="border-t border-gray-100 bg-white">
      {/* ── Row 3: Navigation bar ── */}
      <div className="max-w-7xl mx-auto px-4 hidden md:block">
        <nav
          className="flex items-center justify-between py-2"
          aria-label="Main navigation"
        >
          <div className="flex flex-row items-center gap-6">
            {/* Navigation links — Only shown on desktop */}
            {headerData?.map((item) => {
              if (item.href === "/category") {
                return (
                  <CategoriesMegaMenu
                    key={item.title}
                    categories={categories}
                    isActive={pathname?.startsWith("/category") ?? false}
                  />
                );
              }
              const IconComponent = item?.icon;
              const isActive = pathname === item?.href;

              return (
                <Link
                  key={item?.title}
                  href={item?.href}
                  className={`flex items-center gap-1.5 text-sm capitalize font-semibold py-1 transition-colors relative group ${
                    isActive ? "text-ushop-pink" : "text-gray-700 hover:text-ushop-pink"
                  }`}
                >
                  {IconComponent && <IconComponent className="w-4 h-4 shrink-0" />}
                  <span>{item?.title}</span>
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-ushop-pink transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Deals & Offers — Dropdown Menu */}
          <div
            className="relative group"
            onMouseEnter={() => setIsDealsOpen(true)}
            onMouseLeave={() => setIsDealsOpen(false)}
            onFocus={() => setIsDealsOpen(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsDealsOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsDealsOpen(false);
            }}
          >
            <Link
              href="/deals"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-ushop-red/10 text-ushop-red hover:bg-ushop-red hover:text-white transition-all text-xs font-extrabold tracking-wide uppercase"
            >
              <Flame className="w-4 h-4 fill-ushop-red group-hover:fill-white text-ushop-red group-hover:text-white animate-pulse shrink-0" />
              <span>Deals & Offers</span>
              <span className="px-1.5 py-0.2 bg-ushop-red group-hover:bg-white text-white group-hover:text-ushop-red text-xs font-bold rounded-md ml-0.5">
                HOT
              </span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 transition-transform group-hover:rotate-180" />
            </Link>

            {/* Dropdown Box */}
            <div
              className={`absolute right-0 top-full mt-1 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 transition-all duration-200 ${
                isDealsOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Featured Sales & Offers
                </p>
              </div>

              {dealsDropdownItems.map((deal) => {
                const IconComponent = deal.icon;
                return (
                  <Link
                    key={deal.title}
                    href={deal.href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group/item"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg bg-gray-100 group-hover/item:bg-white shrink-0 ${deal.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 group-hover/item:text-ushop-pink transition-colors">
                        {deal.title}
                      </span>
                    </div>

                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-ushop-red border border-red-100 shrink-0">
                      {deal.badge}
                    </span>
                  </Link>
                );
              })}

              <div className="mt-2 pt-2 border-t border-gray-100 text-center">
                <Link
                  href="/deals"
                  className="text-xs font-extrabold text-ushop-pink hover:underline block py-1"
                >
                  Browse All Hot Deals →
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default HeaderNavBar;
