import {
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_ROLE_VALUES,
  isImageKitUrl,
  parseProductVideo,
} from "@repo/sanity";

const KEY = () => Math.random().toString(36).slice(2, 12);
const SANITY_ASSET_REF = /^image-[A-Za-z0-9]+-\d+x\d+-[a-z]+$/;

type Obj = Record<string, unknown>;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Validates the media block of a listing payload and returns documents ready to store.
 * Images may be existing Sanity images (kept as-is) or ImageKit uploads; URLs must be on
 * our ImageKit CDN. Returns `images` / `video` only for keys present in the body.
 */
export function parseMedia(
  body: Obj
): { data: Obj; unset: string[] } | { error: string } {
  const data: Obj = {};
  const unset: string[] = [];

  if (body.images !== undefined) {
    if (!Array.isArray(body.images)) return { error: "Images must be a list" };
    if (body.images.length < 1) return { error: "Add at least one product image" };
    if (body.images.length > MAX_PRODUCT_IMAGES) return { error: `You can add up to ${MAX_PRODUCT_IMAGES} images` };
    const images: Obj[] = [];
    for (const raw of body.images as Obj[]) {
      if (!raw || typeof raw !== "object") return { error: "Invalid image" };
      const role = str(raw.role, 30);
      if (role && !PRODUCT_IMAGE_ROLE_VALUES.includes(role)) return { error: "Invalid photo type" };
      const alt = str(raw.alt, 120);
      const common = { _key: str(raw._key, 20) || KEY(), ...(alt ? { alt } : {}), ...(role ? { role } : {}) };
      if (raw._type === "image") {
        const ref = (raw.asset as Obj | undefined)?._ref;
        if (typeof ref !== "string" || !SANITY_ASSET_REF.test(ref)) return { error: "Invalid image" };
        images.push({ _type: "image", asset: { _type: "reference", _ref: ref }, ...common });
      } else {
        if (!isImageKitUrl(raw.url)) return { error: "Images must be uploaded through the uploader" };
        const thumb = isImageKitUrl(raw.thumbnailUrl) ? raw.thumbnailUrl : undefined;
        images.push({
          _type: "imagekitAsset",
          url: raw.url,
          ...(thumb ? { thumbnailUrl: thumb } : {}),
          ...(typeof raw.fileId === "string" ? { fileId: raw.fileId.slice(0, 80) } : {}),
          ...(typeof raw.filePath === "string" ? { filePath: raw.filePath.slice(0, 300) } : {}),
          ...common,
        });
      }
    }
    data.images = images;
  }

  if (body.video !== undefined) {
    const v = body.video as Obj | null;
    if (!v || !v.url) {
      unset.push("video");
    } else {
      if (!parseProductVideo(v.url)) return { error: "Video must be an uploaded file or a YouTube/Vimeo link" };
      data.video = {
        url: v.url,
        ...(isImageKitUrl(v.thumbnailUrl) ? { thumbnailUrl: v.thumbnailUrl } : {}),
        ...(typeof v.fileId === "string" ? { fileId: v.fileId.slice(0, 80) } : {}),
      };
    }
  }
  return { data, unset };
}
