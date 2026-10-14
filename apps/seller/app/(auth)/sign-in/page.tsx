"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@repo/supabase/client";
import { AuthShell, AuthSwitchLink } from "@/components/auth/AuthShell";
import { AuthError, AuthField, GoogleAction, PasswordField, PrimaryAction } from "@/components/auth/AuthControls";
import { safeAuthPath } from "@/lib/safe-auth-path";
import styles from "@/components/auth/auth.module.css";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = safeAuthPath(searchParams.get("redirect_url"), "/dashboard");
  const urlError = searchParams.get("error");
  const supabase = useMemo(() => createBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(
    urlError === "auth-callback-failed" ? "Google sign-in was not completed. Please try again." :
      urlError === "verification-failed" ? "That verification link has expired or is invalid. Request a new link or sign in again." : null
  );
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    try { setEmail(window.sessionStorage.getItem("seller-auth-email") || ""); } catch { /* Storage may be unavailable. */ }
  }, []);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    const errors: { email?: string; password?: string } = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading("email");
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      if (!data.user) {
        setError("We could not complete sign-in. Please try again.");
        return;
      }
      try { window.sessionStorage.removeItem("seller-auth-email"); } catch { /* Storage may be unavailable. */ }
      router.push(redirectPath);
      router.refresh();
    } catch {
      setError("Could not connect to the sign-in service. Check your connection and try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogleSignIn() {
    if (loading) return;
    setError(null);
    setLoading("google");
    try {
      const origin = window.location.origin;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}` },
      });
      if (oauthError) setError(oauthError.message);
    } catch {
      setError("Could not start Google sign-in. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return <AuthShell mode="signin">
    <form className={styles.form} onSubmit={handleSignIn} noValidate>
      <AuthError message={error} />
      <div className={styles.fields}>
        <AuthField id="email" label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => { setEmail(event.target.value); try { window.sessionStorage.setItem("seller-auth-email", event.target.value); } catch { /* Storage may be unavailable. */ } setFieldErrors((current) => ({ ...current, email: undefined })); }} error={fieldErrors.email} />
        <div>
          <PasswordField value={password} onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: undefined })); }} error={fieldErrors.password} autoComplete="current-password" placeholder="Enter your password" />
          <div className={styles.forgotRow}><Link href="/forgot-password" className={styles.forgot}>Forgot password?</Link></div>
        </div>
      </div>
      <PrimaryAction loading={loading === "email"} disabled={loading !== null} loadingLabel="Signing in…">Sign in to Seller Center</PrimaryAction>
    </form>
    <GoogleAction onClick={handleGoogleSignIn} loading={loading === "google"} disabled={loading !== null} />
    <p className={styles.switchPrompt}><span>New to U-Shop?</span><AuthSwitchLink href="/sign-up" direction="signup">Create a seller account</AuthSwitchLink></p>
    <p className={styles.footnote}>Secure account access · U-Shop Seller Center</p>
  </AuthShell>;
}

export default function SignInPage() {
  return <Suspense fallback={<AuthShell mode="signin"><p className={styles.status}>Loading sign-in…</p></AuthShell>}><SignInForm /></Suspense>;
}
