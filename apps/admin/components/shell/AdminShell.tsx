"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Moon, Store, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui";
import AdminSidebar from "./AdminSidebar";
import Breadcrumbs from "./Breadcrumbs";
import DashboardSearch from "./DashboardSearch";

const STORAGE_KEY = "admin-sidebar-collapsed";

const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* storage unavailable: keep the default */
    }
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });

  const name = user?.fullName || user?.username || "Admin";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-card px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <DashboardSearch />
            <Link
              href="/"
              className="hidden h-10 items-center gap-1.5 rounded-lg border px-3 text-sm text-muted-foreground hover:text-foreground lg:flex"
            >
              <Store className="h-4 w-4" aria-hidden="true" />
              View store
            </Link>
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              className="flex h-10 w-10 items-center justify-center rounded-lg border text-muted-foreground hover:text-foreground"
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.imageUrl} alt="" />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminShell;
