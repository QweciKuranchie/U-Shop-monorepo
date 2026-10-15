"use client";

import React, { useState } from "react";
import Container from "@/components/Container";
import Link from "next/link";
import { MessageSquare, PhoneCall, Mail } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const faqsData: FAQItem[] = [
  {
    category: "Ordering & Delivery",
    question: "How does delivery work on campus and across Ghana?",
    answer:
      "We deliver directly to major university campuses, hostels, and residential addresses across Ghana. On-campus orders typically arrive within 24 to 48 hours, while national orders are dispatched via trusted courier services.",
  },
  {
    category: "Payment & Security",
    question: "What payment methods are supported on U-Shop?",
    answer:
      "We accept MTN Mobile Money (MoMo), Telecel Cash, AT Money, and Visa/Mastercard debit cards. All transactions are securely encrypted and processed with instant confirmation.",
  },
  {
    category: "Selling on U-Shop",
    question: "How can I register and sell products as a merchant or student?",
    answer:
      "You can visit our seller portal at seller.ushopgh.com to register your store. Once your student ID or business registration is verified, you can list gadgets, electronics, and accessories directly to campus buyers.",
  },
  {
    category: "Returns & Warranty",
    question: "What is the return and warranty policy for tech equipment?",
    answer:
      "All products listed by verified stores come with clear warranty details on the product page. If you receive an item that is defective or not as described, you can request a return within 7 days of delivery.",
  },
  {
    category: "Product Authenticity",
    question: "Are products on U-Shop original and verified?",
    answer:
      "Yes. We thoroughly inspect and vet merchant stores, providing 'Verified Student' and 'Verified Seller' badges so you know you're buying from trustworthy vendors with authentic tech gear.",
  },
  {
    category: "Order Tracking",
    question: "How do I track my order status?",
    answer:
      "After placing an order, you can visit your Account Orders page or the Track Your Order link in the footer to view live updates from processing to campus dispatch and delivery.",
  },
  {
    category: "Support",
    question: "How do I contact customer care for urgent assistance?",
    answer:
      "Our support team is available Monday through Saturday. You can call us directly at +233 50 956 5794, email support@ushop.com, or use our live chat for instant order resolution.",
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="bg-[#fbfbfd] min-h-screen py-12 sm:py-16 md:py-20">
      <Container className="max-w-4xl px-4">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-4 max-w-lg leading-relaxed">
            Find quick answers to common questions about shopping, campus delivery, seller registration, and tech warranties on U-Shop.
          </p>
        </div>

        {/* FAQ Accordion Container */}
        <div className="max-w-2xl w-full mx-auto mt-10 sm:mt-12 flex flex-col gap-3.5 items-start text-left">
          {faqsData.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`w-full rounded-2xl border transition-all duration-300 overflow-hidden bg-white ${
                  isOpen
                    ? "border-ushop-pink/40 shadow-md ring-1 ring-ushop-pink/20"
                    : "border-gray-200/80 hover:border-gray-300 hover:shadow-xs"
                }`}
              >
                {/* FAQ Header */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  className="flex items-center justify-between w-full cursor-pointer p-4 sm:p-5 text-left transition-colors bg-white hover:bg-gray-50/70"
                >
                  <span className="text-sm sm:text-base font-bold text-gray-900 pr-4">
                    {faq.question}
                  </span>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? "bg-ushop-pink/10 text-ushop-pink rotate-180"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-transform duration-300"
                    >
                      <path
                        d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>

                {/* FAQ Answer Body */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-sm text-gray-600 px-4 sm:px-5 pb-5 pt-1 leading-relaxed border-t border-gray-100">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA Box */}
        <div className="max-w-2xl mx-auto mt-12 p-6 sm:p-8 rounded-2xl bg-ushop-purple/5 border border-ushop-purple/15 text-center shadow-xs">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Can&apos;t find the answer you&apos;re looking for? Our customer support team is always ready to assist you.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:+233509565794"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ushop-pink text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:bg-ushop-pink/90 hoverEffect"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Support</span>
            </a>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-800 rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:bg-gray-50 hoverEffect"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FAQPage;
