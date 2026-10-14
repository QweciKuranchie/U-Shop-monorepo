import React from "react";
import Container from "@/components/Container";
import Link from "next/link";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { contactConfig } from "@/config/contact";
import {
  FileText,
  ShieldCheck,
  Scale,
  Users,
  CheckCircle,
  HelpCircle,
  Download,
  AlertTriangle,
  Lock,
  DollarSign,
  RefreshCw,
  Ban,
  Building,
  Info,
  ShieldAlert,
  Calendar,
  UserCheck,
} from "lucide-react";

export const metadata = {
  title: "Terms of Service & General Operating Conditions | U-Shop Ghana",
  description:
    "Official Terms of Service and General Operating Conditions of Use of the Marketplace for Buyers & Sellers at ushopgh.com.",
};

const TermsPage = () => {
  return (
    <div className="bg-[#fbfbfd] min-h-screen py-8 sm:py-12 md:py-16">
      <Container className="max-w-4xl px-4">
        {/* Breadcrumb */}
        <DynamicBreadcrumb
          customItems={[
            { label: "Legal & Policies", href: "/terms" },
            { label: "Terms of Service", href: "/terms" },
          ]}
        />

        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto my-8 sm:my-12">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Terms of Service & Operating Conditions
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 mt-3 leading-relaxed font-medium">
            General Terms and Conditions of Use of the Marketplace for Buyers & Sellers at{" "}
            <span className="font-bold text-gray-800">ushopgh.com</span>
          </p>

          {/* Download PDF Card */}
          <div className="mt-6 inline-flex items-center gap-3 p-3.5 px-5 bg-white border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <Download className="w-5 h-5 text-ushop-pink shrink-0" />
            <div className="text-left text-xs">
              <span className="font-bold text-gray-900 block">PDF Download Available</span>
              <a
                href="/ushop_terms_of_service_v1.pdf"
                download
                className="text-ushop-pink font-bold hover:underline"
              >
                Download U-Shop Terms of Service (PDF)
              </a>
            </div>
          </div>
        </div>

        {/* Metadata Control Box */}
        <div className="mb-10 bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-ushop-purple" />
            Document Control Metadata
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-500 font-medium block">Policy Title</span>
              <span className="font-bold text-gray-900">Terms of Service & Operating Conditions</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-500 font-medium block">Domain Name</span>
              <span className="font-bold text-gray-900">ushopgh.com</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-500 font-medium block">Business Model</span>
              <span className="font-bold text-gray-900">C2C Tech Marketplace</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-500 font-medium block">Effective Date</span>
              <span className="font-bold text-gray-900">September 1, 2026</span>
            </div>
          </div>
        </div>

        {/* Main Terms Document Body */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 md:p-12 shadow-sm space-y-10 text-sm sm:text-base text-gray-600 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileText className="w-6 h-6 text-ushop-pink shrink-0" />
              <span>1. Policy Title, Purpose Statement & Scope</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">1.1 Title & Overview</h3>
              <p>
                This policy document constitutes the official <strong>Terms of Service and General Terms and Conditions of Use</strong> (the &quot;General Terms&quot;) governing access to and use of the <strong>U-Shop</strong> e-commerce platform hosted at <span className="font-semibold text-gray-900">ushopgh.com</span> and its associated mobile applications (collectively, the &quot;Marketplace&quot;).
              </p>
              <p>
                <strong>U-Shop</strong> operates a specialised, niche peer-to-peer (C2C) marketplace designed specifically for trading technology equipment, hardware components, computing devices, mobile technology, consumer electronics, and related tech accessories.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-2">1.2 Purpose Statement</h3>
              <p>
                The purpose of these General Terms is to establish a legal and operational framework that ensures safe, transparent, and fair peer-to-peer technology transactions. This document governs the contractual relationships between U-Shop, buyers, and sellers, safeguarding platform integrity, establishing technical disclosure standards, defining payment escrow and return rules, and protecting user privacy and intellectual property.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-2">1.3 Scope & Applicability</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Universal Applicability:</strong> These General Terms apply to all visitors, registered accounts, buyers, individual sellers, and commercial vendors accessing or utilising <span className="font-semibold text-gray-900">ushopgh.com</span> or associated mobile applications.
                </li>
                <li>
                  <strong>Business Authority Guarantee:</strong> If you access or use the Marketplace on behalf of a business enterprise, sole proprietorship, academic institute, or legal entity:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>You confirm that you possess all necessary corporate or legal authority to bind that entity to these General Terms;</li>
                    <li>You bind both yourself individually and the legal entity you represent to these General Terms; and</li>
                    <li>The terms &quot;you&quot; and &quot;your&quot; in these General Terms shall refer jointly to the individual user and the associated legal entity.</li>
                  </ul>
                </li>
                <li>
                  <strong>Acceptance of Terms:</strong> By browsing, creating an account, or conducting any transaction on <span className="font-semibold text-gray-900">ushopgh.com</span>, you accept these General Terms in full. <strong>If you disagree with these General Terms or any part hereof, you must immediately cease all access to and use of the Marketplace.</strong>
                </li>
              </ol>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Users className="w-6 h-6 text-ushop-purple shrink-0" />
              <span>2. Key Definitions & Operational Concepts</span>
            </h2>

            <p className="text-xs text-gray-500">To ensure clarity across all C2C technology transactions, the following terms are defined:</p>

            <div className="grid grid-cols-1 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-900">&quot;U-Shop&quot; / &quot;Platform&quot; / &quot;We&quot;:</span> Refers to U-Shop (operating under ushopgh.com), including its parent entities, subsidiaries, logistics interfaces, payment infrastructure, customer service teams, and automated IT systems.
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-900">&quot;Peer-to-Peer (C2C) Marketplace&quot;:</span> The online platform operated by U-Shop that facilitates direct commercial transactions between individual consumer sellers (&quot;Sellers&quot;) and consumer purchasers (&quot;Buyers&quot;) for technology items.
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-900">&quot;Technology Equipment&quot; / &quot;Products&quot;:</span> Consumer and commercial hardware devices, including desktop computers, laptops, PC components (GPUs, CPUs, motherboards, RAM, storage drives), smartphones, tablets, networking hardware, gaming equipment, audio-visual gear, smart devices, software licenses, and specialised accessories.
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-900">&quot;Marketplace Contract&quot;:</span> The binding agreement for the sale and purchase of technology equipment created directly between a Buyer and a Seller upon purchase confirmation on the Marketplace.
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-900">&quot;Escrow Hold&quot;:</span> The payment retention process managed by U-Shop wherein Buyer funds are securely held until the physical receipt, technical inspection, and acceptance of the technology equipment by the Buyer.
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-900">&quot;Store Credit&quot;:</span> Non-cash electronic credit issued to a user’s U-Shop account via promotional rewards, cashbacks, or return refunds, usable exclusively for subsequent Marketplace transactions.
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-gray-900">&quot;User Content&quot;:</span> All technical specifications, item listings, hardware benchmark reports, high-resolution photographs, video demonstrations, product reviews, feedback, and user-to-user messages uploaded to the Marketplace.
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <UserCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>3. Account Registration, Eligibility & Security</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">3.1 Eligibility & Minimum Age</h3>
              <p>
                You may not register for an account or utilise the Marketplace if you are under 18 years of age. By registering an account or agreeing to these General Terms, you warrant and represent that you are at least 18 years old and legally capable of entering into binding contracts under applicable law.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-2">3.2 Account Registration Requirements</h3>
              <p>
                When establishing an account on <span className="font-semibold text-gray-900">ushopgh.com</span>, you agree to provide complete, accurate, and up-to-date registration information (including a valid primary email address, phone number, and account password). You agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Maintain the strict confidentiality of your account password and login credentials;</li>
                <li>Notify U-Shop in writing immediately (via <a href="mailto:ghanaushop@gmail.com" className="text-ushop-pink font-bold hover:underline">ghanaushop@gmail.com</a>) if you become aware of any unauthorised disclosure or compromise of your credentials;</li>
                <li>Accept full legal and financial responsibility for all activities, orders, listings, and communications conducted through your account arising from any failure to maintain password security.</li>
              </ul>

              <h3 className="font-bold text-gray-900 text-sm pt-2">3.3 Non-Transferability of Accounts</h3>
              <p>
                Your U-Shop account is personal to you and shall not be transferred, assigned, rented, or sold to any third party. If you authorise a third party to manage or operate your account, you do so entirely at your own risk and remain strictly liable for their actions.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-2">3.4 Account Suspension, Restriction & Cancellation</h3>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>U-Shop reserves the right to suspend, limit, or cancel user accounts, or edit account profile details, where it reasonably believes a user has violated these General Terms, engaged in fraudulent conduct, or posed a risk to the Marketplace or other users.</li>
                <li>Except in cases of suspected fraud, illegal activity, or imminent harm where U-Shop may act immediately, U-Shop will provide the user with notice of the reason for suspension and a reasonable opportunity (no fewer than 5 business days) to respond or remedy the issue before permanent cancellation.</li>
                <li>Where U-Shop cancels an account while an unfulfilled, paid transaction is active and the user has not breached these General Terms, U-Shop will issue a full refund pursuant to Section 5.</li>
                <li>A user who believes their account was suspended or cancelled in error may appeal by contacting <a href="mailto:support@ushopgh.com" className="text-ushop-purple font-bold hover:underline">support@ushopgh.com</a>, and U-Shop will respond to the appeal within 10 business days.</li>
              </ol>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <CheckCircle className="w-6 h-6 text-teal-600 shrink-0" />
              <span>4. Terms and Conditions of Sale for C2C Technology Equipment</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">4.1 Marketplace Facilitation Model</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Facilitator Role:</strong> U-Shop provides an electronic marketplace connecting Sellers of technology equipment with potential Buyers.</li>
                <li><strong>Contracting Parties:</strong> Unless U-Shop is explicitly identified on a product listing page as the direct Seller, U-Shop is <strong>not a party to the contract of sale</strong> executed between the Buyer and the Seller. U-Shop acts solely as an intermediary to facilitate listing visibility, escrow payment collection, and dispute resolution.</li>
                <li><strong>Formation of Contract:</strong> A legally binding contract for the sale and purchase of technology equipment is created between the Buyer and Seller upon the Buyer’s final purchase confirmation and successful payment authorisation on the Marketplace.</li>
              </ol>

              {/* Mandatory Transaction Conditions Callout Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 shadow-md">
                <h4 className="text-xs font-black uppercase tracking-wider text-ushop-pink flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Mandatory Transaction Conditions
                </h4>
                <div className="space-y-2 text-xs leading-relaxed text-slate-200">
                  <div className="p-2.5 bg-slate-800/80 rounded-xl">
                    <strong className="text-white">1. PRICE INTEGRITY & ALL-INCLUSIVE TAXES:</strong> Product pricing stated on listings must represent the total cost, inclusive of all applicable statutory taxes and statutory fees.
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl">
                    <strong className="text-white">2. CLEARLY ITEMIZED ANCILLARY CHARGES:</strong> Delivery charges, courier handling, packaging, and shipping insurance costs are payable by the Buyer ONLY if clearly stated before checkout.
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl">
                    <strong className="text-white">3. QUALITY, FITNESS & CONFORMITY STANDARDS:</strong> Tech equipment must be of satisfactory functional condition, fit and safe for specified purposes, and conform strictly to technical descriptions.
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl">
                    <strong className="text-white">4. GOOD TITLE, NON-INFRINGEMENT & CLEAN PROPERTY WARRANTY:</strong> Seller warrants sole beneficial ownership, legal right to sell, and freedom from third-party liens, active financing, or theft/crime investigations.
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl">
                    <strong className="text-white">5. COMPREHENSIVE TECHNICAL DISCLOSURE:</strong> Seller warrants full disclosure of specs, cosmetic flaws, battery health, repair history, and software locks in the listing specification field.
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 text-sm pt-2">4.3 Mandatory Technical Disclosure Requirements for Sellers</h3>
              <p>Because technology equipment carries risks of latent functional defects, software locks, or undisclosed component degradation, Sellers must provide mandatory technical disclosures in the product specification area:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Functional Condition & Cosmetic Grade:</strong> Exact operational state (New, Open Box, Refurbished, Used - Mint, Used - Good, Used - Fair, or For Parts/Defective) and explicit disclosure of cosmetic scratches, dents, or screen burn-in.</li>
                <li><strong>Component Authenticity & Modifications:</strong> Declaration of original versus aftermarket replacement parts (e.g., replaced laptop screens, third-party batteries, modified BIOS/firmware).</li>
                <li><strong>Battery Health & Operational Capacity:</strong> Percentage of remaining maximum battery capacity for laptops, smartphones, and portable electronics.</li>
                <li><strong>Account & Carrier Unlocking:</strong> Affirmative confirmation that devices are entirely removed from remote management software (MDM), cloud locks (e.g., Apple iCloud, Google FRP), BIOS passwords, and mobile network carrier restrictions.</li>
                <li><strong>Warranty Terms:</strong> Clear statements regarding whether original manufacturer warranty remains valid and transferable, or if the Seller provides a limited C2C warranty.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <DollarSign className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>5. Payments, Escrow Architecture & Store Credit</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">5.1 Payment Methods & Guidelines</h3>
              <p>
                Buyers must complete all payments due under these General Terms in accordance with the Payment Guidelines on <span className="font-semibold text-gray-900">ushopgh.com</span>. Accepted payment channels include verified local mobile money transfers, debit/credit cards (Visa, MasterCard), bank wire transfers, and U-Shop Store Credits.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-2">5.2 C2C Escrow Protection Mechanism</h3>
              <p>To safeguard peer-to-peer technology purchases against fraud, hardware non-delivery, or dead-on-arrival (DOA) equipment:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Escrow Fund Retention:</strong> Payments made by Buyers are held securely in a dedicated U-Shop Escrow Account upon checkout.</li>
                <li><strong>Inspection Period:</strong> Funds are retained during the courier delivery phase and throughout the <strong>48-Hour Technical Inspection Window</strong> defined in Section 6.2.</li>
                <li><strong>Payout Disbursement:</strong> U-Shop releases escrowed funds to the Seller&apos;s payout account only after the Buyer confirms satisfactory receipt or after the 48-hour inspection period lapses without a formal dispute filing.</li>
              </ol>

              {/* Escrow Flow Diagram */}
              <div className="my-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-xs font-bold text-gray-800 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <span className="px-3 py-1.5 bg-white border rounded-xl shadow-xs">[Buyer Order & Payment]</span>
                <span className="text-ushop-pink">➔</span>
                <span className="px-3 py-1.5 bg-white border rounded-xl shadow-xs">[U-Shop Escrow Hold]</span>
                <span className="text-ushop-pink">➔</span>
                <span className="px-3 py-1.5 bg-white border rounded-xl shadow-xs">[Courier Delivery]</span>
                <span className="text-ushop-pink">➔</span>
                <span className="px-3 py-1.5 bg-white border rounded-xl shadow-xs">[48-Hr Tech Inspection]</span>
                <span className="text-ushop-pink">➔</span>
                <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl shadow-xs">[Seller Payout]</span>
              </div>

              <h3 className="font-bold text-gray-900 text-sm pt-2">5.3 Store Credit Terms & Conditions</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Earning & Usage:</strong> Store Credits may be earned via verified promotional cashbacks, platform referral campaigns, or return refund settlements. Store Credits are tied to your registered account and are non-transferable.</li>
                <li><strong>No Fiat Conversion:</strong> Store Credits carry no independent cash value and cannot be redeemed or exchanged for physical fiat currency, except where required by local statute.</li>
                <li><strong>Fraud Forfeiture:</strong> U-Shop reserves the right to cancel, adjust, or invalidate Store Credit balances at its discretion if unauthorised system exploitation, fraudulent referrals, or illicit account activity is identified.</li>
              </ol>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <RefreshCw className="w-6 h-6 text-amber-500 shrink-0" />
              <span>6. Returns, 48-Hour Inspection Window & Refund Policy</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">6.1 Centralised Managed Returns</h3>
              <p>
                All returns of technology products by Buyers and acceptance of returned goods by Sellers are centrally managed by U-Shop in accordance with the official Returns and Refund Policy published on <span className="font-semibold text-gray-900">ushopgh.com</span>. U-Shop maintains administrative discretion over return authorisations, subject to applicable territorial consumer protection laws.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-2">6.2 The 48-Hour Technology Inspection Period</h3>
              <p>
                Due to the technical nature of pre-owned hardware, Buyers are granted a <strong>48-Hour Technical Inspection Window</strong> commencing immediately upon documented courier delivery. During this window, a Buyer may initiate a return request if the delivered technology equipment:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Fails Functional Testing:</strong> Is dead-on-arrival (DOA), suffers undisclosed hardware failure, or contains hidden functional defects;</li>
                <li><strong>Contains Unannounced Locks:</strong> Is locked to an iCloud, Google, BIOS, or carrier lock that prevents normal operation;</li>
                <li><strong>Materially Misrepresents Specifications:</strong> Contains different internal hardware components than listed (e.g., lower RAM capacity, different GPU model, altered processor generation); or</li>
                <li><strong>Sustained Shipping Damage:</strong> Shows clear evidence of physical impact or damage incurred during transport before delivery.</li>
              </ul>

              <h3 className="font-bold text-gray-900 text-sm pt-2">6.3 Exclusions from Return Rights</h3>
              <p>Returns shall <strong>not</strong> be accepted if the request is based on:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Change of mind or buyer&apos;s remorse post-delivery;</li>
                <li>Incompatibility with third-party software/hardware systems where the Seller&apos;s listing specs were accurate;</li>
                <li>Buyer-induced physical damage, liquid ingress, unauthorised disassembly, or firmware flashing/overclocking executed after delivery; or</li>
                <li>Software license keys, digital activation codes, or downloadable digital products where successful delivery/activation has occurred.</li>
              </ol>

              <h3 className="font-bold text-gray-900 text-sm pt-2">6.4 Refund Methods & Discretion</h3>
              <p>Where a return is approved by U-Shop acting on behalf of the Seller, refunds are processed within 3–5 business days via:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Original payment source (Card, Mobile Money, Bank Account); or</li>
                <li>U-Shop Store Credit, upon explicit Buyer election.</li>
              </ul>
              <p className="text-xs text-gray-500 font-medium">Approved refunds may cover the item price and eligible shipping fees.</p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
              <span>7. Rules Governing User Content, Reviews & Platform Etiquette</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">7.1 Accuracy & Truthfulness</h3>
              <p>
                &quot;User Content&quot; includes all product descriptions, spec listings, benchmark charts, photographs, reviews, comments, and direct messages submitted to <span className="font-semibold text-gray-900">ushopgh.com</span>. All User Content submitted by you must be accurate, complete, truthful, and up to date.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-2">7.2 Prohibited Content Categories</h3>
              <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 text-xs space-y-1.5 text-red-950">
                <p className="font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Prohibited Content Types
                </p>
                <ul className="list-disc pl-5 space-y-1 text-red-900">
                  <li>Intellectual Property Infringements (Counterfeit goods, pirated software)</li>
                  <li>Defamatory, Hate Speech, Obscene, Unlawful, or Racially Insulting Material</li>
                  <li>Deceptive Descriptions, False Benchmarks, or Altered Technical Photographs</li>
                  <li>Malicious Code, Virus Links, Keyloggers, Spyware, or Phishing URLs</li>
                  <li>Spam, Unsolicited Commercial Messaging, or Chain Letters</li>
                </ul>
              </div>

              <h3 className="font-bold text-gray-900 text-sm pt-2">7.3 Inauthentic Reviews & Off-Platform Transaction Interference</h3>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li><strong>Authenticity of Reviews:</strong> You shall not utilise the review system to post fake, misleading, or paid product or seller reviews.</li>
                <li>
                  <strong>Prohibition of Off-Platform Circumvention:</strong> Users are strictly forbidden from interfering with transactions or bypassing U-Shop platform fees by:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Contacting another user to buy or sell a listed item outside of the U-Shop Marketplace;</li>
                    <li>Communicating with a user involved in an active transaction to warn them away from a particular buyer or seller outside official dispute channels; or</li>
                    <li>Contacting another user with the intent to solicit off-platform direct payments (cash, wire transfer, or external crypto payments).</li>
                  </ul>
                </li>
              </ol>

              <h3 className="font-bold text-gray-900 text-sm pt-2">7.4 Content Licensing & Moral Rights Waiver</h3>
              <p>
                <strong>License to User Content:</strong> By submitting User Content, you grant U-Shop a worldwide, royalty-free, sub-licensable license to host, reproduce, adapt, publish, and distribute such User Content solely for the purposes of operating, promoting, and improving the Marketplace. This license remains in effect for as long as the User Content is available on the Marketplace and terminates automatically upon your deletion of the content or closure of your account, except that: (a) U-Shop may retain and use copies as required to comply with legal obligations, resolve disputes, or enforce these General Terms; and (b) content already incorporated into external marketing materials or published archives before deletion may continue to exist in that form, though U-Shop will not create new uses of it after termination.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Lock className="w-6 h-6 text-purple-600 shrink-0" />
              <span>8. Acceptable Website & Mobile Application Use</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">8.1 Permitted Usage Activities</h3>
              <p>You may access and utilise <span className="font-semibold text-gray-900">ushopgh.com</span> via a standard web browser or mobile application software solely for:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Viewing public listing pages and media streams;</li>
                <li>Downloading pages for local web browser caching purposes;</li>
                <li>Printing physical pages for personal, non-commercial evaluation (provided printing is not systematic or excessive); and</li>
                <li>Buying and selling technology equipment in accordance with these General Terms.</li>
              </ol>

              <h3 className="font-bold text-gray-900 text-sm pt-2">8.2 Prohibited Technical Conduct & Security Restrictions</h3>
              <p>You must not edit, modify, republish, sell, rent, sub-license, or commercially exploit any material from <span className="font-semibold text-gray-900">ushopgh.com</span> unless you own or control the relevant rights. Additionally, you are strictly prohibited from:</p>

              <div className="bg-slate-900 text-slate-100 p-4 sm:p-5 rounded-2xl space-y-2 text-xs">
                <p className="font-bold uppercase tracking-wider text-ushop-pink flex items-center gap-1.5">
                  <Ban className="w-4 h-4" />
                  Prohibited Technical Actions
                </p>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
                  <li>Hacking, probing, vulnerability scanning, or security system testing.</li>
                  <li>Automated data extraction (scraping, data mining, harvesting, screen scraping) without explicit prior written consent from U-Shop management.</li>
                  <li>Circumventing authentication, rate limits, or robots.txt access directives.</li>
                  <li>Transmitting malware, Trojans, ransomware, worms, or keystroke loggers.</li>
                  <li>Imposing unreasonable server loads, DDoS attacks, or bandwidth exhaustion.</li>
                  <li>Utilising collected user contact data for unsolicited direct marketing (SMS marketing, telemarketing, email spam, or direct postal mailing).</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>9. Anti-Fraud, AML Compliance & Due Diligence Audit Rights</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">9.1 Anti-Fraud & AML Compliance Framework</h3>
              <p>
                U-Shop operates a rigorous Anti-Money Laundering (AML), Counter-Terrorist Financing (CTF), and Anti-Fraud compliance program. Because high-value technology items (e.g., premium laptops, GPUs, enterprise server gear) carry inherent risks of illicit trade, U-Shop reserves the right to perform identity verification (KYC) checks on all buyers and sellers.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-2">9.2 Mandatory Documentation & Premises Audit Rights</h3>
              <p>Upon reasonable request by U-Shop, you agree to provide complete information, documentation, and access to verify your adherence to these General Terms, including:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Valid government-issued photo identification (National ID, Student ID, Passport, Driver&apos;s License);</li>
                <li>Proof of legitimate acquisition/ownership for listed technology equipment (original purchase invoices, store receipts, serial number documentation);</li>
                <li>Business registration documentation (for commercial vendors); or</li>
                <li>Compliance documentation required under court orders or statutory regulatory requests.</li>
              </ol>
            </div>
          </section>

          {/* Section 10 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Scale className="w-6 h-6 text-ushop-purple shrink-0" />
              <span>10. Copyright, Trademarks & Intellectual Property</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">10.1 U-Shop Proprietary Rights</h3>
              <p>
                Subject to the express provisions of these General Terms, U-Shop and its licensors own and control all copyright, software code, database architecture, trade secrets, domain names (<span className="font-semibold text-gray-900">ushopgh.com</span>), and intellectual property rights in the Marketplace. All rights are strictly reserved.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-2">10.2 Trademark Guidelines</h3>
              <p>
                &quot;U-Shop&quot;, <span className="font-semibold text-gray-900">ushopgh.com</span>, and associated stylised logos are registered and unregistered trademarks belonging to U-Shop. U-Shop does not permit the commercial or public use of these trademarks; unauthorised usage constitutes an infringement of law.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-2">10.3 Third-Party Brand Logos & Disclaimers</h3>
              <p>
                Third-party technology brand trademarks (e.g., Apple, Intel, AMD, Nvidia, Dell, HP, Samsung, Sony, Microsoft) displayed on the Marketplace are the property of their respective trademark holders. Unless explicitly stated, U-Shop is not affiliated with, sponsored by, or endorsed by these third-party brand owners, and the display of third-party marks does not grant any license to users.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Lock className="w-6 h-6 text-indigo-600 shrink-0" />
              <span>11. Data Privacy & Personal Data Misuse Liability</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">11.1 Processing Under Privacy & Cookie Notices</h3>
              <p>
                U-Shop collects and processes all personal data obtained through the Marketplace in strict compliance with the <Link href="/privacy" className="text-ushop-pink font-semibold hover:underline">U-Shop Privacy Notice</Link> and Cookie Policy published on <span className="font-semibold text-gray-900">ushopgh.com</span>.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-2">11.2 Direct Seller Liability for Buyer Data Misuse</h3>
              <p>In the execution of a C2C transaction, Sellers receive necessary Buyer contact and shipping information (e.g., physical address, delivery contact phone number) solely for order fulfilment.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Strict Confidentiality:</strong> Sellers shall not utilise Buyer personal data for any purpose other than completing the specific transaction.</li>
                <li><strong>Exclusion of U-Shop Liability:</strong> Sellers are directly and exclusively liable to Buyers for any misuse, unauthorised disclosure, or improper commercial exploitation of Buyer personal data. U-Shop bears zero liability to Buyers for data misuse committed independently by third-party Sellers.</li>
              </ul>
            </div>
          </section>

          {/* Section 12 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
              <span>12. Limitation of Liability, Disclaimers & Indemnification</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">12.1 Marketplace Disclaimers</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>&quot;As Is&quot; Facilitation:</strong> U-Shop provides the Marketplace platform on an &quot;as is&quot; and &quot;as available&quot; basis without express or implied warranties of merchantability, fitness for a particular purpose, or uninterrupted availability.</li>
                <li><strong>Third-Party Seller Products:</strong> U-Shop does not manufacture, physically inspect before listing, or independently warrant every item listed by C2C Sellers. The relevant Seller remains exclusively responsible for product quality, title, and fulfilment.</li>
              </ol>

              <h3 className="font-bold text-gray-900 text-sm pt-2">12.2 Exclusions & Limitations of Financial Liability</h3>
              <p>
                To the maximum extent permitted by law, U-Shop (including its directors, officers, employees, and agents) shall not be liable for indirect, incidental, consequential, or punitive damages, data loss, hardware incompatibility, or loss of profits arising out of Marketplace transactions. Where U-Shop is found liable for direct damages arising from its own acts or omissions, U-Shop&apos;s aggregate liability to a user shall not exceed the greater of (a) the total fees paid by that user to U-Shop in the 12 months preceding the claim, or (b) GHS 500. This limitation does not apply to liability arising from U-Shop&apos;s fraud, gross negligence, or willful misconduct, or where a cap is prohibited by applicable law.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-2">12.3 User Indemnification</h3>
              <p>You agree to defend, indemnify, and hold harmless U-Shop, its directors, officers, employees, agents, and successors from and against any claims, liabilities, losses, damages, expenses, fines, and legal fees resulting from:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Your breach of any provision of these General Terms;</li>
                <li>Your listing or sale of stolen, counterfeit, defective, or non-compliant technology equipment;</li>
                <li>Your infringement of any third-party intellectual property or privacy rights; or</li>
                <li>Your misuse of the Marketplace or violation of applicable statutory laws.</li>
              </ol>
            </div>
          </section>

          {/* Section 13 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Ban className="w-6 h-6 text-red-600 shrink-0" />
              <span>13. Enforcement, Breaches & Account Remedies</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <p>
                If you commit a breach of these General Terms, or if U-Shop reasonably suspects a breach, U-Shop may immediately take one or more of the following remedial actions:
              </p>

              {/* Enforcement Escalation Flow */}
              <div className="my-3 p-4 bg-red-50/60 border border-red-100 rounded-2xl text-xs space-y-2">
                <p className="font-bold text-red-900 uppercase tracking-wider text-xs">Enforcement Escalation Matrix</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 bg-white border border-red-100 rounded-xl">
                    <strong className="text-amber-700 block">[Minor Offense]</strong>
                    Temporary Formal Warning & Content Modification
                  </div>
                  <div className="p-2.5 bg-white border border-red-100 rounded-xl">
                    <strong className="text-orange-700 block">[Moderate Offense]</strong>
                    Delisting of Product Postings & Escrow Payout Freeze
                  </div>
                  <div className="p-2.5 bg-white border border-red-100 rounded-xl">
                    <strong className="text-red-700 block">[Severe / Fraud]</strong>
                    Immediate Account Termination & Referral to Law Enforcement
                  </div>
                </div>
              </div>

              <ol className="list-decimal pl-5 space-y-1.5">
                <li><strong>Formal Warning:</strong> Issue one or more formal written warnings to your registered email address;</li>
                <li><strong>Listing Removal:</strong> Temporarily or permanently unpublish, edit, or delete your product listings or User Content;</li>
                <li><strong>Account Suspension:</strong> Temporarily suspend your login access or restrict buying/selling privileges;</li>
                <li><strong>Escrow & Fund Retention:</strong> Freeze escrow payouts or offset account funds against proven financial damages caused by your breach;</li>
                <li><strong>Permanent Ban:</strong> Permanently terminate your account and block your IP address, device IDs, and payment details from accessing ushopgh.com; and/or</li>
                <li><strong>Legal Prosecution:</strong> Initiate formal legal proceedings against you for monetary damages and report fraudulent activity to statutory law enforcement authorities.</li>
              </ol>
            </div>
          </section>

          {/* Section 14 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building className="w-6 h-6 text-indigo-600 shrink-0" />
              <span>14. Governance, Boilerplate Legal Clauses & Jurisdiction</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">14.1 Entire Agreement</h3>
              <p>
                These General Terms, together with the U-Shop Privacy Notice, Returns & Refund Policy, Payment Guidelines, and Store Credit Terms, constitute the entire legal agreement between you and U-Shop regarding your use of the Marketplace, superseding all prior agreements or understandings.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-1">14.2 Hierarchy of Terms</h3>
              <p>
                In the event of any ambiguity or conflict between these General Terms and any secondary policy document published on the platform, these General Terms shall take precedence, unless explicitly stated otherwise.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-1">14.3 Policy Variations & Updates</h3>
              <p>
                U-Shop reserves the right to modify these General Terms at any time. Revised terms become effective immediately upon publication on <span className="font-semibold text-gray-900">ushopgh.com</span>. Your continued use of the Marketplace following the publication of revised terms constitutes your binding acceptance of the changes.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-1">14.4 No Waiver</h3>
              <p>
                No failure or delay by U-Shop in exercising any legal right or remedy under these General Terms shall operate as a waiver of that right or remedy, nor shall a single or partial exercise preclude any further exercise thereof.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-1">14.5 Severability</h3>
              <p>
                If any provision of these General Terms is held by a court of competent jurisdiction to be invalid, illegal, or unenforceable, that provision shall be deemed modified to the minimum extent necessary to make it valid and enforceable, and the remaining provisions shall continue in full legal force and effect.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-1">14.6 Assignment</h3>
              <p>
                You may not assign, transfer, or sub-contract your rights or obligations under these General Terms without U-Shop&apos;s prior written consent. U-Shop may freely assign, transfer, or sub-contract its rights and obligations to a parent company, subsidiary, or successor entity without restriction.
              </p>

              <h3 className="font-bold text-gray-900 text-sm pt-1">14.7 Third-Party Rights</h3>
              <p>A person or entity who is not a party to these General Terms holds no third-party rights to enforce any term herein.</p>

              <h3 className="font-bold text-gray-900 text-sm pt-1">14.8 Governing Law & Jurisdiction</h3>
              <p>
                These General Terms shall be governed by, interpreted, and construed in accordance with the laws of the territory in which the operating U-Shop company is registered (Republic of Ghana). Any disputes or legal claims arising from or relating to these terms shall be submitted to the exclusive jurisdiction of the competent courts in Accra, Ghana.
              </p>
            </div>
          </section>

          {/* Section 15 */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Info className="w-6 h-6 text-ushop-pink shrink-0" />
              <span>15. Company Details, Formal Notices & Revision Control</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <h3 className="font-bold text-gray-900 text-sm">15.1 Corporate Details & Contact Channels</h3>
              <p>For general support inquiries, legal notices, dispute filings, or copyright infringement notifications, don&apos;t hesitate to get in touch with U-Shop administration through the following official channels:</p>

              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <tr>
                      <th className="p-3">Corporate Attribute</th>
                      <th className="p-3">Details & Channels</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-3 font-semibold text-gray-900">Legal Entity Name</td>
                      <td className="p-3">U-Shop Technology Marketplace Ltd.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-gray-900">Official Web Domain</td>
                      <td className="p-3">ushopgh.com</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-gray-900">General Customer Care</td>
                      <td className="p-3"><a href="mailto:support@ushopgh.com" className="text-ushop-pink font-bold hover:underline">support@ushopgh.com</a></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-gray-900">Legal & Privacy Notices</td>
                      <td className="p-3"><a href="mailto:legal@ushopgh.com" className="text-ushop-purple font-bold hover:underline">legal@ushopgh.com</a></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-gray-900">Security & Fraud Reporting</td>
                      <td className="p-3"><a href="mailto:security@ushopgh.com" className="text-red-600 font-bold hover:underline">security@ushopgh.com</a></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-gray-900">Physical Headquarters</td>
                      <td className="p-3">Accra, Ghana</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="font-bold text-gray-900 text-sm pt-2">15.2 Document Revision Log</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <tr>
                      <th className="p-3">Revision</th>
                      <th className="p-3">Issue Date</th>
                      <th className="p-3">Author / Approver</th>
                      <th className="p-3">Primary Summary of Changes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 font-bold text-ushop-pink">v1.0</td>
                      <td className="p-3">September 1, 2026</td>
                      <td className="p-3">Legal Counsel</td>
                      <td className="p-3">Initial formal release of Platform Terms of Service.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Approval Box */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mt-4">
                <div>
                  <span className="text-gray-500 font-medium block">Approved By</span>
                  <span className="font-bold text-white">Head of Legal & Regulatory Compliance - U-Shop E-Commerce Group</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 font-medium block">Effective Date</span>
                  <span className="font-bold text-ushop-pink">1st September, 2026</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
};

export default TermsPage;
