"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type TouchEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronRight, ClipboardList, Package, Pause, Play, Star, TrendingUp } from "lucide-react";
import styles from "./landing.module.css";

const asset = (name: string) => `/assets/landing/${name}`;

type Slide = {
  label: string;
  eyebrow: string;
  lead: string;
  middle: string;
  accent: string;
  mobileLead: string;
  mobileMiddle: string;
  mobileAccent: string;
  description: string;
  action: string;
  type?: "student" | "business";
};

const slides: Slide[] = [
  {
    label: "Your tech store starts here",
    eyebrow: "YOUR ONLINE STORE STARTS HERE",
    lead: "Your next tech idea",
    middle: "deserves a",
    accent: "storefront.",
    mobileLead: "Your tech store",
    mobileMiddle: "starts with",
    mobileAccent: "one idea.",
    description: "Launch your tech store, showcase your devices, and manage customer orders all in one place.",
    action: "Create your seller account",
  },
  {
    label: "Student sellers",
    eyebrow: "FOR STUDENT SELLERS",
    lead: "Your campus tech idea",
    middle: "deserves its own",
    accent: "storefront.",
    mobileLead: "Campus ideas",
    mobileMiddle: "can become",
    mobileAccent: "your store.",
    description: "Bring the electronics and accessories you sell into a storefront built for your next step.",
    action: "Register as a student seller",
    type: "student",
  },
  {
    label: "Business stores",
    eyebrow: "FOR ELECTRONICS BUSINESSES",
    lead: "Give your electronics",
    middle: "business a",
    accent: "bigger stage.",
    mobileLead: "Your electronics",
    mobileMiddle: "business,",
    mobileAccent: "on U-Shop.",
    description: "Showcase your devices and keep your product listings and customer orders together.",
    action: "Register your business",
    type: "business",
  },
  {
    label: "Seller Center workspace",
    eyebrow: "YOUR SELLER WORKSPACE",
    lead: "Your store.",
    middle: "One clear",
    accent: "workspace.",
    mobileLead: "Your store.",
    mobileMiddle: "One clear",
    mobileAccent: "workspace.",
    description: "See how listings, customer orders, reviews and sales activity fit into Seller Center.",
    action: "Explore Seller Center",
  },
];

const previewTabs = [
  { label: "Listings", icon: Package, title: "Keep your products current", copy: "Add and update your tech products." },
  { label: "Orders", icon: ClipboardList, title: "Follow each customer order", copy: "Review order details and fulfillment progress." },
  { label: "Reviews", icon: Star, title: "Hear from shoppers", copy: "Read and respond to product reviews." },
  { label: "Activity", icon: TrendingUp, title: "See your sales activity", copy: "Use your dashboard to follow store activity." },
];

function FirstSlideArtwork() {
  return <>
    <Image className={styles.heroOrbit} src={asset("soft-lavender-orbital-background.svg")} alt="" width={490} height={490} />
    <Image className={styles.heroHalo} src={asset("inner-blue-white-halo.svg")} alt="" width={335} height={335} />
    <div className={styles.heroPhone}>
      <div className={styles.phoneTop}><span>u<span>shop</span></span><span aria-hidden="true">⌕</span></div>
      <div className={styles.phoneScreen}>
        <Image src={asset("tech-product-photo-lavender-studio-headphones.png")} alt="Lavender over-ear headphones" fill sizes="270px" priority />
      </div>
      <div className={styles.phoneInfo}><small>FEATURED TECH</small><strong>Sound that moves you.</strong><span>Explore headphones & audio</span></div>
    </div>
    <div className={`${styles.floatingProduct} ${styles.floatLaptop}`}><Image src={asset("tech-product-photo-laptops-pcs.png")} alt="" width={70} height={70} /><span>Laptops & PCs</span></div>
    <div className={`${styles.floatingProduct} ${styles.floatWatch}`}><Image src={asset("tech-product-photo-smartwatches.png")} alt="" width={70} height={70} /><span>Smartwatches</span></div>
    <div className={`${styles.floatingProduct} ${styles.floatGaming}`}><Image src={asset("tech-product-photo-gaming.png")} alt="" width={70} height={70} /><span>Gaming</span></div>
    <div className={styles.heroTrust}><span className={styles.checkCircle}><Check size={14} /></span><span><strong>Built around seller trust</strong><small>Store review before activation</small></span></div>
    <Image className={styles.heroResponsiveImage} src={asset("photoreal-phone-lavender-tech-studio.png")} alt="Smartphone in a lavender technology studio" width={450} height={450} priority />
  </>;
}

function ProductArtwork({ kind }: { kind: "student" | "business" }) {
  const student = kind === "student";
  return <div className={styles.heroProductStage}>
    <div className={styles.heroProductAura} aria-hidden="true" />
    <Image
      className={styles.heroProductMain}
      src={asset(student ? "real-product-photo08-controller.png" : "photoreal-laptop-lavender-tech-studio.png")}
      alt={student ? "Lavender gaming controller" : "Lavender studio laptop"}
      width={student ? 380 : 450}
      height={student ? 380 : 450}
      priority
      sizes="(max-width: 600px) 320px, (max-width: 1100px) 390px, 520px"
    />
    <div className={`${styles.heroProductSatellite} ${styles.productSatelliteOne}`}>
      <Image src={asset(student ? "photoreal-wireless-earbuds-pearl-gold.png" : "photoreal-camera-pearl-silver.png")} alt={student ? "Wireless earbuds" : "Creator camera"} width={450} height={450} sizes="(max-width: 600px) 90px, 130px" />
    </div>
    <div className={`${styles.heroProductSatellite} ${styles.productSatelliteTwo}`}>
      <Image src={asset(student ? "tech-product-photo-lavender-studio-headphones.png" : "photoreal-phone-lavender-tech-studio.png")} alt={student ? "Lavender headphones" : "Smartphone"} width={student ? 380 : 450} height={student ? 380 : 450} sizes="(max-width: 600px) 80px, 120px" />
    </div>
    <div className={styles.heroProductCaption}>{student ? "Student sellers" : "Business stores"} <ChevronRight size={15} aria-hidden="true" /></div>
  </div>;
}

function DashboardArtwork() {
  const [selectedTab, setSelectedTab] = useState(0);
  const tab = previewTabs[selectedTab];
  const Icon = tab.icon;

  return <div className={styles.heroDashboardStage}>
    <div className={styles.heroDashboardPanel}>
      <div className={styles.heroDashboardTop}><span><strong>U</strong>shop <small>Seller Center</small></span><span>ILLUSTRATIVE PREVIEW</span></div>
      <div className={styles.heroDashboardBody}>
        <div className={styles.heroDashboardNav} role="tablist" aria-label="Seller Center preview features">
          {previewTabs.map((item, index) => {
            const TabIcon = item.icon;
            return <button
              key={item.label}
              type="button"
              role="tab"
              id={`seller-preview-tab-${index}`}
              aria-controls="seller-preview-panel"
              aria-selected={selectedTab === index}
              tabIndex={selectedTab === index ? 0 : -1}
              onClick={() => setSelectedTab(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  const direction = event.key === "ArrowRight" ? 1 : -1;
                  const next = (index + direction + previewTabs.length) % previewTabs.length;
                  setSelectedTab(next);
                  document.getElementById(`seller-preview-tab-${next}`)?.focus();
                }
              }}
            ><TabIcon size={18} aria-hidden="true" /><span>{item.label}</span></button>;
          })}
        </div>
        <div className={styles.heroDashboardDetail} role="tabpanel" id="seller-preview-panel" aria-labelledby={`seller-preview-tab-${selectedTab}`}>
          <span className={styles.heroDashboardIcon}><Icon size={26} aria-hidden="true" /></span>
          <small>SELLER CENTER</small>
          <strong>{tab.title}</strong>
          <p>{tab.copy}</p>
          <div className={styles.heroDashboardMiniProducts}>
            <Image src={asset("tech-product-photo-lavender-studio-headphones.png")} alt="" width={75} height={75} />
            <Image src={asset("tech-product-photo-laptops-pcs.png")} alt="" width={75} height={75} />
            <Image src={asset("tech-product-photo-phones-gadgets.png")} alt="" width={75} height={75} />
          </div>
        </div>
      </div>
      <div className={styles.heroDashboardFoot}>A preview of tools for approved sellers. No live store data.</div>
    </div>
  </div>;
}

export default function SellerHeroCarousel({ startHref, dashboardHref }: { startHref: string; dashboardHref: string }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [manualChange, setManualChange] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const touchStart = useRef<number | null>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const slide = slides[active];
  const isSignedIn = startHref !== "/sign-up";
  const actionHref = active === 3
    ? dashboardHref
    : slide.type && !isSignedIn
      ? `/sign-up?type=${slide.type}`
      : startHref;

  useEffect(() => {
    const section = sectionRef.current;
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 })
      : null;
    if (section && observer) observer.observe(section);
    if (!observer) setInView(true);

    const onVisibilityChange = () => setPageVisible(!document.hidden);
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setPlaying(false);
    };
    onMotionChange();
    preference.addEventListener("change", onMotionChange);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      preference.removeEventListener("change", onMotionChange);
    };
  }, []);

  useEffect(() => {
    if (!playing || !inView || !pageVisible || reducedMotion || hovered || focused) return;
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearTimeout(timer);
  }, [active, playing, inView, pageVisible, reducedMotion, hovered, focused, manualChange]);

  function goTo(index: number) {
    const next = (index + slides.length) % slides.length;
    setActive(next);
    setManualChange((current) => current + 1);
    setAnnouncement(`Slide ${next + 1} of ${slides.length}: ${slides[next].label}`);
    if (artRef.current) {
      artRef.current.style.setProperty("--tilt-x", "0deg");
      artRef.current.style.setProperty("--tilt-y", "0deg");
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      if ((event.target as HTMLElement).getAttribute("role") === "tab") return;
      event.preventDefault();
      goTo(active + (event.key === "ArrowRight" ? 1 : -1));
    }
  }

  function onTouchStart(event: TouchEvent<HTMLElement>) {
    touchStart.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStart.current === null) return;
    const distance = touchStart.current - (event.changedTouches[0]?.clientX ?? touchStart.current);
    touchStart.current = null;
    if (Math.abs(distance) > 48) goTo(active + (distance > 0 ? 1 : -1));
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    artRef.current?.style.setProperty("--tilt-x", `${(-vertical * 3).toFixed(2)}deg`);
    artRef.current?.style.setProperty("--tilt-y", `${(horizontal * 3).toFixed(2)}deg`);
  }

  function onPointerLeave() {
    artRef.current?.style.setProperty("--tilt-x", "0deg");
    artRef.current?.style.setProperty("--tilt-y", "0deg");
  }

  return <section
    ref={sectionRef}
    className={styles.hero}
    aria-label="Seller highlights"
    aria-roledescription="carousel"
    tabIndex={0}
    onKeyDown={onKeyDown}
    onTouchStart={onTouchStart}
    onTouchEnd={onTouchEnd}
    onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
    onPointerLeave={(event) => { if (event.pointerType === "mouse") setHovered(false); }}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
  >
    <div className={styles.heroInner} key={active}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>{slide.eyebrow}</span>
        {active === 0
          ? <h1 id="hero-title"><span className={styles.desktopHeadline}>Your next tech idea<br />deserves a<br /><em>storefront.</em></span><span className={styles.tablet1024Headline}>Your next tech idea<br />deserves a <em>storefront.</em></span><span className={styles.tablet768Headline}>A storefront for<br /><em>your next tech idea.</em></span><span className={styles.mobileHeadline}>Your tech store<br />starts with<br /><em>one idea.</em></span></h1>
          : <h1 className={styles.heroSlideHeading}><span className={styles.slideDesktopHeadline}>{slide.lead}<br />{slide.middle}<br /><em>{slide.accent}</em></span><span className={styles.slideMobileHeadline}>{slide.mobileLead}<br />{slide.mobileMiddle}<br /><em>{slide.mobileAccent}</em></span></h1>}
        <p>{slide.description}</p>
        <div className={styles.heroButtons}>
          <Link href={actionHref} className={styles.action}><span>{slide.action}</span><ArrowRight size={18} aria-hidden="true" /></Link>
          <Link href="#how-it-works" className={`${styles.action} ${styles.actionLight}`}>
            <span>Explore how it works</span><ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <span className={styles.heroNote}><Check size={15} aria-hidden="true" /> Personal, business and student sellers welcome</span>
      </div>
      <div
        ref={artRef}
        className={`${styles.heroArt} ${active === 0 ? "" : styles.heroArtAlternate}`}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {active === 0 ? <FirstSlideArtwork /> : active === 3 ? <DashboardArtwork /> : <ProductArtwork kind={active === 1 ? "student" : "business"} />}
      </div>
    </div>
    <div className={styles.carouselControls} aria-label="Hero slides">
      <button type="button" className={styles.carouselArrow} onClick={() => goTo(active - 1)} aria-label="Previous slide"><ArrowLeft size={16} aria-hidden="true" /></button>
      <div className={styles.carouselDots}>
        {slides.map((item, index) => <button
          key={item.label}
          type="button"
          className={index === active ? styles.carouselDotActive : styles.carouselDot}
          onClick={() => goTo(index)}
          aria-label={`Show slide ${index + 1}: ${item.label}`}
          aria-current={index === active ? "true" : undefined}
        />)}
      </div>
      <button type="button" className={styles.carouselArrow} onClick={() => goTo(active + 1)} aria-label="Next slide"><ArrowRight size={16} aria-hidden="true" /></button>
      <button
        type="button"
        className={styles.carouselArrow}
        onClick={() => setPlaying((current) => !current)}
        disabled={reducedMotion}
        aria-label={reducedMotion ? "Automatic slides disabled by reduced motion preference" : playing ? "Pause automatic slides" : "Play automatic slides"}
        aria-pressed={playing && !reducedMotion}
      >{playing && !reducedMotion ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}</button>
    </div>
    <span className={styles.visuallyHidden} role="status" aria-live="polite">{announcement}</span>
  </section>;
}
