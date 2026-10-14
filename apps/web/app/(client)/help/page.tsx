"use client";

import React, { useState } from "react";
import Container from "@/components/Container";
import Link from "next/link";
import { contactConfig } from "@/config/contact";
import {
  Search,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Store,
  PhoneCall,
  Mail,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  MessageCircleQuestion,
} from "lucide-react";

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: { title: string; href: string }[];
}

const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started & Orders",
    description: "Learn how to place orders, manage your cart, and check out.",
    icon: <ShoppingBag className="w-6 h-6 text-ushop-pink" />,
    articles: [
      { title: "How to place an order on U-Shop", href: "/faqs" },
      { title: "Managing your student or merchant account", href: "/account/profile" },
      { title: "Applying discount codes & student vouchers", href: "/deals" },
      { title: "Checking product specifications & warranties", href: "/shop" },
    ],
  },
  {
    id: "delivery-shipping",
    title: "Delivery & Shipping",
    description: "Information about shipping times, pickup, and tracking.",
    icon: <Truck className="w-6 h-6 text-ushop-purple" />,
    articles: [
      { title: "Delivery timelines in Accra & Kumasi (24-48 hrs)", href: "/faqs" },
      { title: "How to track your active order status", href: "/user/orders" },
      { title: "Delivery fees across regions in Ghana", href: "/faqs" },
      { title: "Residential & campus drop-off guidelines", href: "/contact" },
    ],
  },
  {
    id: "payments-pricing",
    title: "Payments & Mobile Money",
    description: "Supported payment methods, MoMo verification, and refunds.",
    icon: <CreditCard className="w-6 h-6 text-emerald-600" />,
    articles: [
      { title: "Paying with MTN MoMo, Telecel Cash & AT Money", href: "/faqs" },
      { title: "Card payments (Visa & Mastercard)", href: "/faqs" },
      { title: "Handling failed or timed-out transactions", href: "/contact" },
      { title: "When and how refund processing works", href: "/faqs" },
    ],
  },
  {
    id: "returns-warranty",
    title: "Returns & Product Warranty",
    description: "7-day return policies, warranty claims, and device inspections.",
    icon: <RotateCcw className="w-6 h-6 text-amber-500" />,
    articles: [
      { title: "7-day return policy for defective gadgets", href: "/faqs" },
      { title: "How to request a device replacement or return", href: "/contact" },
      { title: "Checking verified store warranty duration", href: "/stores" },
      { title: "What items qualify for refund or replacement", href: "/faqs" },
    ],
  },
  {
    id: "seller-merchant",
    title: "Selling on UShop",
    description: "Open a store, list tech products, and reach buyers nationwide.",
    icon: <Store className="w-6 h-6 text-indigo-600" />,
    articles: [
      { title: "Registering on seller.ushopgh.com", href: "https://seller.ushopgh.com" },
      { title: "Personal, Business & Student seller requirements", href: "https://seller.ushopgh.com" },
      { title: "Listing gadgets, setting prices & payouts", href: "https://seller.ushopgh.com" },
      { title: "Merchant guidelines and code of conduct", href: "/terms" },
    ],
  },
  {
    id: "safety-verification",
    title: "Trust, Safety & Verification",
    description: "Learn how we protect buyers and maintain verified stores.",
    icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
    articles: [
      { title: "How verified store badges work", href: "/stores" },
      { title: "Reporting suspicious products or sellers", href: "/contact" },
      { title: "Buyer protection and encrypted transactions", href: "/privacy" },
      { title: "Privacy policy & student data handling", href: "/privacy" },
    ],
  },
];

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = helpCategories.map((cat) => ({
    ...cat,
    articles: cat.articles.filter(
      (art) =>
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.articles.length > 0 || !searchQuery.trim());

  return (
    <div className="bg-[#fbfbfd] min-h-screen py-12 sm:py-16 md:py-20">
      <Container>
        {/* Hero / Search Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            How can we help you today?
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-4 leading-relaxed max-w-xl mx-auto">
            Search our guides and articles or browse by category to find answers about orders, delivery, and seller support.
          </p>

          {/* Search Input Bar */}
          <div className="mt-8 relative max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-gray-500 absolute left-4.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g. delivery, MoMo, return, seller)..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 text-sm shadow-md focus:border-ushop-purple focus:ring-2 focus:ring-ushop-purple/20 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-xs font-bold text-gray-500 hover:text-gray-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs hover:shadow-lg hover:border-ushop-purple/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                  {cat.icon}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                  {cat.title}
                </h3>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                  {cat.description}
                </p>

                <ul className="space-y-2.5 border-t border-gray-100 pt-4">
                  {cat.articles.map((art, idx) => (
                    <li key={idx}>
                      {art.href.startsWith("http") ? (
                        <a
                          href={art.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-gray-700 hover:text-ushop-purple flex items-center justify-between group/link transition-colors"
                        >
                          <span>{art.title}</span>
                          <ExternalLink className="w-3 h-3 text-gray-500 group-hover/link:text-ushop-purple shrink-0 ml-2" />
                        </a>
                      ) : (
                        <Link
                          href={art.href}
                          className="text-xs font-semibold text-gray-700 hover:text-ushop-purple flex items-center justify-between group/link transition-colors"
                        >
                          <span>{art.title}</span>
                          <ArrowRight className="w-3 h-3 text-gray-500 group-hover/link:translate-x-1 group-hover/link:text-ushop-purple shrink-0 ml-2 transition-transform" />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Help Bottom Action Strip */}
        <div className="mt-14 sm:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* FAQ Quick Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-ushop-purple/10 border border-ushop-purple/20 flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-ushop-purple text-white flex items-center justify-center mb-4">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Frequently Asked Questions
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Explore our full list of detailed answers on campus deliveries, payment security, and warranties.
              </p>
            </div>
            <Link
              href="/faqs"
              className="inline-flex items-center gap-2 text-xs font-bold text-ushop-purple hover:underline"
            >
              <span>Explore FAQs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Contact Support Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a0f1d] text-white flex flex-col justify-between shadow-xl">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center mb-4">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Need Direct Support?
              </h3>
              <p className="text-xs text-white/80 leading-relaxed mb-6">
                Our support agents are available Mon - Sat to assist with orders and seller inquiries.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:${contactConfig.company.phoneClean}`}
                className="px-4 py-2 bg-ushop-pink hover:bg-ushop-pink/90 text-white rounded-xl text-xs font-bold transition-colors"
              >
                {contactConfig.company.phone}
              </a>
              <Link
                href="/contact"
                className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Contact Form
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HelpPage;
