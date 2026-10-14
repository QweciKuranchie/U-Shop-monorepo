"use client";

import { useState, type ChangeEventHandler, type ReactNode } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { GoogleMark } from "./AuthShell";
import styles from "./auth.module.css";

export function AuthError({ message }: { message: string | null }) {
  return message ? <div className={styles.errorSummary} role="alert"><AlertCircle size={17} aria-hidden="true" /><span>{message}</span></div> : null;
}

export function AuthField({ id, label, type = "text", autoComplete, placeholder, value, onChange, error, hint, required = true }: {
  id: string; label: string; type?: string; autoComplete: string; placeholder: string; value: string;
  onChange: ChangeEventHandler<HTMLInputElement>; error?: string; hint?: string; required?: boolean;
}) {
  return <div className={styles.field}>
    <label className={styles.label} htmlFor={id}>{label}</label>
    <input className={styles.input} id={id} name={id} type={type} autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={onChange} required={required} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} />
    {error && <span className={styles.fieldError} id={`${id}-error`}>{error}</span>}
    {!error && hint && <span className={styles.fieldHint} id={`${id}-hint`}>{hint}</span>}
  </div>;
}

export function PasswordField({ id = "password", label = "Password", value, onChange, error, autoComplete, placeholder, hint }: {
  id?: string; label?: string; value: string; onChange: ChangeEventHandler<HTMLInputElement>; error?: string;
  autoComplete: string; placeholder: string; hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  return <div className={styles.field}>
    <label className={styles.label} htmlFor={id}>{label}</label>
    <div className={styles.inputWrap}>
      <input className={`${styles.input} ${styles.passwordInput}`} id={id} name={id} type={visible ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={onChange} required aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} />
      <button className={styles.showPassword} type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"} aria-controls={id}>{visible ? "Hide" : "Show"}</button>
    </div>
    {error && <span className={styles.fieldError} id={`${id}-error`}>{error}</span>}
    {!error && hint && <span className={styles.fieldHint} id={`${id}-hint`}>{hint}</span>}
  </div>;
}

export function PrimaryAction({ children, loading, disabled = loading, loadingLabel }: { children: ReactNode; loading: boolean; disabled?: boolean; loadingLabel: string }) {
  return <button type="submit" disabled={disabled} className={styles.primary} aria-busy={loading}>
    <span>{loading ? loadingLabel : children}</span>
    {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
  </button>;
}

export function GoogleAction({ onClick, loading, disabled = loading }: { onClick: () => void; loading: boolean; disabled?: boolean }) {
  return <>
    <div className={styles.divider} aria-hidden="true">or</div>
    <button type="button" className={styles.google} onClick={onClick} disabled={disabled} aria-busy={loading}>
      {loading ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <GoogleMark />}<span>{loading ? "Connecting to Google…" : "Continue with Google"}</span>
    </button>
  </>;
}
