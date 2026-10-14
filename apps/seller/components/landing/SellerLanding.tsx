import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import MobileMenu from "./MobileMenu";
import LandingMotion from "./LandingMotion";
import SellerHeroCarousel from "./SellerHeroCarousel";
import styles from "./landing.module.css";

const asset = (name: string) => `/assets/landing/${name}`;

const categories = [
  { title: "Headphones & audio", short: "Headphones", image: "tech-product-photo-lavender-studio-headphones.png" },
  { title: "Smartphones & gadgets", short: "Smartphones", image: "tech-product-photo-phones-gadgets.png" },
  { title: "Laptops & computers", short: "Laptops", image: "tech-product-photo-laptops-pcs.png" },
  { title: "Gaming & consoles", short: "Game consoles", image: "tech-product-photo-gaming.png" },
  { title: "Smartwatches", short: "Smartwatches", image: "tech-product-photo-smartwatches.png" },
  { title: "Wireless earbuds", short: "Wireless earbuds", image: "photoreal-wireless-earbuds-pearl-gold.png" },
  { title: "Smart speakers", short: "Smart speakers", image: "photoreal-speaker-pearl-silver.png" },
  { title: "Cameras & creator tech", short: "Cameras", image: "photoreal-camera-pearl-silver.png" },
  { title: "Mobile tech gadgets", short: "Mobile gadgets", image: "photoreal-phone-lavender-tech-studio.png" },
  { title: "Work & productivity", short: "Work essentials", image: "photoreal-laptop-lavender-tech-studio.png" },
];

const benefits = [
  { icon: "group2.svg", title: "Your own storefront", copy: "Make your products easy to discover" },
  { icon: "group3.svg", title: "Seller verification", copy: "Review before your store goes live" },
  { icon: "group4.svg", title: "One place for orders", copy: "See and manage customer orders" },
  { icon: "group5.svg", title: "Made for Ghana", copy: "Local-friendly shopping experience" },
];

const tools = [
  { icon: "group6.svg", text: "List and update your products" },
  { icon: "group7.svg", text: "Stay on top of customer orders" },
  { icon: "group8.svg", text: "Follow your sales activity" },
  { icon: "group9.svg", text: "See feedback from shoppers" },
];

const sellers = [
  { type: "student", icon: "group10.svg", title: "Student sellers", copy: "Turn your campus tech ideas into a storefront.", image: "real-product-photo08-controller.png" },
  { type: "personal", icon: "group11.svg", title: "Personal sellers", copy: "Sell electronics and accessories in one place.", image: "tech-photo-personal-seller-audio.png" },
  { type: "business", icon: "group12.svg", title: "Business stores", copy: "Showcase your electronics business and products.", image: "real-product-photo07-laptop.png" },
];

const steps = [
  { number: "01", icon: "group13.svg", title: "Create your account", copy: "Choose your seller type and add your details." },
  { number: "02", icon: "group14.svg", title: "Set up & verify", copy: "Submit your store information for review." },
  { number: "03", icon: "group15.svg", title: "Start selling", copy: "Once approved, add products and manage orders." },
];

const faqs = [
  { question: "Who can register as a seller?", answer: "Individuals, businesses, and eligible students can apply." },
  { question: "How does verification work?", answer: "Provide your store details and required documents for review." },
  { question: "When can my products go live?", answer: "Your store must be reviewed and approved first." },
  { question: "How do seller payments work?", answer: "The team will explain the current settlement process during onboarding." },
];

function Brand({ footer = false }: { footer?: boolean }) {
  return <Link href="/" className={`${styles.brand} ${footer ? styles.footerBrand : ""}`} aria-label="U-Shop Seller Center home">
    <Image src={asset("asset-ushop-official-logo-desktop-navigation.png")} alt="U-Shop" width={150} height={68} priority={!footer} />
    <span className={styles.brandDesktopLabel}>SELLER CENTER</span><span className={styles.brandMobileLabel}>SELLER</span>
  </Link>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className={styles.eyebrow}>{children}</span>;
}

function Action({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return <Link href={href} className={`${styles.action} ${light ? styles.actionLight : ""}`}>
    <span>{children}</span><ArrowRight size={18} aria-hidden="true" />
  </Link>;
}

function Header({ startHref }: { startHref: string }) {
  return (
    <div className={styles.headerWrapper}>
      <div className={styles.announcement}>Your tech store starts here. <a href="#how-it-works">See how it works <ArrowRight size={12} aria-hidden="true" /></a></div>
      <header className={styles.header}><div className={styles.headerInner}>
        <Brand />
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <a href="#why-ushop">Why U-Shop</a><a href="#how-it-works">How it works</a><a href="#what-to-sell">What to sell</a><a href="#faqs">FAQs</a>
        </nav>
        <div className={styles.headerActions}><Link href="/sign-in" className={styles.signIn}>Sign in</Link><Action href={startHref}>Start selling</Action></div>
        <MobileMenu startHref={startHref} />
      </div></header>
    </div>
  );
}

function Benefits() {
  return <section id="why-ushop" className={styles.benefits} aria-label="Why sell on U-Shop"><div className={styles.benefitGrid}>
    {benefits.map((item) => <div className={styles.benefit} key={item.title}><Image src={asset(item.icon)} alt="" width={42} height={42} /><span><strong>{item.title}</strong><small>{item.copy}</small></span></div>)}
  </div></section>;
}

function Categories({ startHref }: { startHref: string }) {
  return <section id="what-to-sell" className={`${styles.section} ${styles.categories}`} aria-labelledby="categories-title">
    <Eyebrow>WHAT COULD YOU SELL?</Eyebrow><h2 id="categories-title"><span className={styles.desktopTitle}>Big ideas start with great technology.</span><span className={styles.mobileTitle}>Sell the tech<br />people love.</span></h2>
    <p className={styles.sectionIntro}><span className={styles.desktopTitle}>Explore tech-only categories—devices, audio, gaming and gadgets. Images are illustrative, not live listings.</span><span className={styles.mobileTitle}>Illustrative examples of electronics you can sell.</span></p>
    <div className={styles.categoryGrid}>{categories.map((item) => <article className={styles.categoryCard} key={item.title}><Link href={startHref} className={styles.categoryLink} aria-label={`Start selling ${item.short.toLowerCase()} on U-Shop`}><div className={styles.categoryImage}><Image src={asset(item.image)} alt={item.title} fill sizes="(max-width: 600px) 45vw, (max-width: 1023px) 30vw, (max-width: 1199px) 22vw, 230px" /></div><h3><span className={styles.desktopTitle}>{item.title}</span><span className={styles.mobileTitle}>{item.short}</span></h3><span className={styles.example}>Start selling <ArrowRight size={14} aria-hidden="true" /></span></Link></article>)}</div>
  </section>;
}

function DashboardPreview() {
  return <div className={styles.dashboardFrame}>
    <div className={styles.dashboardDesktop} aria-label="Illustrative seller dashboard preview">
      <aside><Brand /><div className={styles.dashSelected}>▦ &nbsp; Overview</div><div>▤ &nbsp; Products</div><div>▧ &nbsp; Orders</div><div>☆ &nbsp; Reviews</div></aside>
      <div className={styles.dashMain}><div className={styles.dashTop}>Seller Center <span>My store &nbsp; ◯</span></div><h3>Store overview</h3><p>Everything in one place for your tech store.</p><div className={styles.dashStats}><div><small>PRODUCTS</small><strong>Manage</strong><span>Product listings</span></div><div><small>ORDERS</small><strong>Track</strong><span>Customer orders</span></div><div><small>REVIEWS</small><strong>Respond</strong><span>Buyer reviews</span></div></div><h4>Your product categories</h4><div className={styles.dashProducts}>{categories.slice(0, 4).map((item) => <div key={item.title}><Image src={asset(item.image)} alt="" fill sizes="110px" /><span>{item.short}</span></div>)}</div><small className={styles.dashDisclaimer}>Illustrative dashboard · No live seller data</small></div>
    </div>
    <Image className={styles.mobileDashboardImage} src={asset("mobile-dashboard.png")} alt="Illustrative mobile Seller Center dashboard" width={520} height={390} />
  </div>;
}

function Workspace({ titleId, dashboardHref }: { titleId: string; dashboardHref: string }) {
  return <section className={styles.workspace} aria-labelledby={titleId}><div className={styles.workspaceInner}>
    <DashboardPreview />
    <div className={styles.workspaceCopy}><Eyebrow>YOUR SELLER WORKSPACE</Eyebrow><h2 id={titleId}><span className={styles.desktopTitle}>Less admin.<br />More selling.</span><span className={styles.mobileTitle}>More selling.<br />Less busywork.</span></h2><p>Keep your tech store moving with a workspace designed to help you manage the everyday.</p><div className={styles.toolList}>{tools.map((item) => <div key={item.text}><Image src={asset(item.icon)} alt="" width={34} height={34} /><span>{item.text}</span></div>)}</div><Link className={styles.workspaceLink} href={dashboardHref}>Explore Seller Center <ArrowRight size={16} aria-hidden="true" /></Link></div>
  </div></section>;
}

function SellerTypes({ startHref }: { startHref: string }) {
  return <section className={`${styles.section} ${styles.sellers}`} aria-labelledby="sellers-title"><Eyebrow>SELL YOUR WAY</Eyebrow><h2 id="sellers-title">Made for the way you sell tech.</h2><p className={styles.sectionIntro}>A place for different tech sellers to build a storefront of their own.</p><div className={styles.sellerGrid}>{sellers.map((item) => <article className={styles.sellerCard} key={item.title}><Link className={styles.sellerLink} href={startHref === "/sign-up" ? `/sign-up?type=${item.type}` : startHref} aria-label={`Start as a ${item.type} seller`}><div className={styles.sellerImage}><Image src={asset(item.image)} alt="" fill sizes="(max-width: 767px) 45vw, 400px" /></div><div className={styles.sellerText}><Image src={asset(item.icon)} alt="" width={38} height={38} /><h3>{item.title}</h3><p>{item.copy}</p><span className={styles.sellerLinkCue}>Get started <ArrowRight size={14} aria-hidden="true" /></span></div></Link></article>)}</div></section>;
}

function Steps({ startHref, dashboardHref }: { startHref: string; dashboardHref: string }) {
  const stepHrefs = [startHref, startHref === "/sign-up" ? "/sign-up" : "/create-store", dashboardHref];
  return <section id="how-it-works" className={`${styles.section} ${styles.steps}`} aria-labelledby="steps-title"><Eyebrow>THREE SIMPLE STEPS</Eyebrow><h2 id="steps-title"><span className={styles.desktopTitle}>From sign-up to your first listing.</span><span className={styles.mobileTitle}>Three clear steps.</span></h2><p className={styles.sectionIntro}>A straightforward path from creating an account to opening your tech store.</p><div className={styles.stepsGrid}>{steps.map((step, index) => <Link href={stepHrefs[index]} className={styles.stepCard} key={step.number}><div className={styles.stepTop}><span>{step.number}</span><Image src={asset(step.icon)} alt="" width={48} height={48} /></div><h3>{step.title}</h3><p>{step.copy}</p></Link>)}</div></section>;
}

function Trust() {
  return <section className={styles.trust} aria-labelledby="trust-title"><div className={styles.trustInner}><div className={styles.trustArt}><Image className={styles.trustOrbit} src={asset("trust-graphic-soft-orbit.svg")} alt="" width={420} height={378} /><div className={styles.verificationCard}><span className={styles.checkCircle}><Check size={22} /></span><strong>Seller verification</strong><small>Store review before activation</small></div><div className={styles.trustProduct}><Image src={asset("tech-product-photo-lavender-studio-headphones.png")} alt="Lavender headphones" width={140} height={140} /><span>Tech products</span></div><div className={styles.orderCard}>◉ &nbsp; Order status <strong>Easy to follow</strong></div><Image className={styles.mobileTrustImage} src={asset("mobile-trust.png")} alt="Seller verification and technology product illustration" width={520} height={520} /></div><div className={styles.trustCopy}><Eyebrow>CONFIDENCE COMES FROM CLARITY</Eyebrow><h2 id="trust-title"><span className={styles.desktopTitle}>Trust grows<br />when things are clear.</span><span className={styles.mobileTitle}>Trust feels better<br />when it is simple.</span></h2><p>Seller checks, clear expectations, and visible order information help everyone shop with confidence.</p><ul><li><Check size={17} />Verification before activation</li><li><Check size={17} />Order progress stays easy to follow</li><li><Check size={17} />A home for different seller types</li></ul></div></div></section>;
}

function FAQs() {
  return <section id="faqs" className={`${styles.section} ${styles.faqs}`} aria-labelledby="faqs-title"><Eyebrow>FREQUENTLY ASKED</Eyebrow><h2 id="faqs-title"><span className={styles.desktopTitle}>Everything you want to know.</span><span className={styles.mobileTitle}>Good to know.</span></h2><div className={styles.faqList}>{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<ChevronDown size={20} aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div></section>;
}

function FinalCTA({ startHref }: { startHref: string }) {
  return <section className={styles.finalCta} aria-labelledby="final-title"><div><h2 id="final-title"><span className={styles.desktopTitle}>Your shop could be next.</span><span className={styles.mobileTitle}>Ready for your<br />next big thing?</span></h2><p><span className={styles.desktopTitle}>Bring your tech products to U-Shop and start building your store.</span><span className={styles.mobileTitle}>Bring your products to U-Shop.</span></p><Action href={startHref}>Start selling on U-Shop</Action></div><div className={styles.finalArt}><Image src={asset("photoreal-premium-tech-delivery-packaging.png")} alt="U-Shop technology delivery package" width={450} height={450} /></div></section>;
}

function Footer({ startHref }: { startHref: string }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div><Brand footer /><span>Seller Center · Ghana</span></div>
          <nav aria-label="Footer navigation">
            <a href="#why-ushop">Why U-Shop</a><a href="#how-it-works">How it works</a><a href="#what-to-sell">What to sell</a><a href="#faqs">FAQs</a><Link href="/sign-in">Sign in</Link><Link href={startHref}>Start selling</Link>
          </nav>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} U-Shop. All rights reserved.</span>
          <span>Technology marketplace · Seller Center</span>
        </div>
      </div>
    </footer>
  );
}

export default function SellerLanding({ startHref, dashboardHref }: { startHref: string; dashboardHref: string }) {
  return <div className={styles.landing} data-seller-landing><LandingMotion /><Header startHref={startHref} /><main><SellerHeroCarousel startHref={startHref} dashboardHref={dashboardHref} /><Benefits /><Categories startHref={startHref} /><div className={styles.desktopWorkspace}><Workspace titleId="workspace-title-desktop" dashboardHref={dashboardHref} /></div><SellerTypes startHref={startHref} /><div className={styles.mobileWorkspace}><Workspace titleId="workspace-title-mobile" dashboardHref={dashboardHref} /></div><Steps startHref={startHref} dashboardHref={dashboardHref} /><Trust /><FAQs /><FinalCTA startHref={startHref} /></main><Footer startHref={startHref} /></div>;
}
