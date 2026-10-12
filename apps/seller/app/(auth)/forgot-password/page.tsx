"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createBrowserClient } from "@repo/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthError, AuthField, PrimaryAction } from "@/components/auth/AuthControls";
import styles from "@/components/auth/auth.module.css";

export default function ForgotPasswordPage() {
  const supabase = createBrowserClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setFieldError("Enter a valid email address.");
      return;
    }
    setFieldError(undefined);
    setLoading(true);
    try {
      const origin = window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/confirm?next=/reset-password`,
      });
      if (resetError) setError(resetError.message);
      else setSent(true);
    } catch {
      setError("Could not request a recovery link. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return <AuthShell mode="recovery">
    {sent ? <div className={styles.status} role="status"><strong>Check your inbox</strong><p>If an account exists for {email}, we’ve sent a secure password-reset link.</p><p><Link href="/sign-in">Return to sign in</Link></p></div> : <>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <AuthError message={error} />
        <AuthField id="email" label="Seller email address" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => { setEmail(event.target.value); setFieldError(undefined); }} error={fieldError} />
        <PrimaryAction loading={loading} loadingLabel="Sending link…">Send recovery link</PrimaryAction>
      </form>
      <p className={styles.switchPrompt}><Link href="/sign-in">Return to sign in</Link></p>
    </>}
  </AuthShell>;
}
