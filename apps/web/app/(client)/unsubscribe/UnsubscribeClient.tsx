"use client";

import { useState } from "react";
import Link from "next/link";

export default function UnsubscribeClient({ email, token }: { email: string; token: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  // Requires a click rather than unsubscribing on page load, so mail scanners
  // that pre-fetch links can't unsubscribe people.
  const confirm = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't unsubscribe you. Please try again.");
      setMessage(data.message || "You have been unsubscribed.");
      setStatus("done");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Couldn't unsubscribe you. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-md text-center space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">Unsubscribe from the newsletter</h1>
      {!email ? (
        <p className="text-sm text-zinc-600">
          This link is missing an email address. Use the unsubscribe link in one of our emails, or contact{" "}
          <a className="underline" href="mailto:support@ushopgh.com">support@ushopgh.com</a>.
        </p>
      ) : status === "done" ? (
        <>
          <p role="status" className="text-sm text-emerald-700">{message}</p>
          <Link href="/" className="inline-block text-sm underline text-ushop-purple">Back to U-Shop</Link>
        </>
      ) : (
        <>
          <p className="text-sm text-zinc-600">
            Stop sending emails to <strong>{email}</strong>?
          </p>
          <button
            type="button"
            onClick={confirm}
            disabled={status === "loading"}
            className="min-h-11 px-6 rounded-xl bg-ushop-purple text-white text-sm font-bold disabled:opacity-50"
          >
            {status === "loading" ? "Unsubscribing…" : "Confirm unsubscribe"}
          </button>
          {status === "error" && <p role="alert" className="text-sm text-red-600">{message}</p>}
        </>
      )}
    </div>
  );
}
