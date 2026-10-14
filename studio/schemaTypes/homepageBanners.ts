/**
 * Homepage banners: shared definitions used by the admin editor, the Sanity
 * schema, the storefront query and the storefront components.
 *
 * Banners are `homepageBanner` documents managed from the admin panel
 * (/admin/homepage). When a placement has no active banners the storefront falls
 * back to DEFAULT_HOMEPAGE_BANNERS below (the original hardcoded content), so
 * the homepage is never empty.
 */

export const HOMEPAGE_PLACEMENTS = [
  {
    value: "hero",
    title: "Hero slider",
    hint: "Large rotating banner at the very top of the homepage.",
    fields: ["badge", "title", "buttonText", "link", "image"],
  },
  {
    value: "mini",
    title: "Action cards",
    hint: "Row of small scrollable cards under the hero.",
    fields: ["badge", "title", "subtitle", "buttonText", "link", "style", "icon"],
  },
  {
    value: "promoSlider",
    title: "Promo slider",
    hint: "Large slider in the promo block below popular products.",
    fields: ["badge", "title", "price", "link", "image", "style"],
  },
  {
    value: "promoSide",
    title: "Promo side cards",
    hint: "Two stacked cards next to the promo slider (first 2 active are shown).",
    fields: ["title", "price", "link", "image", "style"],
  },
  {
    value: "promoBottom",
    title: "Promo bottom cards",
    hint: "Row of four cards under the promo block (first 4 active are shown).",
    fields: ["title", "price", "link", "image", "style"],
  },
] as const;

export type HomepagePlacement = (typeof HOMEPAGE_PLACEMENTS)[number]["value"];
export type HomepageBannerField = (typeof HOMEPAGE_PLACEMENTS)[number]["fields"][number];

export const HOMEPAGE_PLACEMENT_VALUES: readonly string[] = HOMEPAGE_PLACEMENTS.map((p) => p.value);

/** Colour presets. The storefront maps each key to Tailwind classes. */
export const MINI_STYLES = [
  { value: "purple", title: "Purple" },
  { value: "green", title: "Green" },
  { value: "red", title: "Red / pink" },
  { value: "dark", title: "Dark slate" },
] as const;

export const PROMO_STYLES = [
  { value: "cream", title: "Cream" },
  { value: "sky", title: "Sky" },
  { value: "rose", title: "Rose" },
  { value: "mint", title: "Mint" },
  { value: "lavender", title: "Lavender" },
  { value: "peach", title: "Peach" },
  { value: "ice", title: "Ice blue" },
  { value: "violet", title: "Violet" },
  { value: "seafoam", title: "Seafoam" },
] as const;

export const BANNER_ICONS = [
  { value: "store", title: "Store" },
  { value: "shield", title: "Shield / verified" },
  { value: "flame", title: "Flame / hot deal" },
  { value: "phone", title: "Phone" },
  { value: "tag", title: "Price tag" },
  { value: "gift", title: "Gift" },
  { value: "truck", title: "Delivery truck" },
] as const;

export const stylesForPlacement = (placement: string) =>
  placement === "mini" ? MINI_STYLES : placement === "hero" ? [] : PROMO_STYLES;

/** A banner as the storefront consumes it (image already resolved to a URL). */
export interface HomepageBanner {
  _id: string;
  placement: HomepagePlacement;
  title: string;
  badge?: string | null;
  subtitle?: string | null;
  price?: string | null;
  buttonText?: string | null;
  link: string;
  style?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  order?: number | null;
}

const ALLOWED_LINK = /^(\/(?!\/)|https?:\/\/|tel:|mailto:)/i;

/** Only internal paths, http(s), tel: and mailto: links are allowed (never `javascript:` etc.). */
export const isSafeHref = (href: unknown): href is string =>
  typeof href === "string" && href.trim().length > 0 && ALLOWED_LINK.test(href.trim());

export const safeHref = (href: unknown, fallback = "/"): string =>
  isSafeHref(href) ? href.trim() : fallback;

/** The original hardcoded homepage content; used as storefront fallback and by the admin "load defaults" action. */
export const DEFAULT_HOMEPAGE_BANNERS: HomepageBanner[] = [
  // ── Hero ────────────────────────────────────────────────
  {
    _id: "default-hero-1",
    placement: "hero",
    order: 1,
    title: "Experience Pure Sound — Your Perfect Headphones Await!",
    badge: "Limited Time Offer 30% Off",
    buttonText: "Shop Audio Gear",
    link: "/shop?query=audio",
    imageUrl: "/assets/images/hero/header_headphone_image.png",
  },
  {
    _id: "default-hero-2",
    placement: "hero",
    order: 2,
    title: "Next-Level Gaming Starts Here — Discover PlayStation 5!",
    badge: "Hurry Up, Only a Few Left!",
    buttonText: "Explore Flash Deals",
    link: "/deals",
    imageUrl: "/assets/images/hero/header_playstation_image.png",
  },
  {
    _id: "default-hero-3",
    placement: "hero",
    order: 3,
    title: "Power Meets Elegance — Apple MacBook Pro Is Here!",
    badge: "Exclusive Deal 40% Off",
    buttonText: "Shop Laptops Now",
    link: "/shop?query=macbook",
    imageUrl: "/assets/images/hero/header_macbook_image.png",
  },
  // ── Action cards ────────────────────────────────────────
  {
    _id: "default-mini-1",
    placement: "mini",
    order: 1,
    title: "Sell on U-Shop",
    subtitle: "Open your store & reach thousands of campus buyers today.",
    badge: "For Merchants",
    buttonText: "Register as Seller",
    link: "https://seller.ushopgh.com",
    style: "purple",
    icon: "store",
  },
  {
    _id: "default-mini-2",
    placement: "mini",
    order: 2,
    title: "Verified Stores",
    subtitle: "Shop directly from trusted Personal, Business, and Student sellers.",
    badge: "Verified Sellers",
    buttonText: "Browse Stores",
    link: "/stores",
    style: "green",
    icon: "shield",
  },
  {
    _id: "default-mini-3",
    placement: "mini",
    order: 3,
    title: "Hot Deals & Offers",
    subtitle: "Save big with daily discounts, clearance & flash sales.",
    badge: "Up to 40% Off",
    buttonText: "View All Deals",
    link: "/deals",
    style: "red",
    icon: "flame",
  },
  {
    _id: "default-mini-4",
    placement: "mini",
    order: 4,
    title: "Call To Order",
    subtitle: "Speak directly with our support team for instant order help.",
    badge: "Direct Support",
    buttonText: "+233 50 956 5794",
    link: "tel:+233509565794",
    style: "dark",
    icon: "phone",
  },
  // ── Promo slider ────────────────────────────────────────
  {
    _id: "default-promoSlider-1",
    placement: "promoSlider",
    order: 1,
    badge: "Big saving days sale",
    title: "Apple iPhone 17 Pro Max 256GB, Titanium Silver",
    price: "GH₵ 6,500.00",
    link: "/shop?query=iphone",
    style: "cream",
    imageUrl: "/assets/images/hero/girl_with_headphone_image.png",
  },
  {
    _id: "default-promoSlider-2",
    placement: "promoSlider",
    order: 2,
    badge: "Student Tech Special",
    title: "Apple MacBook Pro M3 Chip 512GB SSD, Space Gray",
    price: "GH₵ 8,999.00",
    link: "/shop?query=macbook",
    style: "sky",
    imageUrl: "/assets/images/hero/boy_with_laptop_image.png",
  },
  {
    _id: "default-promoSlider-3",
    placement: "promoSlider",
    order: 3,
    badge: "Audio & Accessories Fest",
    title: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
    price: "GH₵ 1,850.00",
    link: "/shop?query=audio",
    style: "rose",
    imageUrl: "/assets/images/hero/girl_with_earphone_image.png",
  },
  // ── Promo side cards ────────────────────────────────────
  {
    _id: "default-promoSide-1",
    placement: "promoSide",
    order: 1,
    title: "Buy Flagship Mobiles with low price",
    price: "GH₵ 4,200",
    link: "/shop?query=phone",
    style: "mint",
    imageUrl: "/assets/images/categories/phone.png",
  },
  {
    _id: "default-promoSide-2",
    placement: "promoSide",
    order: 2,
    title: "Buy Smart Tablets & iPads with low price",
    price: "GH₵ 1,850",
    link: "/shop?query=tablet",
    style: "lavender",
    imageUrl: "/assets/images/categories/Tablet.png",
  },
  // ── Promo bottom cards ──────────────────────────────────
  {
    _id: "default-promoBottom-1",
    placement: "promoBottom",
    order: 1,
    title: "Buy Laptops & Computing with low price",
    price: "GH₵ 3,999",
    link: "/shop?query=laptop",
    style: "peach",
    imageUrl: "/assets/images/categories/laptop.jpg",
  },
  {
    _id: "default-promoBottom-2",
    placement: "promoBottom",
    order: 2,
    title: "Buy Pro Gaming Consoles & Gear",
    price: "GH₵ 2,999",
    link: "/shop?query=gaming",
    style: "ice",
    imageUrl: "/assets/images/categories/Gaming.png",
  },
  {
    _id: "default-promoBottom-3",
    placement: "promoBottom",
    order: 3,
    title: "Buy Smart Audio & Earbuds with low price",
    price: "GH₵ 650",
    link: "/shop?query=audio",
    style: "violet",
    imageUrl: "/assets/images/categories/audio.png",
  },
  {
    _id: "default-promoBottom-4",
    placement: "promoBottom",
    order: 4,
    title: "Buy Smart TVs & Displays with low price",
    price: "GH₵ 4,500",
    link: "/shop?query=tv",
    style: "seafoam",
    imageUrl: "/assets/images/categories/tvs-video.png",
  },
];

/**
 * Group fetched banners by placement. A placement with no banners falls back to
 * the defaults, so an empty or unreachable CMS never blanks the homepage.
 */
export function resolveHomepageBanners(
  fetched: HomepageBanner[] | null | undefined
): Record<HomepagePlacement, HomepageBanner[]> {
  const out = {} as Record<HomepagePlacement, HomepageBanner[]>;
  for (const { value } of HOMEPAGE_PLACEMENTS) {
    const mine = (fetched ?? []).filter((b) => b.placement === value && isSafeHref(b.link));
    out[value] = mine.length ? mine : DEFAULT_HOMEPAGE_BANNERS.filter((b) => b.placement === value);
  }
  return out;
}
