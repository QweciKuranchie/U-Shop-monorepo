import React from "react";
import Container from "@/components/Container";
import Link from "next/link";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { contactConfig } from "@/config/contact";
import {
  Cookie,
  ShieldCheck,
  FileText,
  Lock,
  Sliders,
  Info,
  CheckCircle2,
  Mail,
  Building,
} from "lucide-react";

export const metadata = {
  title: "Cookie Policy | U-Shop Ghana",
  description:
    "Learn about how U-Shop uses cookies and tracking technologies to deliver a secure, personalized marketplace experience.",
};

export default function CookiesPage() {
  return (
    <div className="bg-[#fbfbfd] min-h-screen py-8 sm:py-12 md:py-16">
      <Container className="max-w-4xl px-4">
        {/* Breadcrumb */}
        <DynamicBreadcrumb
          customItems={[
            { label: "Legal & Policies", href: "/terms" },
            { label: "Cookie Policy", href: "/cookies" },
          ]}
        />

        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto my-8 sm:my-12">
          <div className="inline-flex items-center justify-center p-3 bg-purple-100/70 text-ushop-purple-dark rounded-2xl mb-4">
            <Cookie className="w-8 h-8 text-ushop-pink" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-3 leading-relaxed font-medium">
            How U-Shop uses cookies to keep your account safe and your shopping experience smooth.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-gray-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4">
            <div className="flex items-center gap-2.5 text-ushop-purple-dark font-bold text-lg">
              <Info className="w-5 h-5 text-ushop-pink" />
              <h2>1. What Are Cookies?</h2>
            </div>
            <p>
              Cookies are small text files stored on your computer or mobile device when you browse our website. They allow our systems to recognize your browser, remember your session, keep your shopping cart intact as you navigate between pages, and improve marketplace speed and reliability.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4">
            <div className="flex items-center gap-2.5 text-ushop-purple-dark font-bold text-lg">
              <Sliders className="w-5 h-5 text-ushop-pink" />
              <h2>2. Categories of Cookies We Use</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="p-4 rounded-xl bg-zinc-50 border border-gray-100 space-y-2">
                <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-ushop-pink" />
                  Essential & Security Cookies
                </span>
                <p className="text-xs text-gray-600">
                  Strictly necessary for core functionality: user login authentication via Clerk, CSRF protection, cart persistence, and secure checkout sessions. These cannot be disabled.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-gray-100 space-y-2">
                <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Preference & Functionality Cookies
                </span>
                <p className="text-xs text-gray-600">
                  Remember your regional settings, currency (GHS), notification preferences, and saved search filters for a customized experience.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-gray-100 space-y-2">
                <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Performance & Analytics
                </span>
                <p className="text-xs text-gray-600">
                  Anonymous diagnostics that help us detect slow pages, broken links, and optimize product search speed across devices in Ghana.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-gray-100 space-y-2">
                <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Payment Gateways (Paystack)
                </span>
                <p className="text-xs text-gray-600">
                  Set securely by our licensed payment processor (Paystack) to process Visa, Mastercard, and Mobile Money authorizations safely.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4">
            <div className="flex items-center gap-2.5 text-ushop-purple-dark font-bold text-lg">
              <Sliders className="w-5 h-5 text-ushop-pink" />
              <h2>3. Managing Your Cookie Preferences</h2>
            </div>
            <p>
              You can control and delete cookies through your browser settings. However, disabling essential cookies may impact your ability to log in, maintain items in your shopping cart, or complete online payments.
            </p>
            <p className="text-xs text-gray-500">
              For further inquiries regarding our data handling practices, please review our{" "}
              <Link href="/privacy" className="text-ushop-pink font-semibold hover:underline">
                Master Privacy Policy
              </Link>
              .
            </p>
          </section>

          {/* Contact */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-3">
            <h3 className="font-bold text-gray-900 text-base">Contact Our Data Protection Team</h3>
            <div className="text-xs sm:text-sm text-gray-600 space-y-1">
              <p className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-400" />
                {contactConfig.company.name} Data Protection Officer
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email: {contactConfig.emails.support}
              </p>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
