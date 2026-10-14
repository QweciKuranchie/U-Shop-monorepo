"use client";

import Logo from "@/components/common/Logo";
import Link from "next/link";
import { Home, RefreshCw, WifiOff, Lightbulb } from "lucide-react";

const OfflinePage = () => {
  return (
    <div className="min-h-screen bg-ushop_light_bg flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-lg w-full space-y-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo imageClassName="h-10 md:h-12" />
        </div>

        {/* Offline Icon */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-ushop-purple/10 animate-pulse" />
            <WifiOff className="relative w-20 h-20 text-ushop-purple/70" strokeWidth={1.5} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-dark-color mt-6">
            You&apos;re Offline
          </h1>
          <p className="mt-3 text-base text-light-color max-w-sm mx-auto leading-relaxed">
            It looks like you&apos;ve lost your internet connection. Please check
            your network settings and try again.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-2xl text-white bg-ushop-purple hover:bg-ushop-purple/90 shadow-lg shadow-ushop-purple/20 hover:shadow-xl hover:shadow-ushop-purple/30 hoverEffect transform cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-2xl text-ushop-purple bg-white border-2 border-ushop-purple/20 hover:border-ushop-purple hover:bg-ushop-purple/5 shadow-sm hover:shadow-md hoverEffect"
          >
            <Home className="w-4 h-4" />
            Back to Homepage
          </Link>
        </div>

        {/* Tip */}
        <div className="text-center pt-6 border-t border-ushop-purple/10">
          <p className="text-sm text-light-color flex items-center justify-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Pages you&apos;ve visited before may still be available offline.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
