import React from "react";
import Container from "@/components/Container";
import Link from "next/link";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { contactConfig } from "@/config/contact";
import {
  Lock,
  ShieldCheck,
  FileText,
  Eye,
  Database,
  UserCheck,
  Download,
  AlertTriangle,
  Server,
  Globe,
  Clock,
  Key,
  ShieldAlert,
  Info,
  Building,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "Master Privacy Policy & Data Protection Notice | U-Shop Ghana",
  description:
    "Official Master Privacy Policy and Data Protection Notice for U-Shop Technology Marketplace Ltd (ushopgh.com). Compliant with Ghana Data Protection Act 2012 (Act 843).",
};

const PrivacyPage = () => {
  return (
    <div className="bg-[#fbfbfd] min-h-screen py-8 sm:py-12 md:py-16">
      <Container className="max-w-4xl px-4">
        {/* Breadcrumb */}
        <DynamicBreadcrumb
          customItems={[
            { label: "Legal & Policies", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" },
          ]}
        />

        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto my-8 sm:my-12">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Master Privacy Policy
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 mt-3 leading-relaxed font-medium">
            U-Shop (<span className="font-bold text-gray-800">ushopgh.com</span>) Data Protection & Privacy Notice
          </p>

          {/* Download PDF Card */}
          <div className="mt-6 inline-flex items-center gap-3 p-3.5 px-5 bg-white border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <Download className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-left text-xs">
              <span className="font-bold text-gray-900 block">Download Official Copy</span>
              <a
                href="/ushop_privacy_policy_v1.pdf"
                download
                className="text-emerald-600 font-bold hover:underline"
              >
                Download U-Shop Privacy Policy (PDF)
              </a>
            </div>
          </div>
        </div>

        {/* Document Control Governance Table */}
        <div className="mb-10 bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600" />
            Document Control & Governance Metadata
          </h3>
          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                <tr>
                  <th className="p-3">Metadata Field</th>
                  <th className="p-3">Document Information</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Document Title</td>
                  <td className="p-3">U-Shop Master Privacy Policy & Data Protection Notice</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Document ID</td>
                  <td className="p-3"><code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono">POL-PRIV-2024-V1.1</code></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Operating Entity</td>
                  <td className="p-3">U-Shop Technology Marketplace Ltd. (ushopgh.com)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Effective Date</td>
                  <td className="p-3">September 1, 2026</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Last Revision Date</td>
                  <td className="p-3">September 1, 2026</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Applicable Platforms</td>
                  <td className="p-3">ushopgh.com (Web Portal), U-Shop iOS/Android Applications, Web APIs</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Data Protection Officer</td>
                  <td className="p-3"><a href="mailto:privacy@ushopgh.com" className="text-emerald-600 font-bold hover:underline">privacy@ushopgh.com</a> / <a href="mailto:legal@ushopgh.com" className="text-ushop-purple font-bold hover:underline">legal@ushopgh.com</a></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Regulatory Framework</td>
                  <td className="p-3">Data Protection Act, 2012 (Act 843 of Ghana) & International Best Practices</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Main Document Content */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 md:p-12 shadow-sm space-y-10 text-sm sm:text-base text-gray-600 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Eye className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>1. About This Notice & Purpose Statement</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm">
              <p>
                Welcome to <strong>U-Shop</strong> (accessible via <span className="font-semibold text-gray-900">ushopgh.com</span> and associated mobile software applications). U-Shop is Ghana’s premier niche, peer-to-peer (C2C) e-commerce marketplace built specifically for buying, selling, and trading technology equipment - including personal computers, laptops, smartphones, tablet devices, audio/video gear, gaming hardware, PC components, and enterprise networking equipment.
              </p>
              <p>
                The purpose of this Privacy Policy is to provide a transparent, comprehensive, and legally binding explanation of how <strong>U-Shop Technologies Ltd.</strong> (&quot;U-Shop&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, stores, processes, shares, and protects your personal data when you visit our website, register an account, list hardware, or conduct peer-to-peer transactions.
              </p>
              <p>
                Because technology equipment involves high monetary value, sensitive user accounts, and unique item identifiers (such as serial numbers and IMEI numbers), protecting your privacy and preventing fraud is integral to our operations. This policy details your statutory privacy rights, how you can exercise them, and the measures we employ to keep your data secure.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Globe className="w-6 h-6 text-ushop-purple shrink-0" />
              <span>2. Scope of Policy</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm">
              <p>This Policy applies to all users and visitors of <span className="font-semibold text-gray-900">ushopgh.com</span> and related applications, including:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Buyers:</strong> Individual consumers browsing, reserving, inquiring about, or purchasing technology equipment from peers on the platform.</li>
                <li><strong>Sellers:</strong> Individual users, refurbishers, hardware enthusiasts, or micro-merchants listing new, used, or pre-owned technology hardware for sale.</li>
                <li><strong>Visitors & Guests:</strong> Any person accessing public web pages, blogs, or tech pricing guides on ushopgh.com without registering an account.</li>
                <li><strong>Third-Party Logistics & Service Partners:</strong> Courier personnel, escrow agents, and payment service providers interfacing with transaction metadata.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileText className="w-6 h-6 text-ushop-pink shrink-0" />
              <span>3. Definitions & Key Concepts</span>
            </h2>
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                  <tr>
                    <th className="p-3">Term</th>
                    <th className="p-3">Legal / Operational Definition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr>
                    <td className="p-3 font-bold text-gray-900">Personal Data</td>
                    <td className="p-3">Any information relating to an identified or identifiable natural person directly or indirectly (e.g., name, phone number, email address, IP address, device serial number).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-900">C2C Marketplace</td>
                    <td className="p-3">A peer-to-peer commerce ecosystem facilitating direct transactions between consumer sellers and consumer buyers without intermediary retail stocking.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-900">Data Controller</td>
                    <td className="p-3">The legal entity that determines the purpose and means of personal data processing. For this platform, the Data Controller is <strong>U-Shop Technology Marketplace Ltd.</strong></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-900">Tech Equipment Listing</td>
                    <td className="p-3">User-generated content published by Sellers, containing hardware specs, photos, cosmetic condition, serial numbers, asking prices, and pick-up/delivery parameters.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-900">Biometric & Identity Verification Data</td>
                    <td className="p-3">Facial geometry check data, government photo ID credentials (e.g., Ghana Card, Passport), and selfie verifications mandatory for tech sellers to prevent fraudulent activity and trade in stolen electronics.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-900">Escrow & Payment Data</td>
                    <td className="p-3">Financial credentials, Mobile Money (MoMo) transaction reference codes, and banking details utilised to hold buyer payments safely until technology items are delivered and verified.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Database className="w-6 h-6 text-teal-600 shrink-0" />
              <span>4. The Data We Collect About You</span>
            </h2>

            <p className="text-xs text-gray-500">We collect personal data to deliver a safe, personalised C2C marketplace experience, facilitate hardware listings, enable escrow payments, verify high-value tech gear, and protect users from fraud.</p>

            {/* Data Streams Diagram */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs">
              <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-700 block">Directly Provided Data</span>
                <p className="text-gray-500">KYC, Identity, Product Listings, Messages, Support Chats</p>
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1">
                <span className="font-bold text-ushop-purple block">Automatically Collected</span>
                <p className="text-gray-500">Logs, IP Address, Device Identifiers, Cookies, Geolocation</p>
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1">
                <span className="font-bold text-ushop-pink block">Third-Party Sources</span>
                <p className="text-gray-500">Mobile Money Partners, Logistics, Anti-Theft IMEI Registries</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">A. Information You Provide Directly</h3>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li><strong>Identity & KYC Data:</strong> Full legal name, date of birth, username, profile photograph, national identification number (e.g., Ghana Card / Passport details), and biometric selfie verification (specifically required for sellers listing high-value technology items).</li>
                <li><strong>Contact Data:</strong> Primary physical/delivery address, postal address, mobile telephone number, and email address.</li>
                <li><strong>Financial & Payout Data:</strong> Mobile Money wallet numbers (MTN MoMo, Telecel Cash, AT Money), bank account details, payment card billing addresses, and escrow payout history.</li>
                <li><strong>Technology Listing Data:</strong> Device specifications, condition notes, hardware test reports, battery health metrics, purchase receipts/proof of ownership, serial numbers, and IMEI numbers provided by Sellers.</li>
                <li><strong>Communication Data:</strong> In-App Chat Logs, Customer support tickets, dispute submissions, and product reviews.</li>
              </ol>

              <h3 className="font-bold text-gray-900 text-sm pt-2">B. Information Automatically Collected / Technical Data</h3>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li><strong>Device & Network Data:</strong> IP address, operating system version, browser type, hardware identifier (MAC address/device ID), screen resolution, and mobile carrier.</li>
                <li><strong>Platform Activity Data:</strong> Search queries (e.g., &quot;Apple M2 Pro&quot;, &quot;NVIDIA RTX 4080&quot;), listings viewed, saved wishlists, time spent per listing, referring URLs, and shopping cart interactions.</li>
                <li><strong>Location Data:</strong> Approximate or precise geolocation (with user consent) to facilitate local peer-to-peer drop-offs, pickups, and geo-targeted hardware listings within specific zones in Ghana.</li>
              </ol>

              <h3 className="font-bold text-gray-900 text-sm pt-2">C. Information Received from Third Parties</h3>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li><strong>Payment & Escrow Partners:</strong> Confirmation tokens, risk evaluation scores, and transaction status from Mobile Money operators and PCI-DSS compliant payment gateways.</li>
                <li><strong>Logistics & Delivery Partners:</strong> Shipment status updates, delivery signatures, drop-off location timestamps, and recipient verification.</li>
                <li><strong>Anti-Theft & Law Enforcement Registries:</strong> Equipment verification checks against stolen device databases to prevent illegal hardware trafficking on ushopgh.com.</li>
              </ol>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Key className="w-6 h-6 text-amber-500 shrink-0" />
              <span>5. Cookies and Tracking Identifiers</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <p>
                U-Shop uses cookies, web beacons, and local storage mechanisms to distinguish you from other users, preserve your active sessions, optimise website performance, and customise hardware recommendations.
              </p>
              <h3 className="font-bold text-gray-900 text-sm">Types of Cookies Used:</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Strictly Necessary Cookies:</strong> Essential for system authentication, security enforcement, escrow checkout routines, and active cart preservation.</li>
                <li><strong>Performance & Analytics Cookies:</strong> Collect anonymised data on how users navigate ushopgh.com, helping us identify platform bottlenecks and optimise search performance.</li>
                <li><strong>Functional Cookies:</strong> Store user preferences, such as preferred currency, recent hardware category filters, and notification settings.</li>
                <li><strong>Targeting & Marketing Cookies:</strong> Facilitate personalised ads and offers for tech products on external networks (including Google Digital Marketing and partner networks).</li>
              </ul>
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-xs text-amber-950">
                <strong>Managing Cookies:</strong> You can disable or modify cookie settings directly within your web browser. However, disabling essential cookies will disable session logins, escrow checkout, and secure seller dashboard features.
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Server className="w-6 h-6 text-indigo-600 shrink-0" />
              <span>6. How We Use Your Personal Data</span>
            </h2>

            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                  <tr>
                    <th className="p-3">Operational Purpose</th>
                    <th className="p-3">Primary Data Categories Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr>
                    <td className="p-3 font-semibold text-gray-900">Account Creation & Authentication</td>
                    <td className="p-3">Identity Data, Contact Data, Mobile Verification</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-900">C2C Order Matching & Escrow Handling</td>
                    <td className="p-3">Identity, Contact, Financial, Tech Listing Data</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-900">Seller Verification & Anti-Stolen Gear Screening</td>
                    <td className="p-3">Identity Data, Biometric KYC, Serial/IMEI Numbers</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-900">Peer-to-Peer Shipping & Fulfilment</td>
                    <td className="p-3">Contact Data (Address, Phone), Delivery Coordinates</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-900">Dispute Mediation & Buyer Safeguards</td>
                    <td className="p-3">In-App Chat Logs, Listing Specs, Hardware Receipts</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-900">System Security & Anti-Fraud Protection</td>
                    <td className="p-3">Device Identifiers, IP Logs, Transaction Metadata</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-900">Targeted Hardware Marketing & Recommender Engine</td>
                    <td className="p-3">Usage Logs, Search Preferences, Cookies</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-900">Tax & Regulatory Compliance</td>
                    <td className="p-3">Transaction Records, Seller Identification Data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>7. Legal Basis for Processing Personal Data</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <p>Under the Ghana Data Protection Act, 2012 (Act 843) and international privacy guidelines, U-Shop processes your data under four recognised legal bases:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Performance of a Contract:</strong> Processing is required to execute our Terms of Service, manage user registration, process escrow transactions, and coordinate peer hardware deliveries.</li>
                <li><strong>Legitimate Interests:</strong> Processing is necessary to protect our marketplace integrity - preventing the sale of stolen hardware, detecting fraud, maintaining system uptime, and facilitating dispute resolution - provided your privacy rights are respected.</li>
                <li><strong>Compliance with Legal Obligations:</strong> Processing required to fulfil statutory reporting obligations, anti-money laundering (AML) laws, tax compliance, or law enforcement mandates.</li>
                <li><strong>Consent:</strong> Where you have explicitly opted in (e.g., location tracking, direct promotional newsletters, or targeted third-party advertising). You may withdraw consent at any time.</li>
              </ol>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <UserCheck className="w-6 h-6 text-ushop-pink shrink-0" />
              <span>8. Sharing and Disclosure of Personal Data</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <p>
                U-Shop respects your privacy and strictly limits third-party data sharing. We do <strong>not</strong> sell, rent, or trade your personal information to third parties for independent marketing purposes.
              </p>

              <h3 className="font-bold text-gray-900 text-sm">Approved Sharing Scenarios:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Peer-to-Peer Transaction Sharing:</strong> To fulfil C2C purchases, essential delivery details (buyer&apos;s name, delivery address, phone number, and pickup PIN) are shared with the selling peer or assigned courier. Sellers are strictly bound to use this data solely for order delivery.</li>
                <li>
                  <strong>Third-Party Service Providers:</strong> We engage trusted vendors under strict confidentiality contracts to perform key infrastructure tasks:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Payment gateways and Mobile Money processors (Paystack, MTN MoMo, Telecel Cash).</li>
                    <li>Verified logistics and courier delivery partners.</li>
                    <li>Identity verification and biometric KYC software providers.</li>
                    <li>Secure cloud hosting infrastructure (AWS / Cloudflare).</li>
                  </ul>
                </li>
                <li><strong>Anti-Theft & Fraud Prevention Disclosures:</strong> If a device listed on ushopgh.com is flagged as stolen or fraudulent, we reserve the right to share relevant serial numbers, IMEI data, identity records, and transaction history with law enforcement agencies and anti-theft database registries.</li>
                <li><strong>Corporate Restructuring:</strong> In the event of a merger, acquisition, or sale of U-Shop assets, user data may be transferred under strict non-disclosure terms.</li>
              </ol>
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Globe className="w-6 h-6 text-indigo-600 shrink-0" />
              <span>9. International Data Transfers</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <p>
                As an e-commerce platform operating in Ghana with cloud infrastructure hosted globally, your personal data may be stored or processed on secure servers located outside your country of residence (e.g., EU or US data centres).
              </p>
              <p>When executing cross-border data transfers, U-Shop ensures appropriate safeguards are in place, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Transferring data to jurisdictions recognised as providing adequate data protection standards.</li>
                <li>Implementing Standard Contractual Clauses (SCCs) and data processing agreements with cloud hosting providers.</li>
                <li>Utilising end-to-end encryption for all cross-border data in transit and at rest.</li>
              </ul>
            </div>
          </section>

          {/* Section 10 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Clock className="w-6 h-6 text-amber-500 shrink-0" />
              <span>10. Data Retention Policy</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <p>
                U-Shop adheres to the principle of data minimisation. We retain your personal data only for as long as necessary to fulfil the operational, legal, tax, or fraud-prevention purposes for which it was collected.
              </p>

              {/* Retention Timeline Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs">
                <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1">
                  <strong className="text-gray-900 block">Active User Accounts</strong>
                  <span className="text-emerald-600 font-bold">Account Life</span>
                  <p className="text-gray-500">Retained while account remains active</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1">
                  <strong className="text-gray-900 block">Financial & Escrow Logs</strong>
                  <span className="text-ushop-pink font-bold">6 Years</span>
                  <p className="text-gray-500">Retained for tax and financial auditing</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1">
                  <strong className="text-gray-900 block">Identity / KYC Records</strong>
                  <span className="text-ushop-purple font-bold">3 Years Post-Closure</span>
                  <p className="text-gray-500">Stored to prevent re-registration by banned bad actors</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 font-medium">Customer Support & Inquiry Logs are retained for <strong>twenty-four (24) months</strong> for quality assurance and dispute reference.</p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Lock className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>11. Data Security Protocols</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <p>U-Shop maintains multi-layered technical and organisational security standards to guard your data against unauthorised access, loss, misuse, or alteration:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Encryption Standards:</strong> Transport Layer Security (TLS 1.3) encryption for all data in transit across ushopgh.com, and Advanced Encryption Standard (AES-256) for data stored at rest.</li>
                <li><strong>Financial Security:</strong> Payment operations adhere strictly to Payment Card Industry Data Security Standards (PCI-DSS Level 1). No raw credit card credentials or banking PINs are ever stored on U-Shop servers.</li>
                <li><strong>Access Control & Auditing:</strong> Strict Role-Based Access Control (RBAC) and Multi-Factor Authentication (MFA) restrict internal employee access to personal data.</li>
                <li><strong>Breach Notification Procedure:</strong> In the event of a confirmed personal data security breach, U-Shop will notify affected users and the Data Protection Commission (DPC) within <strong>72 hours</strong> of confirmation, detailing the nature of the breach and corrective steps taken.</li>
              </ul>
            </div>
          </section>

          {/* Section 12 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <UserCheck className="w-6 h-6 text-ushop-purple shrink-0" />
              <span>12. Your Legal Rights & Execution Procedures</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <p>Under applicable data protection laws, you possess clear statutory rights regarding your personal data:</p>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li><strong>Right to Access:</strong> Request a copy of the personal data U-Shop maintains about you.</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate, incomplete, or outdated personal information.</li>
                <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request permanent deletion of your account and personal data, subject to statutory tax and anti-fraud retention obligations.</li>
                <li><strong>Right to Restrict or Object:</strong> Object to data processing based on legitimate interests or restrict direct marketing communications.</li>
                <li><strong>Right to Data Portability:</strong> Request transfer of your data to another service provider in a structured, machine-readable format.</li>
                <li><strong>Right to Opt-Out:</strong> Unsubscribe from promotional channels via the &quot;Unsubscribe&quot; link in any marketing communication.</li>
              </ol>

              {/* Account Closure Callout */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2 mt-3">
                <h4 className="font-bold text-gray-900 text-sm">Account Closure & Erasure Procedure</h4>
                <p>To permanently close your U-Shop account and request data erasure:</p>
                <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                  <li>Log in to your account at <span className="font-semibold">ushopgh.com</span>.</li>
                  <li>Navigate to <strong>Account Settings &gt; Privacy &amp; Security &gt; Account Closure</strong>.</li>
                  <li>Select <strong>&quot;Close Account &amp; Erase My Data&quot;</strong> and confirm your credentials.</li>
                  <li>Alternatively, submit a formal written request to our Data Protection Officer at <a href="mailto:privacy@ushopgh.com" className="text-emerald-600 font-bold hover:underline">privacy@ushopgh.com</a>.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Section 13 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
              <span>13. User Obligations & Compliance Requirements</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <p>To maintain a secure ecosystem on <span className="font-semibold text-gray-900">ushopgh.com</span>, users and sellers must adhere to the following rules:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Accuracy of Information:</strong> Users are required to maintain accurate, truthful, and updated identity and financial details.</li>
                <li><strong>Strict Prohibition of Off-Platform Data Misuse:</strong> Sellers who receive Buyers&apos; shipping names and phone numbers strictly for order fulfilment are <strong>prohibited</strong> from using this data for unsolicited personal contacts, external marketing, or sharing with outside third parties.</li>
                <li><strong>Consequences of Non-Compliance:</strong> Any violation of privacy terms, unauthorised data extraction (scraping), misuse of peer contact information, or submission of fraudulent KYC credentials will result in immediate account suspension, forfeiture of active escrow payouts (where linked to fraud), and legal prosecution where applicable.</li>
              </ul>
            </div>
          </section>

          {/* Section 14 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
              <span>14. Disclaimers & Peer-to-Peer Safeguards</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Peer Interaction Guidance:</strong> While U-Shop conducts identity checks and holds funds in escrow, users should maintain vigilance during peer communications. Never share financial passwords, bank PINs, or sensitive personal credentials in open chat channels.</li>
                <li><strong>Off-Platform Transactions Disclaimer:</strong> U-Shop’s Privacy Policy and buyer/seller protection guarantees apply <strong>exclusively</strong> to transactions completed within ushopgh.com. Transactions executed outside the platform fall outside our security controls.</li>
                <li><strong>External Links:</strong> ushopgh.com may contain links to third-party brand websites, hardware manufacturers, or external software tools. U-Shop assumes no responsibility for the privacy policies or content of external platforms.</li>
              </ul>
            </div>
          </section>

          {/* Section 15 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building className="w-6 h-6 text-indigo-600 shrink-0" />
              <span>15. Data Controllers & Contact Information</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <p>If you have any questions, concerns, complaints, or wish to exercise your legal privacy rights, don&apos;t hesitate to get in touch with our Data Privacy Office:</p>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1.5">
                <p><strong>Data Controller Entity:</strong> U-Shop Technologies Ltd.</p>
                <p><strong>Website:</strong> <span className="font-semibold text-gray-900">https://ushopgh.com</span></p>
                <p><strong>Data Protection Officer (DPO):</strong> Head of Legal &amp; Privacy Governance</p>
                <p><strong>Privacy Contact Email:</strong> <a href="mailto:privacy@ushopgh.com" className="text-emerald-600 font-bold hover:underline">privacy@ushopgh.com</a></p>
                <p><strong>Legal Inquiries Email:</strong> <a href="mailto:legal@ushopgh.com" className="text-ushop-purple font-bold hover:underline">legal@ushopgh.com</a></p>
                <p><strong>Physical Address:</strong> U-Shop Tech Hub, Ring Road Central, Accra, Ghana</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-1">
                <strong className="text-ushop-pink block">Regulatory Escalation Notice</strong>
                <p className="text-slate-300">
                  If you believe your data privacy rights have been infringed and U-Shop has not adequately resolved your concern, you have the right to lodge a complaint with the <strong>Data Protection Commission (DPC) Ghana</strong> via their portal at <a href="https://www.dataprotection.org.gh" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline">www.dataprotection.org.gh</a>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 16 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Info className="w-6 h-6 text-ushop-pink shrink-0" />
              <span>16. Effective Date & Revision History</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <p>
                U-Shop reserves the right to amend this Privacy Policy at any time to reflect updates in technology, legal requirements, or marketplace features. Material updates will be communicated via site notifications or registered email prior to becoming effective.
              </p>

              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <tr>
                      <th className="p-3">Version</th>
                      <th className="p-3">Effective Date</th>
                      <th className="p-3">Key Amendments / Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 font-bold text-emerald-600">v1.0</td>
                      <td className="p-3">September 1, 2026</td>
                      <td className="p-3">Official release of U-Shop C2C Tech Marketplace Privacy Policy.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPage;
