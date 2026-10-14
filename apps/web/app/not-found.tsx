import Logo from "@/components/common/Logo";
import Link from "next/link";
import { Home, Search, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | UShop",
  description: "The requested page could not be found on UShop.",
};

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-ushop_light_bg flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-lg w-full space-y-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo imageClassName="h-10 md:h-12" />
        </div>

        {/* 404 Display */}
        <div className="text-center">
          <div className="relative inline-block">
            <h1 className="text-7xl sm:text-9xl font-black leading-none text-ushop-purple select-none">
              404
            </h1>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-dark-color mt-2">
            Page Not Found
          </h2>
          <p className="mt-3 text-base text-light-color max-w-sm mx-auto leading-relaxed">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has
            been moved. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-2xl text-white bg-ushop-purple hover:bg-ushop-purple/90 shadow-lg shadow-ushop-purple/20 hover:shadow-xl hover:shadow-ushop-purple/30 hoverEffect transform"
          >
            <Home className="w-4 h-4" />
            Back to Homepage
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/product"
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-2xl text-ushop-purple bg-white border-2 border-ushop-purple/20 hover:border-ushop-purple hover:bg-ushop-purple/5 shadow-sm hover:shadow-md hoverEffect"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop
            </Link>
            <Link
              href="/category"
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-2xl text-ushop-pink bg-white border-2 border-ushop-pink/20 hover:border-ushop-pink hover:bg-ushop-pink/5 shadow-sm hover:shadow-md hoverEffect"
            >
              <Search className="w-4 h-4" />
              Categories
            </Link>
          </div>
        </div>

        {/* Help Footer */}
        <div className="text-center pt-6 border-t border-ushop-purple/10">
          <p className="text-sm text-light-color">
            Need help?{" "}
            <Link
              href="/contact"
              className="font-semibold text-ushop-purple hover:text-ushop-pink hoverEffect underline underline-offset-4 decoration-ushop-purple/30 hover:decoration-ushop-pink/50"
            >
              Contact Us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
