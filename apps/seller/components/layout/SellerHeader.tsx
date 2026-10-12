"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@repo/supabase/client";
import { LogOut, Store, ShieldCheck, Menu } from "lucide-react";
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle } from "@repo/ui";
import { SellerSidebarNav } from "./SellerSidebar";

interface SellerHeaderProps {
  storeName: string;
  sellerEmail?: string;
  sellerType?: string;
}

export function SellerHeader({ storeName, sellerEmail, sellerType = "personal" }: SellerHeaderProps) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 -ml-1 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Store className="w-4 h-4 text-purple-500 shrink-0" />
            <span className="text-xs text-muted-foreground hidden sm:inline">Store:</span>
            <span className="font-semibold text-sm text-foreground truncate max-w-[130px] sm:max-w-[220px]">
              {storeName}
            </span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-3 h-3" />
            {sellerType}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {sellerEmail && (
            <span className="hidden md:inline text-xs text-muted-foreground truncate max-w-[200px]">
              {sellerEmail}
            </span>
          )}

          <Button
            type="button"
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="h-8 px-2.5 sm:px-3 text-xs gap-1.5 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px] sm:max-w-xs flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle asChild>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2"
              >
                <Image
                  src="/assets/logos/web/logo-300w.png"
                  alt="UShop Seller Center"
                  width={120}
                  height={32}
                  className="h-7 w-auto object-contain"
                />
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Seller
                </span>
              </Link>
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
            <SellerSidebarNav onItemClick={() => setMobileOpen(false)} />

            <div className="space-y-3 pt-4 border-t mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="capitalize">{sellerType} Seller</span>
                <span className="truncate max-w-[130px]">{sellerEmail}</span>
              </div>
              <Button
                type="button"
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="w-full text-xs gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
              <div className="p-2.5 bg-muted/50 rounded-lg text-xs text-muted-foreground text-center">
                Need help? Visit{" "}
                <a
                  href="https://ushopgh.com/help"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-foreground"
                >
                  UShop Support
                </a>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}