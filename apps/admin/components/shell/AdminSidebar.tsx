"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { NAV_SECTIONS } from "./nav";

interface Props {
  /** Desktop: collapsed to icons only. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Mobile drawer. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {NAV_SECTIONS.map((section, idx) => (
        <div key={section.title} className="mb-1">
          {!collapsed && (
            <h3 className="mb-2 ml-3 text-xs font-medium text-muted-foreground">{section.title}</h3>
          )}
          <ul className="space-y-1">
            {section.links.map(({ name, href, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? name : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {collapsed ? <span className="sr-only">{name}</span> : <span>{name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
          {idx < NAV_SECTIONS.length - 1 && <hr className="mt-3 border-border" />}
        </div>
      ))}
    </nav>
  );
}

function SignOut({ collapsed }: { collapsed: boolean }) {
  return (
    <SignOutButton>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        {collapsed ? <span className="sr-only">Sign out</span> : <span>Sign out</span>}
      </button>
    </SignOutButton>
  );
}

const AdminSidebar = ({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: Props) => (
  <>
    {/* Desktop */}
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col justify-between border-r bg-card p-4 transition-[width] duration-200 md:flex ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="min-h-0 overflow-y-auto">
        <div className={`mb-4 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Link href="/admin" aria-label="U-Shop admin home">
              <Image src="/assets/logos/web/logo-300w.png" alt="U-Shop" width={110} height={30} className="h-7 w-auto" priority />
            </Link>
          )}
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>
        <NavList collapsed={collapsed} />
      </div>
      <div className="pt-4">
        <SignOut collapsed={collapsed} />
      </div>
    </aside>

    {/* Mobile drawer */}
    {mobileOpen && (
      <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
        <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={onCloseMobile} />
        <aside className="relative flex h-full w-72 max-w-[85vw] flex-col justify-between overflow-y-auto bg-card p-4">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <Image src="/assets/logos/web/logo-300w.png" alt="U-Shop" width={110} height={30} className="h-7 w-auto" />
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList collapsed={false} onNavigate={onCloseMobile} />
          </div>
          <div className="pt-4">
            <SignOut collapsed={false} />
          </div>
        </aside>
      </div>
    )}
  </>
);

export default AdminSidebar;
