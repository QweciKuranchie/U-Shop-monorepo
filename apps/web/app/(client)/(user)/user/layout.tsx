"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  User,
  Bell,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import {  Button  } from "@repo/ui";
import { useClerk } from "@clerk/nextjs";
import { cn } from "@repo/utils";
import Container from "@/components/Container";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/user/dashboard",
    icon: LayoutDashboard,
    description: "Overview & stats",
  },
  {
    title: "Orders",
    href: "/user/orders",
    icon: Package,
    description: "Track your orders",
  },
  {
    title: "Profile",
    href: "/user/profile",
    icon: User,
    description: "Personal information",
  },
  {
    title: "Notifications",
    href: "/user/notifications",
    icon: Bell,
    description: "Updates & alerts",
  },
  {
    title: "Wishlist",
    href: "/wishlist",
    icon: Heart,
    description: "Saved items",
  },
  {
    title: "Settings",
    href: "/user/settings",
    icon: Settings,
    description: "Account preferences",
  },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen py-5 bg-ushop_light_bg">
      <Container className="py-6">
        <div className="flex flex-col gap-6">
          {/* Mobile Header */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-ushop-pink/15">
              <div className="flex items-center space-x-3">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border-2 border-ushop-pink/40"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-ushop_light_pink flex items-center justify-center">
                    <User className="h-6 w-6 text-ushop-purple-dark" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-ushop-purple-dark">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">User Dashboard</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Desktop Top Navigation */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-xl border border-ushop-pink/15 overflow-hidden">
              {/* User Profile Header */}
              <div className="p-6 bg-ushop-purple-dark text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt="User avatar"
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h2 className="font-bold text-lg text-white">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      <p className="text-white/80 text-sm">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-white/90 text-sm">Active</span>
                    </div>
                    <Button
                      onClick={() => signOut()}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 border border-white/30"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>

              {/* Horizontal Navigation */}
              <nav className="p-6">
                <div className="flex flex-wrap gap-3">
                  {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group border",
                          isActive
                            ? "bg-ushop_light_pink/60 border-ushop-pink/40 shadow-sm"
                            : "hover:bg-ushop_light_pink/30 border-gray-200 hover:border-ushop-pink/30"
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isActive
                              ? "bg-ushop-purple text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 group-hover:bg-ushop-purple/20 group-hover:text-ushop-purple-dark"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div
                            className={cn(
                              "font-medium text-sm",
                              isActive
                                ? "text-ushop-purple-dark font-semibold"
                                : "text-ushop-purple-dark"
                            )}
                          >
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>

          {/* Mobile Sidebar */}
          <div className={cn("lg:hidden", sidebarOpen ? "block" : "hidden")}>
            <div className="bg-white rounded-2xl shadow-xl border border-ushop-pink/15 overflow-hidden">
              {/* User Profile Section */}
              <div className="p-6 bg-ushop-purple-dark text-white">
                <div className="flex items-center space-x-4">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt="User avatar"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover border-3 border-white/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="font-bold text-lg text-white">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-white/90 text-xs">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="p-4 space-y-2">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl transition-all duration-200 group",
                        isActive
                          ? "bg-ushop_light_pink/60 border border-ushop-pink/40 shadow-sm"
                          : "hover:bg-ushop_light_pink/30 border border-transparent"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isActive
                              ? "bg-ushop-purple text-white"
                              : "bg-gray-100 text-gray-600 group-hover:bg-ushop-purple/20 group-hover:text-ushop-purple-dark"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div
                            className={cn(
                              "font-medium",
                              isActive
                                ? "text-ushop-purple-dark font-semibold"
                                : "text-gray-900"
                            )}
                          >
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-ushop-purple-dark" : "text-gray-500"
                        )}
                      />
                    </Link>
                  );
                })}

              </nav>

              {/* Mobile Sign Out Button */}
              <div className="p-4 border-t border-gray-100">
                <Button
                  onClick={() => signOut()}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-ushop-pink/15 overflow-hidden">
              <div className="p-6 lg:p-8">{children}</div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
