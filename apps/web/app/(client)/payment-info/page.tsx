import React from "react";
import Container from "@/components/Container";
import Link from "next/link";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { contactConfig } from "@/config/contact";
import {
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  Gift,
  RefreshCw,
  Tag,
  HelpCircle,
  Mail,
  PhoneCall,
} from "lucide-react";

export const metadata = {
  title: "Payments Information & Methods | UShop Ghana",
  description:
    "Learn about UShop payment methods including Mobile Money, Cards, Bank Transfers, Payment on Delivery, and Voucher terms.",
};

export default function PaymentInfoPage() {
  return (
    <div className="bg-[#fbfbfd] min-h-screen py-8 sm:py-12 md:py-16">
      <Container className="max-w-4xl px-4">
        {/* Breadcrumb */}
        <DynamicBreadcrumb
          customItems={[
            { label: "Help & Customer Care", href: "/help" },
            { label: "Payments Info", href: "/payment-info" },
          ]}
        />

        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto my-8 sm:my-12">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Payments Information
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 mt-3 leading-relaxed font-medium">
            Learn about accepted payment methods, mobile money checkout, card safety, vouchers, and promotional discounts on UShop.
          </p>
        </div>

        {/* Navigation Quick Jump Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <a
            href="#payment-methods"
            className="p-3 sm:p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-ushop-pink/40 hover:shadow-md transition-all text-center group"
          >
            <CreditCard className="w-5 h-5 text-ushop-pink mx-auto mb-1.5 transition-transform" />
            <span className="text-xs font-bold text-gray-800 block">1. Payment Methods</span>
          </a>
          <a
            href="#change-payment"
            className="p-3 sm:p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-ushop-pink/40 hover:shadow-md transition-all text-center group"
          >
            <RefreshCw className="w-5 h-5 text-ushop-purple mx-auto mb-1.5 transition-transform" />
            <span className="text-xs font-bold text-gray-800 block">2. Managing Cards</span>
          </a>
          <a
            href="#vouchers"
            className="p-3 sm:p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-ushop-pink/40 hover:shadow-md transition-all text-center group"
          >
            <Gift className="w-5 h-5 text-emerald-600 mx-auto mb-1.5 transition-transform" />
            <span className="text-xs font-bold text-gray-800 block">3. Vouchers & Codes</span>
          </a>
          <a
            href="#promotions"
            className="p-3 sm:p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-ushop-pink/40 hover:shadow-md transition-all text-center group"
          >
            <Tag className="w-5 h-5 text-amber-500 mx-auto mb-1.5 transition-transform" />
            <span className="text-xs font-bold text-gray-800 block">4. Promotions</span>
          </a>
        </div>

        {/* Main Content Box */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 md:p-12 shadow-sm space-y-10 text-sm sm:text-base text-gray-600 leading-relaxed">
          {/* Section 1: Payment Methods */}
          <section id="payment-methods" className="space-y-6 scroll-mt-24">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-ushop-pink shrink-0" />
                <span>1. UShop Payment Methods</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                UShop accepts the following methods of payment across our marketplace:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2 font-bold text-xs text-gray-800">
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pay on Delivery</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2 font-bold text-xs text-gray-800">
                <CreditCard className="w-4 h-4 text-ushop-pink shrink-0" />
                <span>Debit & Credit Card</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2 font-bold text-xs text-gray-800">
                <Building2 className="w-4 h-4 text-ushop-purple shrink-0" />
                <span>Bank Transfer</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2 font-bold text-xs text-gray-800">
                <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Mobile Money</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* 1.1 Payment on delivery */}
              <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>1.1 Payment on Delivery</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  You may make payments for your purchases from the UShop marketplace once the goods are delivered to you by providing the exact amount of the purchase price to the delivery agent in cash or by paying the exact amount via mobile money to the UShop payment details that will be provided to you by the delivery agent.
                </p>
              </div>

              {/* 1.2 Debit & Credit Cards */}
              <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-ushop-pink" />
                  <span>1.2 Debit & Credit Cards</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  You may make payments for your purchases from the UShop marketplace by using your debit or credit card. You will be required to input your card details during the checkout process as a payment method.
                </p>
                <p className="text-xs text-gray-500 pt-1 font-medium">
                  Please refer to our <Link href="/terms" className="text-ushop-pink font-semibold hover:underline">Terms and Conditions</Link> and <Link href="/privacy" className="text-ushop-pink font-semibold hover:underline">Privacy Policy</Link> to learn how UShop securely processes your information.
                </p>
              </div>

              {/* 1.3 Bank Transfer */}
              <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-ushop-purple" />
                  <span>1.3 Bank Transfer</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  You may make payments for your purchases from the UShop marketplace by bank transfer. You will be required to input your bank information during the checkout process.
                </p>
              </div>

              {/* 1.4 Mobile Money */}
              <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-500" />
                  <span>1.4 Mobile Money Transfer</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  You may make payments for your purchases from the UShop marketplace via mobile money transfer (MTN MoMo, Telecel Cash, or AT Money). You will be required to input your mobile money account details at the checkout process.
                </p>
                <p className="text-xs text-gray-500 pt-1 font-medium">
                  Please refer to the <Link href="/terms" className="text-ushop-pink font-semibold hover:underline">Terms and Conditions</Link> and <Link href="/privacy" className="text-ushop-pink font-semibold hover:underline">Privacy Policy</Link> to learn how UShop processes your information and the terms of use for the marketplace.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Adding or Changing Payment Methods */}
          <section id="change-payment" className="space-y-4 pt-6 border-t border-gray-100 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-6 h-6 text-ushop-purple shrink-0" />
              <span>2. Adding or Changing Payment Methods</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              You can add a new payment method or change your existing payment method at any time by logging in to your <Link href="/user/settings" className="text-ushop-purple font-bold hover:underline">UShop account settings</Link> and updating your payment preferences.
            </p>
          </section>

          {/* Section 3: Vouchers */}
          <section id="vouchers" className="space-y-6 pt-6 border-t border-gray-100 scroll-mt-24">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Gift className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>3. Vouchers</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                UShop offers two types of vouchers: <strong>Promotional Voucher Codes</strong> and <strong>Refund Vouchers</strong>.
              </p>
            </div>

            {/* 3.1 Promotional Voucher Codes */}
            <div className="p-6 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 text-emerald-950 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>3.1 Promotional Voucher Codes</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-gray-700">
                <div>
                  <p className="font-bold text-gray-900">What are promotional voucher codes?</p>
                  <p>Promotional voucher codes are codes issued by UShop that offer a specific discount or credit on the UShop marketplace. Vouchers may be subject to additional terms and conditions.</p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">How can one obtain a promotional voucher code?</p>
                  <p>UShop may award you with a promotional voucher code for participating in a campaign run or it may be offered to you as an incentive or compensation.</p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">Where can I find/access the promotional voucher code?</p>
                  <p>Promotional codes are provided periodically by UShop through official campaign announcements, newsletters, or customer support.</p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">How can I use the promotional voucher code?</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>You may use the promotional voucher code only to make purchases on the UShop marketplace.</li>
                    <li>The promotional voucher code may only be used and redeemed once. Any promotional code for duplicate benefits will be voided.</li>
                    <li>Only promotional voucher codes communicated by UShop are valid.</li>
                    <li>A UShop promotional voucher code is applied to your final cart purchases at checkout and is deducted from the total amount of your purchase(s).</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-gray-900">Can the promotional voucher be transferred, withdrawn or converted to cash?</p>
                  <p>You cannot transfer or withdraw your promotional voucher code or convert it into cash.</p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">What is the expiry period of promotional voucher codes?</p>
                  <p>The expiration date of any promotional voucher code will be communicated to you alongside the code.</p>
                </div>
              </div>
            </div>

            {/* 3.2 Refund Voucher Codes */}
            <div className="p-6 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 text-purple-950 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-ushop-purple" />
                <span>3.2 Refund Voucher Codes</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-gray-700">
                <div>
                  <p className="font-bold text-gray-900">What are refund voucher codes?</p>
                  <p>Refund voucher codes are issued by UShop as a refund for eligible returned purchases made on the UShop marketplace. Refund vouchers are redeemable on UShop as a method of payment for future orders.</p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">Where can I find the refund voucher?</p>
                  <p>Refund voucher codes are provided by UShop when a return and refund is processed. Please see our <Link href="/help#returns" className="text-ushop-purple font-semibold hover:underline">Returns and Refund Policy</Link> for more information.</p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">How can I use the refund voucher?</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>You may use refund vouchers only to make purchases on UShop.</li>
                    <li>Only refund voucher codes communicated by UShop are valid.</li>
                    <li>The UShop refund voucher is applied to your final cart purchases, available at check-out and is deducted from the total amount of your purchase(s).</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-gray-900">Can the refund voucher be transferred or withdrawn?</p>
                  <p>You cannot transfer your refund voucher. You may request a cash refund, which will typically be done by bank transfer or Mobile Money in place of a refund voucher by contacting our Customer Service Department.</p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">What is the expiry period of the refund voucher?</p>
                  <p>Refund vouchers expire after <strong>180 days</strong> and must be used within this period.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Other Promotions and Discounts */}
          <section id="promotions" className="space-y-3 pt-6 border-t border-gray-100 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Tag className="w-6 h-6 text-amber-500 shrink-0" />
              <span>4. Other Promotions and Discounts</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              UShop may offer various other promotions, flash sales, student discounts, and campaign pricing that may be applied towards purchases on the UShop marketplace, subject to specific terms and conditions.
            </p>
          </section>

          {/* Section 5: Further Information */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-ushop-pink">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Further Information & Support</h3>
                  <p className="text-xs text-white/80 font-medium">Have questions about payment methods or vouchers?</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                If you have any questions regarding these payment guidelines or need assistance processing a payment, please reach out to our Customer Service team.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-ushop-pink hover:bg-ushop-pink/90 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Support</span>
                </Link>

                <a
                  href={`tel:${contactConfig.company.phoneClean}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors border border-white/20"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>Call {contactConfig.company.phone}</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
