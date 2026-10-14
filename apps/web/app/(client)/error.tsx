"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">Something went wrong</h1>
      <p className="text-sm text-zinc-600">
        We couldn&apos;t load this page. Please try again, or head back to the homepage.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="min-h-11 rounded-xl bg-ushop-purple px-6 text-sm font-bold text-white"
        >
          Try again
        </button>
        <Link href="/" className="min-h-11 inline-flex items-center rounded-xl border border-zinc-300 px-6 text-sm font-semibold text-zinc-800">
          Go home
        </Link>
      </div>
    </div>
  );
}
