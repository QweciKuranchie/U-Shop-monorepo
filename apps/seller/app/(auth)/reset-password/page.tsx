"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { createBrowserClient } from "@repo/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthError, PasswordField, PrimaryAction } from "@/components/auth/AuthControls";
import styles from "@/components/auth/auth.module.css";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setHasSession(!!session);
      setChecking(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasSession(!!data.session);
      setChecking(false);
    }).catch(() => { if (active) setChecking(false); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !hasSession) return;
    setError(null);
    if (password.length < 8) {
      setFieldError("Use at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setFieldError("Passwords do not match.");
      return;
    }
    setFieldError(undefined);
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      await supabase.auth.signOut();
      setComplete(true);
    } catch {
      setError("Could not update your password. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return <AuthShell mode="reset">
    {complete ? <div className={styles.status} role="status"><strong>Password updated</strong><p>Your password has been changed. Sign in with your new password to continue.</p><p><Link href="/sign-in">Sign in</Link></p></div>
      : checking ? <p className={styles.status} role="status">Checking your recovery link…</p>
        : !hasSession ? <div className={styles.status} role="alert"><strong>Recovery link unavailable</strong><p>This link may have expired or already been used.</p><p><Link href="/forgot-password">Request a new link</Link></p></div>
          : <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <AuthError message={error} />
            <div className={styles.fields}>
              <PasswordField id="password" label="New password" value={password} onChange={(event) => { setPassword(event.target.value); setFieldError(undefined); }} error={fieldError && password.length < 8 ? fieldError : undefined} autoComplete="new-password" placeholder="Minimum 8 characters" hint="Use at least 8 characters." />
              <PasswordField id="confirmPassword" label="Confirm new password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setFieldError(undefined); }} error={fieldError && password.length >= 8 ? fieldError : undefined} autoComplete="new-password" placeholder="Repeat your password" />
            </div>
            <PrimaryAction loading={loading} loadingLabel="Updating password…">Update password</PrimaryAction>
          </form>}
  </AuthShell>;
}
