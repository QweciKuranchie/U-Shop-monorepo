import React from "react";
import { Metadata } from "next";
import Container from "@/components/Container";
import Link from "next/link";
import { contactConfig } from "@/config/contact";
import {
  Store,
  ShieldCheck,
  Truck,
  Users,
  GraduationCap,
  PhoneCall,
  Mail,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about U-Shop, a marketplace where Ghanaians buy and sell phones, laptops and gadgets.",
};

const AboutPage = () => {
  const highlights = [
    {
      icon: <GraduationCap className="w-6 h-6 text-ushop-pink" />,
      title: "Three-Tier Seller Model",
      description:
        "Built for Ghana's tech buyers and sellers: individuals, registered businesses and verified university students, with campus hubs for student sellers.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: "Verified Merchants & Sellers",
      description:
        "Every seller undergoes verification to ensure genuine products, honest grading, and transparent warranty coverage.",
    },
    {
      icon: <Truck className="w-6 h-6 text-ushop-purple" />,
      title: "Fast 24-48hr Nationwide Delivery",
      description:
        "Reliable doorstep delivery in Accra & Kumasi, campus pickups, and certified parcel delivery across all regions.",
    },
    {
      icon: <Store className="w-6 h-6 text-amber-500" />,
      title: "Seller Portal & Storefronts",
      description:
        "Empowering individuals, shops, and students to start e-commerce stores and sell tech products safely across Ghana.",
    },
  ];

  return (
    <div className="bg-[#fbfbfd] min-h-screen py-12 sm:py-16 md:py-20">
      <Container>
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Ghana&apos;s Trusted Tech E-Commerce Platform
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-4 leading-relaxed max-w-2xl mx-auto">
            U-Shop connects buyers with trusted Personal, Business, and Student sellers, offering verified tech products and unbeatable deals on laptops, smartphones, and accessories across Ghana.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 sm:mb-24">
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm sm:text-base">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Empowering Ghana&apos;s Tech Commerce
            </h2>
            <p>
              Buying tech gear shouldn&apos;t come with risks. U-Shop was founded to solve the challenge of finding genuine, affordable gadgets, laptops, and tech accessories across Ghana.
            </p>
            <p>
              By combining strict seller vetting, verified identity tiers (Personal, Business, and Student), and clear warranty terms, we create a secure and frictionless commerce experience for everyone.
            </p>
            <div className="pt-2 flex flex-col gap-2 font-medium text-gray-800 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Personal, Business, and Student sellers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted mobile money checkout (MTN MoMo, Telecel Cash, AT Money)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Fast 24-48hr doorstep delivery & university meetup points</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#6B1FA8] via-[#520f85] to-[#2e084d] text-white p-8 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Our Core Promise</h3>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-6">
              Every device on U-Shop is inspected for quality, and every transaction is safeguarded by our buyer protection guarantee.
            </p>
            <div className="grid grid-cols-2 gap-4 border-t border-white/15 pt-6">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
                <p className="text-xs text-white/70">Verified Sellers</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">5+</p>
                <p className="text-xs text-white/70">University Hubs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Value Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 sm:mb-24">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-ushop-pink/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Bar */}
        <div className="p-8 sm:p-10 rounded-3xl bg-ushop-purple text-white text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
            Ready to Explore Deals?
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-lg mx-auto mb-6">
            Browse deals, shop from verified stores, or start selling as an individual, a business or a verified student.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="px-6 py-3 bg-white text-gray-900 text-xs sm:text-sm font-bold rounded-xl shadow-md hover:bg-gray-100 transition-colors"
            >
              Shop Products
            </Link>
            <a
              href="https://seller.ushopgh.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-black/30 hover:bg-black/40 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors border border-white/20"
            >
              Sell on U-Shop
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AboutPage;
