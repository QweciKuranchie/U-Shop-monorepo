/**
 * Product media: images (with an angle/lifestyle role) and an optional video.
 *
 * A product's `images` array can hold Sanity images (uploaded in Studio) and
 * `imagekitAsset` objects (uploaded from the seller app). Everything that renders
 * a product image goes through `productImageUrl` so both kinds work; passing an
 * ImageKit object straight to `urlFor` throws.
 */
import { urlFor } from "./image";

export const PRODUCT_IMAGE_ROLES = [
  { value: "front", title: "Front", group: "angle" },
  { value: "back", title: "Back", group: "angle" },
  { value: "side", title: "Side", group: "angle" },
  { value: "top", title: "Top / bottom", group: "angle" },
  { value: "detail", title: "Close-up detail", group: "angle" },
  { value: "in_box", title: "What's in the box", group: "angle" },
  { value: "lifestyle", title: "Lifestyle / in use", group: "lifestyle" },
] as const;

export type ProductImageRole = (typeof PRODUCT_IMAGE_ROLES)[number]["value"];
export const PRODUCT_IMAGE_ROLE_VALUES: readonly string[] = PRODUCT_IMAGE_ROLES.map((r) => r.value);

export const productImageRoleTitle = (role?: string | null) =>
  PRODUCT_IMAGE_ROLES.find((r) => r.value === role)?.title ?? null;

export const MAX_PRODUCT_IMAGES = 8;

export interface ProductImageLike {
  _type?: string;
  _key?: string;
  url?: string | null;
  thumbnailUrl?: string | null;
  alt?: string | null;
  role?: string | null;
  asset?: unknown;
}

/** Only our ImageKit CDN may be stored as a product image/video URL. */
export const IMAGEKIT_HOST = "ik.imagekit.io";

export function isImageKitUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname === IMAGEKIT_HOST;
  } catch {
    return false;
  }
}

/** URL for a product image of either kind, or null if it cannot be resolved. Never throws. */
export function productImageUrl(source: unknown, opts: { width?: number } = {}): string | null {
  if (!source || typeof source !== "object") return null;
  const img = source as ProductImageLike;
  try {
    if (img._type === "imagekitAsset" || (typeof img.url === "string" && !img.asset)) {
      return typeof img.url === "string" && img.url ? img.url : null;
    }
    const b = urlFor(source as Parameters<typeof urlFor>[0]);
    return (opts.width ? b.width(opts.width) : b).url() || null;
  } catch {
    return null;
  }
}

export type ProductVideoSource =
  | { kind: "file"; url: string }
  | { kind: "youtube"; url: string; embedUrl: string }
  | { kind: "vimeo"; url: string; embedUrl: string };

/** Classifies a video URL. Only ImageKit files, YouTube and Vimeo are accepted. */
export function parseProductVideo(url: unknown): ProductVideoSource | null {
  if (typeof url !== "string") return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\./, "");
  if (host === IMAGEKIT_HOST) return { kind: "file", url };
  if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com") {
    const id = host === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") || u.pathname.split("/").pop();
    if (id && /^[\w-]{6,20}$/.test(id))
      return { kind: "youtube", url, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0` };
  }
  if (host === "vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean).pop();
    if (id && /^\d+$/.test(id)) return { kind: "vimeo", url, embedUrl: `https://player.vimeo.com/video/${id}` };
  }
  return null;
}

export interface GalleryImage {
  type: "image";
  key: string;
  src: string;
  thumb: string;
  alt: string;
  role: string | null;
  label: string | null;
}
export interface GalleryVideo {
  type: "video";
  key: string;
  video: ProductVideoSource;
  poster: string | null;
  alt: string;
  label: string;
}
export type GalleryItem = GalleryImage | GalleryVideo;

/** Builds the ordered gallery for a product: images first, then the video if any. */
export function buildProductGallery(product: {
  name?: string | null;
  images?: unknown[] | null;
  video?: { url?: string | null; thumbnailUrl?: string | null } | null;
}): GalleryItem[] {
  const name = product.name || "Product";
  const items: GalleryItem[] = [];
  (product.images ?? []).forEach((raw, i) => {
    const img = (raw ?? {}) as ProductImageLike;
    const src = productImageUrl(raw);
    if (!src) return;
    const label = productImageRoleTitle(img.role);
    items.push({
      type: "image",
      key: img._key || `img-${i}`,
      src,
      thumb: productImageUrl(raw, { width: 160 }) ?? src,
      alt: img.alt?.trim() || (label ? `${name} – ${label}` : `${name} – image ${i + 1}`),
      role: img.role ?? null,
      label,
    });
  });
  const video = parseProductVideo(product.video?.url);
  if (video) {
    items.push({
      type: "video",
      key: "video",
      video,
      poster: isImageKitUrl(product.video?.thumbnailUrl) ? product.video!.thumbnailUrl! : null,
      alt: `${name} – video`,
      label: "Video",
    });
  }
  return items;
}
