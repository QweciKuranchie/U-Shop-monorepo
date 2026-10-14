"use client";

import React, { useEffect } from "react";
import { useAuthModal } from "@/hooks/useAuthModal";
import SlidingAuthContainer from "./SlidingAuthContainer";
import { X } from "lucide-react";

export default function AuthModal() {
  const { isOpen, mode, closeAuthModal } = useAuthModal();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeAuthModal]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop overlay click handler */}
      <div
        className="absolute inset-0"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Authentication modal"
        className="relative z-10 w-full max-w-[880px] my-auto flex flex-col items-center justify-center pt-10 sm:pt-0 max-h-[96dvh]"
      >
        {/* Prominent High-Contrast Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute -top-3 right-0 sm:-top-11 sm:right-0 z-[200] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-purple-950 font-extrabold text-xs shadow-xl border border-purple-100 hover:bg-white hover:text-ushop-pink transition-all cursor-pointer min-w-[36px] min-h-[36px] justify-center"
          aria-label="Close authentication modal"
        >
          <X className="w-4 h-4 text-ushop-pink stroke-[2.5]" />
          <span className="hidden sm:inline">Close</span>
        </button>

        {/* Sliding Auth Panel */}
        <SlidingAuthContainer key={mode} initialMode={mode} isModal={true} />
      </div>
    </div>
  );
}
