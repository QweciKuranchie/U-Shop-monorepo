"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import styles from "./landing.module.css";

export default function MobileMenu({ startHref }: { startHref: string }) {
  const details = useRef<HTMLDetailsElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  function closeOnNavigate(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a") && details.current) {
      details.current.open = false;
    }
  }

  return <details ref={details} className={styles.mobileMenu} onToggle={(event) => setIsOpen(event.currentTarget.open)}>
    <summary aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}><Menu size={22} aria-hidden="true" /><X size={22} aria-hidden="true" /></summary>
    <nav aria-label="Mobile navigation" onClick={closeOnNavigate}>
      <a href="#why-ushop">Why U-Shop</a><a href="#how-it-works">How it works</a><a href="#what-to-sell">What to sell</a><a href="#faqs">FAQs</a><Link href="/sign-in">Sign in</Link><Link href={startHref}>Start selling</Link>
    </nav>
  </details>;
}
