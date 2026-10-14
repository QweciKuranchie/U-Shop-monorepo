/**
 * Maps admin-chosen preset keys to Tailwind classes.
 * Full class strings must live in source so Tailwind can see them.
 */

export const MINI_STYLE_CLASSES: Record<
  string,
  { gradient: string; border: string }
> = {
  purple: {
    gradient: "bg-[#6B1FA8] text-white",
    border: "border-purple-300/20 hover:border-purple-300/40",
  },
  green: {
    gradient: "bg-[#063c28] text-white",
    border: "border-emerald-300/20 hover:border-emerald-300/40",
  },
  red: {
    gradient: "bg-[#E8000B] text-white",
    border: "border-red-300/20 hover:border-red-300/40",
  },
  dark: {
    gradient: "bg-[#0f172a] text-white",
    border: "border-slate-400/20 hover:border-slate-400/40",
  },
};

export const PROMO_STYLE_CLASSES: Record<string, string> = {
  cream: "bg-[#FBF5E6]",
  sky: "bg-[#F3F6FA]",
  rose: "bg-[#FDF2F4]",
  mint: "bg-[#D8EFE4]",
  lavender: "bg-[#E6E7F8]",
  peach: "bg-[#F6ECE0]",
  ice: "bg-[#DCEEF8]",
  violet: "bg-[#E7E4F6]",
  seafoam: "bg-[#D7EFE4]",
};

export const miniStyle = (key?: string | null) =>
  MINI_STYLE_CLASSES[key ?? ""] ?? MINI_STYLE_CLASSES.purple;

export const promoGradient = (key?: string | null) =>
  PROMO_STYLE_CLASSES[key ?? ""] ?? PROMO_STYLE_CLASSES.cream;
