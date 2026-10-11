"use client";

import React, { useState } from "react";
import Container from "./Container";
import FooterTop from "./FooterTop";
import Logo from "./common/Logo";
import SocialMediaIcons from "./common/SocialMediaIcons";
import { SubTitle, SubText } from "@repo/ui";
import Link from "next/link";
import Image from "next/image";
import {
  quickLinksData,
  categoriesData,
  customerCareData,
  supportData,
} from "@/Constants/data";
import { Mail } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

const Footer = () => {

  return (
    <footer className="bg-[#0f172a] text-gray-300 border-t">
      <Container>
        <FooterTop />
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="space-y-4">
            <Logo />
            <SubText>
              Ghana&apos;s leading tech marketplace.
              <br />
              Affordable prices and trusted sellers
            </SubText>
            <SocialMediaIcons />
          </div>
          <div>
            <SubTitle>Quick Links</SubTitle>
            <ul className="space-y-3 mt-4">
              {quickLinksData.links.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="hover:text-ushop-pink hoverEffect"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SubTitle>{categoriesData.title}</SubTitle>
            <ul className="space-y-3 mt-4">
              {categoriesData.links.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="hover:text-ushop-pink hoverEffect"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SubTitle>{customerCareData.title}</SubTitle>
            <ul className="space-y-3 mt-4">
              {customerCareData.links.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="hover:text-ushop-pink hoverEffect"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SubTitle>{supportData.title}</SubTitle>
            <ul className="space-y-3 mt-4">
              {supportData.links.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="hover:text-ushop-pink hoverEffect"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800">
          <div className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ushop-purple/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-ushop-pink" />
                </div>
                <div>
                  <SubTitle>Join the Newsletter</SubTitle>
                  <SubText>
                    Get new arrivals, deals and updates by email
                  </SubText>
                </div>
              </div>
              <div className="flex w-full md:w-[380px]">
                <NewsletterForm source="footer" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar — legal + payment logos */}
        <div className="border-t border-gray-800">
          <div className="py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
              <p>© 2026 U-Shop. All rights reserved.</p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/privacy"
                  className="hover:text-ushop-pink transition-colors hoverEffect"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-ushop-pink transition-colors hoverEffect"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="hover:text-ushop-pink transition-colors hoverEffect"
                >
                  Cookie Policy
                </Link>
              </div>

              {/* Payment logos from /assets/icons/footer/ */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs text-gray-400 font-medium mr-1">
                  Accepted payments:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-slate-800/90 border border-slate-700/80 rounded-md p-1 h-7.5 px-1.5 flex items-center justify-center shadow-xs hover:border-slate-600 transition-colors">
                    <Image
                      src="/assets/icons/footer/Momo.png"
                      alt="MTN Mobile Money"
                      width={100}
                      height={60}
                      unoptimized
                      className="h-5 w-auto object-contain"
                    />
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700/80 rounded-md p-1 h-7.5 px-1.5 flex items-center justify-center shadow-xs hover:border-slate-600 transition-colors">
                    <Image
                      src="/assets/icons/footer/TCash.png"
                      alt="Telecel Cash"
                      width={100}
                      height={60}
                      unoptimized
                      className="h-5 w-auto object-contain"
                    />
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700/80 rounded-md p-1 h-7.5 px-1.5 flex items-center justify-center shadow-xs hover:border-slate-600 transition-colors">
                    <Image
                      src="/assets/icons/footer/AT money.png"
                      alt="AT Money"
                      width={100}
                      height={60}
                      unoptimized
                      className="h-5 w-auto object-contain"
                    />
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700/80 rounded-md p-1 h-7.5 px-1.5 flex items-center justify-center shadow-xs hover:border-slate-600 transition-colors">
                    <Image
                      src="/assets/icons/footer/visa.png"
                      alt="Visa"
                      width={100}
                      height={60}
                      unoptimized
                      className="h-5 w-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
