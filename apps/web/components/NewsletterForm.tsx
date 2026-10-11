"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";

interface NewsletterFormProps {
  className?: string;
  source?: string;
}

export default function NewsletterForm({
  className = "",
  source = "footer",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "already_subscribed" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), source }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadySubscribed) {
          setStatus("already_subscribed");
          setMessage(data.error || "You're already subscribed to our newsletter!");
        } else {
          setStatus("success");
          setMessage(data.message || "Thank you for subscribing! Check your email for confirmation.");
          setEmail("");
        }
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Newsletter submission error:", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {status === "success" ? (
        <div role="status" className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor={`newsletter-email-${source}`} className="sr-only">
            Email address
          </label>
          <div className="flex w-full">
            <input
              id={`newsletter-email-${source}`}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error" || status === "already_subscribed") {
                  setStatus("idle");
                  setMessage("");
                }
              }}
              placeholder="Enter your email address"
              disabled={status === "loading"}
              aria-invalid={status === "error"}
              className="min-h-11 px-4 py-2.5 bg-gray-800 border border-gray-700 text-white text-sm rounded-l-xl
                placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-ushop-pink focus:border-ushop-pink
                w-full disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading" || !email}
              className="min-h-11 px-5 py-2.5 bg-ushop-pink border border-transparent text-white text-sm font-bold rounded-r-xl
                hover:bg-ushop-pink/90 transition-colors whitespace-nowrap disabled:opacity-50 flex items-center justify-center min-w-[110px] shrink-0"
            >
              {status === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </div>

          <p className="text-[11px] text-gray-400">
            No spam. Unsubscribe anytime. See our{" "}
            <a href="/privacy" className="underline hover:text-white">privacy policy</a>.
          </p>

          {status === "already_subscribed" && (
            <p role="status" className="text-amber-400 text-xs flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{message}</span>
            </p>
          )}

          {status === "error" && (
            <p role="alert" className="text-red-400 text-xs flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{message}</span>
            </p>
          )}
        </form>
      )}
    </div>
  );
}
