"use client";

import React, { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Request password reset code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!isLoaded || !signIn) return;
    setIsLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setStep("reset");
      setSuccessMsg(`Verification code sent to ${email.trim()}`);
    } catch (err: unknown) {
      const errorObj = err as { errors?: Array<{ message?: string; longMessage?: string }> };
      const msg =
        errorObj?.errors?.[0]?.longMessage ||
        errorObj?.errors?.[0]?.message ||
        "Could not find an account associated with this email.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit reset code and new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Please enter the verification code sent to your email.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isLoaded || !signIn) return;
    setIsLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/";
      } else {
        setError(`Reset incomplete (Status: ${result.status}). Please try again.`);
      }
    } catch (err: unknown) {
      const errorObj = err as { errors?: Array<{ message?: string; longMessage?: string }> };
      const msg =
        errorObj?.errors?.[0]?.longMessage ||
        errorObj?.errors?.[0]?.message ||
        "Failed to reset password. Please check your verification code.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Badge & Title */}
      <div className="text-center mb-6">
        <div className="mb-4 flex justify-center">
          <Logo imageClassName="h-9 w-auto" />
        </div>
        <div className="mx-auto w-12 h-12 rounded-2xl bg-ushop-purple flex items-center justify-center shadow-lg shadow-purple-900/20 mb-3">
          <KeyRound className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-ushop-purple-dark">
          {step === "request" ? "Forgot Password?" : "Reset Password"}
        </h1>
        <p className="text-xs text-purple-900/70 mt-1 font-medium">
          {step === "request"
            ? "Enter your email to receive a password reset code."
            : "Enter the code sent to your email along with your new password."}
        </p>
      </div>

      {/* Error / Success Messages */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Request Code Form */}
      {step === "request" ? (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 text-purple-400 w-4 h-4 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address (e.g. name@gmail.com)"
              className="w-full pl-10 pr-4 py-3 bg-purple-50/50 border border-purple-200 rounded-xl text-sm font-medium text-purple-950 placeholder:text-purple-400 focus:outline-none focus:border-ushop-pink focus:ring-2 focus:ring-ushop-pink/20 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full py-3 bg-ushop-purple hover:bg-ushop-purple-dark text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Sending Code..." : "Send Reset Code"}
          </button>
        </form>
      ) : (
        /* Reset Password Form */
        <form onSubmit={handleResetPassword} className="space-y-3.5">
          <div className="relative flex items-center">
            <ShieldCheck className="absolute left-3.5 text-purple-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit verification code"
              className="w-full pl-10 pr-4 py-2.5 bg-purple-50/50 border border-purple-200 rounded-xl text-sm font-medium text-purple-950 placeholder:text-purple-400 focus:outline-none focus:border-ushop-pink focus:ring-2 focus:ring-ushop-pink/20 transition-all"
              required
            />
          </div>

          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 text-purple-400 w-4 h-4 pointer-events-none" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
              className="w-full pl-10 pr-4 py-2.5 bg-purple-50/50 border border-purple-200 rounded-xl text-sm font-medium text-purple-950 placeholder:text-purple-400 focus:outline-none focus:border-ushop-pink focus:ring-2 focus:ring-ushop-pink/20 transition-all"
              required
            />
          </div>

          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 text-purple-400 w-4 h-4 pointer-events-none" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full pl-10 pr-4 py-2.5 bg-purple-50/50 border border-purple-200 rounded-xl text-sm font-medium text-purple-950 placeholder:text-purple-400 focus:outline-none focus:border-ushop-pink focus:ring-2 focus:ring-ushop-pink/20 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !code.trim() || !newPassword}
            className="w-full py-3 bg-ushop-purple hover:bg-ushop-purple-dark text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Resetting Password..." : "Reset Password & Sign In"}
          </button>
        </form>
      )}

      {/* Back to Login Link */}
      <div className="mt-6 pt-4 border-t border-purple-100 text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-xs font-bold text-ushop-purple hover:text-ushop-pink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
