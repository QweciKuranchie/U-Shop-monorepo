import {
  HOMEPAGE_PLACEMENT_VALUES,
  BANNER_ICONS,
  isSafeHref,
  stylesForPlacement,
} from "@repo/sanity";

export const BANNER_PROJECTION = `{
  _id, placement, title, badge, subtitle, price, buttonText, link, style, icon,
  imageUrl, "uploadedUrl": image.asset->url, "imageAssetId": image.asset._ref,
  order, isActive, startsAt, endsAt,
  "imageUrlResolved": coalesce(image.asset->url, imageUrl)
}`;

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : undefined;

export type BannerInput = Record<string, unknown>;

/** Validates + normalises a banner payload. Returns the doc fields or an error. */
export function parseBanner(
  body: BannerInput,
  partial = false
): { data: Record<string, unknown>; unset: string[] } | { error: string } {
  const data: Record<string, unknown> = {};
  const unset: string[] = [];
  const has = (k: string) => body[k] !== undefined;

  if (!partial || has("placement")) {
    if (!HOMEPAGE_PLACEMENT_VALUES.includes(String(body.placement)))
      return { error: "Invalid placement" };
    data.placement = body.placement;
  }
  const placement = String(body.placement ?? "");

  if (!partial || has("title")) {
    const t = str(body.title, 120);
    if (!t) return { error: "Title is required" };
    data.title = t;
  }
  if (!partial || has("link")) {
    const l = str(body.link, 500);
    if (!l || !isSafeHref(l))
      return { error: "Link must start with /, https://, http://, tel: or mailto:" };
    data.link = l;
  }
  for (const [k, max] of [["badge", 80], ["subtitle", 160], ["price", 40], ["buttonText", 40], ["imageUrl", 500]] as const) {
    if (has(k)) {
      const v = str(body[k], max);
      if (v) {
        if (k === "imageUrl" && !/^(\/(?!\/)|https:\/\/)/i.test(v)) return { error: "Image URL must be a path or https:// URL" };
        data[k] = v;
      } else unset.push(k);
    }
  }
  if (has("style")) {
    const v = str(body.style, 40);
    if (v) {
      if (placement && !stylesForPlacement(placement).some((s) => s.value === v))
        return { error: "Invalid style for this placement" };
      data.style = v;
    } else unset.push("style");
  }
  if (has("icon")) {
    const v = str(body.icon, 40);
    if (v) {
      if (!BANNER_ICONS.some((i) => i.value === v)) return { error: "Invalid icon" };
      data.icon = v;
    } else unset.push("icon");
  }
  if (has("order")) {
    const n = Number(body.order);
    if (!Number.isFinite(n)) return { error: "Invalid order" };
    data.order = Math.round(n);
  }
  if (has("isActive")) data.isActive = Boolean(body.isActive);
  for (const k of ["startsAt", "endsAt"] as const) {
    if (has(k)) {
      if (!body[k]) unset.push(k);
      else {
        const d = new Date(String(body[k]));
        if (isNaN(d.getTime())) return { error: `Invalid ${k}` };
        data[k] = d.toISOString();
      }
    }
  }
  if (data.startsAt && data.endsAt && new Date(String(data.endsAt)) <= new Date(String(data.startsAt)))
    return { error: "End must be after start" };
  return { data, unset };
}

export function imageRef(assetId: unknown) {
  return typeof assetId === "string" && /^image-[A-Za-z0-9]+-\d+x\d+-[a-z]+$/.test(assetId)
    ? { _type: "image", asset: { _type: "reference", _ref: assetId } }
    : null;
}
