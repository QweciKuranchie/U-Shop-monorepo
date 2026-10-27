"use client";

import { useLayoutEffect, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styles from "./auth.module.css";

type Mode = "signup" | "signin" | "recovery" | "reset";

const landingAsset = (name: string) => `/assets/landing/${name}`;

const content: Record<Mode, { kicker: string; title: string; subtitle: string; mobileTitle: string; mobileSubtitle: string }> = {
  signup: {
    kicker: "GET STARTED",
    title: "Create your seller account",
    subtitle: "A few details and you’re on your way to opening your tech store.",
    mobileTitle: "Start selling tech.",
    mobileSubtitle: "Build your store in a few simple steps.",
  },
  signin: {
    kicker: "WELCOME BACK",
    title: "Welcome back.",
    subtitle: "Your store is right where you left it. Sign in to continue.",
    mobileTitle: "Welcome back.",
    mobileSubtitle: "Sign in to manage your tech store.",
  },
  recovery: {
    kicker: "ACCOUNT RECOVERY",
    title: "Reset your password.",
    subtitle: "We’ll send a secure recovery link to your seller email.",
    mobileTitle: "Reset password.",
    mobileSubtitle: "Get a secure link by email.",
  },
  reset: {
    kicker: "ACCOUNT RECOVERY",
    title: "Choose a new password.",
    subtitle: "Use at least eight characters to secure your account.",
    mobileTitle: "New password.",
    mobileSubtitle: "Secure your seller account.",
  },
};

export function AuthSwitchLink({ href, direction, children, className = "" }: { href: string; direction: "signup" | "signin"; children: ReactNode; className?: string }) {
  const router = useRouter();

  return <Link
    href={href}
    className={className}
    onClick={(event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      event.preventDefault();
      if (document.documentElement.dataset.authExit) return;
      document.documentElement.dataset.authExit = direction;
      document.documentElement.dataset.authDirection = direction;
      window.setTimeout(() => router.push(href), 180);
    }}
  >{children}</Link>;
}

export function GoogleMark() {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>;
}

export function AuthShell({ mode, children }: { mode: Mode; children: ReactNode }) {
  const copy = content[mode];
  const isSignup = mode === "signup";

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.authDirection) return;
    delete root.dataset.authExit;
    const heading = Array.from(document.querySelectorAll<HTMLHeadingElement>("main h1")).find((element) => element.getClientRects().length > 0);
    heading?.focus({ preventScroll: true });
    const timer = window.setTimeout(() => { delete root.dataset.authDirection; }, 440);
    return () => window.clearTimeout(timer);
  }, [mode]);

  return <main className={`${styles.page} ${isSignup ? styles.signup : styles.signin}`}>
    <section className={styles.formSide} aria-label="Seller authentication">
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="U-Shop Seller Center home">
          <Image src={landingAsset("asset-ushop-official-logo-desktop-navigation.png")} alt="U-Shop" width={104} height={47} priority />
          <span>SELLER CENTER</span>
        </Link>
        <Link href="/" className={styles.back}><ArrowLeft size={14} aria-hidden="true" /><span className={styles.backDesktop}>Back to U-Shop</span><span className={styles.backMobile}>Back</span></Link>
      </header>
      <div className={styles.mobileIntro}>
        <p>{mode === "signup" ? "CREATE YOUR ACCOUNT" : copy.kicker}</p>
        <h1 tabIndex={-1}>{copy.mobileTitle}</h1>
        <span>{copy.mobileSubtitle}</span>
      </div>
      <div className={styles.formPanel}>
        <div className={styles.desktopIntro}><p>{copy.kicker}</p><h1 tabIndex={-1}>{copy.title}</h1><span>{copy.subtitle}</span></div>
        {children}
      </div>
    </section>
    <aside className={styles.editorial} aria-label="U-Shop technology products">
      <div className={styles.editorialInner}>
        <div className={styles.accent} aria-hidden="true" />
        <p className={styles.editorialEyebrow}>{isSignup ? "THE SELLER EDITION" : "THE SELLER WORKSPACE"}</p>
        <h2>{isSignup ? <>Every great shop<br />starts somewhere.</> : <>Your business,<br />back in motion.</>}</h2>
        <p className={styles.editorialCopy}>{isSignup ? "Put your tech products in front of the people looking for them, on your own U-Shop storefront." : "Sign in and pick up where you left off. Your storefront and selling tools are right here."}</p>
        <div className={styles.productGrid}>
          <div className={styles.productLead}><Image src={landingAsset(isSignup ? "photoreal-phone-lavender-tech-studio.png" : "photoreal-camera-pearl-silver.png")} alt={isSignup ? "Smartphone in a lavender studio" : "Camera in a lavender studio"} fill sizes="(max-width: 1200px) 28vw, 310px" priority /></div>
          <div><Image src={landingAsset(isSignup ? "photoreal-laptop-lavender-tech-studio.png" : "photoreal-wireless-earbuds-pearl-gold.png")} alt={isSignup ? "Laptop" : "Wireless earbuds"} fill sizes="(max-width: 1200px) 15vw, 196px" /></div>
          <div><Image src={landingAsset(isSignup ? "photoreal-wireless-earbuds-pearl-gold.png" : "photoreal-laptop-lavender-tech-studio.png")} alt={isSignup ? "Wireless earbuds" : "Laptop"} fill sizes="(max-width: 1200px) 15vw, 196px" /></div>
        </div>
        <p className={styles.editorialFoot}>{isSignup ? "YOUR PRODUCTS. YOUR STORE. YOUR NEXT MOVE." : "MADE FOR PEOPLE WHO SELL TECH."}</p>
      </div>
    </aside>
  </main>;
}
