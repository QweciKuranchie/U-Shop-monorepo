"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Settings,
  Package,
  Heart,
  LogOut,
  UserCircle,
  Logs,
  Wallet,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
 } from "@repo/ui";
import { useUserData } from "@/contexts/UserDataContext";

const UserDropdown = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const {
    ordersCount,
    walletBalance,
    isLoading: isLoadingOrders,
  } = useUserData();

  if (!user) return null;

  const handleSignOut = () => {
    signOut();
    setOpen(false);
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-ushop_light_bg group border border-ushop-pink/20 hover:border-ushop-pink hoverEffect cursor-pointer">
          <div className="relative">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.fullName || "User"}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border-2 border-ushop-purple/20 group-hover:border-ushop-purple/40 transition-colors"
              />
            ) : (
              <UserCircle className="w-8 h-8 text-gray-500 group-hover:text-ushop-pink transition-colors" />
            )}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="hidden lg:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-800 group-hover:text-ushop-pink transition-colors">
              {user.firstName || "User"}
            </span>
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0 bg-white dark:bg-zinc-950 border border-gray-100 dark:border-gray-800 shadow-2xl rounded-2xl overflow-hidden z-50" align="end" sideOffset={6}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.fullName || "User"}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="w-12 h-12 text-gray-500" />
            )}
            <div>
              <h3 className="font-semibold text-gray-800">
                {user.fullName || user.firstName || "User"}
              </h3>
              <p className="text-sm text-gray-500">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>

        <div className="p-2">
          {walletBalance > 0 && (
            <div className="mb-2 mx-2 p-3 rounded-lg bg-ushop-purple/10 border border-ushop-purple/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-ushop-purple" />
                  <span className="text-sm font-medium text-gray-700">
                    Wallet Balance
                  </span>
                </div>
                <span className="text-lg font-bold text-ushop-purple">
                  ${walletBalance.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Link
            href="/user/profile"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-ushop_light_bg transition-colors duration-200 group"
          >
            <User className="w-4 h-4 text-gray-500 group-hover:text-ushop-pink transition-colors" />
            <span className="text-gray-800 group-hover:text-ushop-pink transition-colors">
              My Profile
            </span>
          </Link>

          <Link
            href="/user/orders"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-ushop_light_bg transition-colors duration-200 group"
          >
            <Package className="w-4 h-4 text-gray-500 group-hover:text-ushop-pink transition-colors" />
            <div className="flex items-center justify-between w-full">
              <span className="text-gray-800 group-hover:text-ushop-pink transition-colors">
                My Orders
              </span>
              {isLoadingOrders ? (
                <div className="w-4 h-4 border-2 border-ushop-purple-dark border-t-transparent rounded-full animate-spin"></div>
              ) : (
                ordersCount > 0 && (
                  <span className="bg-ushop-purple-dark text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {ordersCount}
                  </span>
                )
              )}
            </div>
          </Link>

          <Link
            href="/wishlist"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-ushop_light_bg transition-colors duration-200 group"
          >
            <Heart className="w-4 h-4 text-gray-500 group-hover:text-ushop-pink transition-colors" />
            <span className="text-gray-800 group-hover:text-ushop-pink transition-colors">
              Wishlist
            </span>
          </Link>

          <Link
            href="/user/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-ushop_light_bg transition-colors duration-200 group"
          >
            <Logs className="w-4 h-4 text-gray-500 group-hover:text-ushop-pink transition-colors" />
            <span className="text-gray-800 group-hover:text-ushop-pink transition-colors">
              Dashboard
            </span>
          </Link>

          <Link
            href="/user/settings"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-ushop_light_bg transition-colors duration-200 group"
          >
            <Settings className="w-4 h-4 text-gray-500 group-hover:text-ushop-pink transition-colors" />
            <span className="text-gray-800 group-hover:text-ushop-pink transition-colors">
              Settings
            </span>
          </Link>

          <div className="my-1 border-t border-gray-100"></div>



          <Link
            href="/help"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-ushop_light_bg transition-colors duration-200 group"
          >
            <svg
              className="w-4 h-4 text-gray-500 group-hover:text-ushop-pink transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-gray-800 group-hover:text-ushop-pink transition-colors">
              Help & Support
            </span>
          </Link>
        </div>

        <div className="p-2 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-red-50 transition-colors duration-200 w-full text-left"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="text-red-600">Sign Out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserDropdown;
