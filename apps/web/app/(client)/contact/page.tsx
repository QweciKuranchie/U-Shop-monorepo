"use client";

import React, { useState } from "react";
import Container from "@/components/Container";
import Title from "@/components/Title";
import { contactConfig } from "@/config/contact";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message:
            data.message ||
            `Thank you for reaching out! ${contactConfig.responseTimes.general}.`,
        });
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Contact Form Submission Error:", error);
      setStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fbfbfd] min-h-screen py-12 sm:py-16 md:py-20">
      <Container>
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">

          <Title className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Get In Touch With Us
          </Title>

          <p className="text-sm sm:text-base text-gray-500 mt-4 leading-relaxed">
            Have questions about orders, student verification, selling on U-Shop, or technical support? We&apos;re here to help!
          </p>
        </div>

        {/* Grid Layout: Contact Info (Left) + Contact Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-ushop-purple-dark text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                Contact Information
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mb-8 leading-relaxed">
                Call or email us. We are based in Accra and help buyers and sellers across Ghana.
              </p>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold text-white/70 tracking-wider">
                      Phone Number
                    </h3>
                    <a
                      href={`tel:${contactConfig.company.phoneClean}`}
                      className="text-sm sm:text-base font-bold text-white hover:underline mt-0.5 block"
                    >
                      {contactConfig.company.phone}
                    </a>
                    <span className="text-xs text-white/60">
                      {contactConfig.responseTimes.quick}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold text-white/70 tracking-wider">
                      Email Address
                    </h3>
                    <a
                      href={`mailto:${contactConfig.emails.support}`}
                      className="text-sm sm:text-base font-bold text-white hover:underline mt-0.5 block break-all"
                    >
                      {contactConfig.emails.support}
                    </a>
                    <span className="text-xs text-white/60">
                      {contactConfig.responseTimes.general}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold text-white/70 tracking-wider">
                      Headquarters
                    </h3>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {contactConfig.company.address}, {contactConfig.company.city}
                    </p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold text-white/70 tracking-wider">
                      Working Hours
                    </h3>
                    <p className="text-xs sm:text-sm text-white/90 mt-0.5 font-medium">
                      {contactConfig.businessHours.weekday}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ushop-pink/10 text-ushop-pink flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Looking for FAQs?
                  </h3>
                  <p className="text-xs text-gray-500">
                    Instant answers on delivery, returns & payments.
                  </p>
                </div>
              </div>

              <Link
                href="/faqs"
                className="px-4 py-2 bg-gray-100 hover:bg-ushop-pink hover:text-white rounded-xl text-xs font-bold text-gray-800 transition-colors shrink-0"
              >
                View FAQs
              </Link>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 md:p-10 rounded-3xl border border-gray-200/80 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-ushop-pink" />
              <span>Send Us a Message</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Fill out the form below and our team will get back to you promptly.
            </p>

            {/* Status Alert */}
            {status.type && (
              <div
                className={`mb-6 p-4 rounded-2xl flex items-start gap-3 text-xs sm:text-sm ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-ushop-red border border-red-200"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-ushop-red shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{status.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    Your Name <span className="text-ushop-red">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Kwame Mensah"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-ushop-purple focus:ring-2 focus:ring-ushop-purple/20 text-sm text-gray-900 outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    Email Address <span className="text-ushop-red">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. kwame@gmail.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-ushop-purple focus:ring-2 focus:ring-ushop-purple/20 text-sm text-gray-900 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label
                  htmlFor="subject"
                  className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                >
                  Subject <span className="text-ushop-red">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Order Inquiry / Campus Delivery / Seller Question"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-ushop-purple focus:ring-2 focus:ring-ushop-purple/20 text-sm text-gray-900 outline-none transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label
                  htmlFor="message"
                  className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                >
                  Message <span className="text-ushop-red">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe how we can assist you..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-ushop-purple focus:ring-2 focus:ring-ushop-purple/20 text-sm text-gray-900 outline-none transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-ushop-purple hover:bg-ushop-purple-dark text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hoverEffect flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ContactPage;
