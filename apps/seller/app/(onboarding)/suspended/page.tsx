import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = { title: "Seller access unavailable | U-Shop" };

export default function SuspendedSellerPage() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
    <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
      <ShieldAlert className="mx-auto mb-5 h-12 w-12 text-amber-400" aria-hidden="true" />
      <h1 className="mb-3 text-2xl font-bold">Seller access unavailable</h1>
      <p className="mb-7 text-sm leading-6 text-slate-300">Your seller account or store is currently suspended. The Seller Center dashboard is unavailable until U-Shop restores access. Contact U-Shop support if you need help.</p>
      <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-purple-600 px-5 font-semibold text-white transition-colors hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400">Return to Seller Center home</Link>
    </div>
  </main>;
}
