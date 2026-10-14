"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@repo/supabase/client";
import type { SellerType } from "@repo/supabase/types";
import { AuthShell, AuthSwitchLink } from "@/components/auth/AuthShell";
import { AuthError, AuthField, GoogleAction, PasswordField, PrimaryAction } from "@/components/auth/AuthControls";
import styles from "@/components/auth/auth.module.css";

const sellerChoices: { type: SellerType; number: string; title: string; detail: string }[] = [
  { type: "personal", number: "01", title: "Personal", detail: "Sell independently" },
  { type: "business", number: "02", title: "Business", detail: "Registered company" },
  { type: "student", number: "03", title: "Student", detail: "Campus seller" },
];

type SignUpErrors = Partial<Record<"firstName" | "lastName" | "email" | "phone" | "password", string>>;

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedType = searchParams.get("type");
  const supabase = useMemo(() => createBrowserClient(), []);
  const [sellerType, setSellerType] = useState<SellerType>(requestedType === "business" || requestedType === "student" ? requestedType : "personal");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SignUpErrors>({});
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    try {
      const draft = JSON.parse(window.sessionStorage.getItem("seller-signup-draft") || "null") as { firstName?: string; lastName?: string; email?: string; phone?: string; sellerType?: SellerType } | null;
      if (draft) {
        setFirstName(draft.firstName || "");
        setLastName(draft.lastName || "");
        setEmail(draft.email || window.sessionStorage.getItem("seller-auth-email") || "");
        setPhone(draft.phone || "");
      } else {
        setEmail(window.sessionStorage.getItem("seller-auth-email") || "");
      }
      const savedType = draft?.sellerType === "business" || draft?.sellerType === "student" ? draft.sellerType : "personal";
      setSellerType(requestedType === "business" || requestedType === "student" ? requestedType : savedType);
    } catch {
      setSellerType(requestedType === "business" || requestedType === "student" ? requestedType : "personal");
    }
    setDraftReady(true);
  }, [requestedType]);

  useEffect(() => {
    if (!draftReady) return;
    try {
      window.sessionStorage.setItem("seller-signup-draft", JSON.stringify({ firstName, lastName, email, phone, sellerType }));
    } catch {
      // Private browsing can deny session storage; the form still works.
    }
  }, [draftReady, firstName, lastName, email, phone, sellerType]);

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    const errors: SignUpErrors = {};
    if (!firstName.trim()) errors.firstName = "Enter your first name.";
    if (!lastName.trim()) errors.lastName = "Enter your last name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter a valid email address.";
    if (phone.replace(/\D/g, "").length < 9) errors.phone = "Enter a valid contact number.";
    if (password.length < 8) errors.password = "Use at least 8 characters.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading("email");
    try {
      const origin = window.location.origin;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/confirm?next=/create-store`,
          data: { first_name: firstName.trim(), last_name: lastName.trim(), phone: phone.trim(), seller_type: sellerType },
        },
      });
      if (signUpError) {
        const duplicate = /already|registered|exists/i.test(signUpError.message);
        setError(duplicate ? "This email may already have an account. Try signing in or resetting your password." : signUpError.message);
        return;
      }
      if (data.user && !data.session) {
        setDraftReady(false);
        try { window.sessionStorage.removeItem("seller-signup-draft"); } catch { /* Storage may be unavailable. */ }
        try { window.sessionStorage.removeItem("seller-auth-email"); } catch { /* Storage may be unavailable. */ }
        setConfirmationSent(true);
        return;
      }
      if (data.session) {
        setDraftReady(false);
        try { window.sessionStorage.removeItem("seller-signup-draft"); } catch { /* Storage may be unavailable. */ }
        try { window.sessionStorage.removeItem("seller-auth-email"); } catch { /* Storage may be unavailable. */ }
        router.push("/create-store");
        router.refresh();
        return;
      }
      setError("We could not complete registration. Please try again.");
    } catch {
      setError("Could not connect to the registration service. Check your connection and try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogleSignUp() {
    if (loading) return;
    setError(null);
    setLoading("google");
    try {
      const origin = window.location.origin;
      const next = `/create-store?type=${sellerType}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (oauthError) setError(oauthError.message);
    } catch {
      setError("Could not start Google registration. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  if (confirmationSent) {
    return <AuthShell mode="signup">
      <div className={styles.status} role="status"><strong>Check your email</strong><p>We sent a verification link to {email}. Open it to confirm your account, then continue setting up your store.</p><p><Link href="/sign-in">Already confirmed? Sign in</Link></p></div>
    </AuthShell>;
  }

  return <AuthShell mode="signup">
    <form className={styles.form} onSubmit={handleSignUp} noValidate>
      <AuthError message={error} />
      <div className={styles.choiceLabel} id="seller-type-label">I’m signing up as</div>
      <div className={styles.choiceGrid} role="group" aria-labelledby="seller-type-label">
        {sellerChoices.map((choice) => <button key={choice.type} className={styles.choice} type="button" aria-pressed={sellerType === choice.type} onClick={() => setSellerType(choice.type)}>
          <span className={styles.choiceNumber}>{choice.number}</span><strong>{choice.title}</strong><small>{choice.detail}</small>
        </button>)}
      </div>
      <div className={styles.fields}>
        <div className={styles.nameGrid}>
          <AuthField id="firstName" label="First name" autoComplete="given-name" placeholder="Kofi" value={firstName} onChange={(event) => { setFirstName(event.target.value); setFieldErrors((current) => ({ ...current, firstName: undefined })); }} error={fieldErrors.firstName} />
          <AuthField id="lastName" label="Last name" autoComplete="family-name" placeholder="Mensah" value={lastName} onChange={(event) => { setLastName(event.target.value); setFieldErrors((current) => ({ ...current, lastName: undefined })); }} error={fieldErrors.lastName} />
        </div>
        <AuthField id="email" label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => { setEmail(event.target.value); try { window.sessionStorage.setItem("seller-auth-email", event.target.value); } catch { /* Storage may be unavailable. */ } setFieldErrors((current) => ({ ...current, email: undefined })); }} error={fieldErrors.email} />
        <AuthField id="phone" label="WhatsApp number" type="tel" autoComplete="tel" placeholder="+233 24 000 0000" value={phone} onChange={(event) => { setPhone(event.target.value); setFieldErrors((current) => ({ ...current, phone: undefined })); }} error={fieldErrors.phone} />
        <PasswordField label="Password" value={password} onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: undefined })); }} error={fieldErrors.password} autoComplete="new-password" placeholder="Minimum 8 characters" hint="Use at least 8 characters to protect your account." />
      </div>
      <PrimaryAction loading={loading === "email"} disabled={loading !== null} loadingLabel="Creating account…">Create seller account</PrimaryAction>
    </form>
    <GoogleAction onClick={handleGoogleSignUp} loading={loading === "google"} disabled={loading !== null} />
    <p className={styles.switchPrompt}><span>Already have a seller account?</span><AuthSwitchLink href="/sign-in" direction="signin">Sign in</AuthSwitchLink></p>
    <p className={styles.legal}>By continuing, you agree to U-Shop’s seller terms.</p>
  </AuthShell>;
}

export default function SignUpPage() {
  return <Suspense fallback={<AuthShell mode="signup"><p className={styles.status}>Loading registration…</p></AuthShell>}><SignUpForm /></Suspense>;
}
