"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, ShoppingCart, DollarSign, BarChart3, Store, Star } from "lucide-react";
import { cn } from "@repo/utils";

export const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Listings", href: "/dashboard/listings", icon: ShoppingBag },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Reviews", href: "/dashboard/reviews", icon: Star },
  { name: "Payouts", href: "/dashboard/payouts", icon: DollarSign },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Store Settings", href: "/dashboard/store", icon: Store },
];

export function SellerSidebarNav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 flex-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

export function SellerSidebar() {
  return (
    <aside className="hidden md:flex md:w-64 border-r bg-card min-h-screen flex-col p-4 space-y-6 shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1">
        <Image
          src="/assets/logos/web/logo-300w.png"
          alt="UShop Seller Center"
          width={120}
          height={32}
          className="h-8 w-auto object-contain"
          priority
        />
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          Seller
        </span>
      </Link>
      <SellerSidebarNav />
      <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        Need help? Visit <a href="https://ushopgh.com/help" target="_blank" rel="noreferrer" className="underline text-foreground">UShop Support</a>
      </div>
    </aside>
  );
}