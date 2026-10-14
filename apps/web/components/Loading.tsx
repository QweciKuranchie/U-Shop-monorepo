import React from "react";
import Image from "next/image";

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({
  fullScreen = true,
  message = "Loading UShop...",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-ushop_light_bg p-6 ${
        fullScreen
          ? "fixed inset-0 z-[200] w-screen h-screen"
          : "w-full min-h-[400px]"
      }`}
    >
      <div className="relative flex flex-col items-center justify-center">

        {/* Logo Container with Spinner Ring */}
        <div className="relative flex items-center justify-center p-3">
          {/* Animated Spinner Ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent border-t-ushop-purple border-r-ushop-pink animate-spin" />

          {/* App Logo */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white p-3 rounded-2xl shadow-xl border border-purple-100/80 flex items-center justify-center overflow-hidden">
            <Image
              src="/assets/logos/app/icon-512x512.png"
              alt="UShop Logo"
              width={112}
              height={112}
              priority
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
        </div>

        {/* Loading Message */}
        <div className="mt-6 flex flex-col items-center gap-1 text-center">
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
            <span className="text-ushop-purple">
              UShop
            </span>
          </h2>
          <p className="text-xs text-gray-500 font-medium tracking-wide animate-pulse">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
