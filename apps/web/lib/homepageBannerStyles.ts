/**
 * Maps admin-chosen preset keys to Tailwind classes.
 * Full class strings must live in source so Tailwind can see them.
 */

export const MINI_STYLE_CLASSES: Record<
  string,
  { gradient: string; border: string }
> = {
  purple: {
    gradient: "from-[#6B1FA8] via-[#5D1694] to-[#450C72] text-white",
    border: "border-purple-300/20 hover:border-purple-300/40",
  },
  green: {
    gradient: "from-[#063c28] via-[#094d35] to-[#04281b] text-white",
    border: "border-emerald-300/20 hover:border-emerald-300/40",
  },
  red: {
    gradient: "from-[#E8000B] via-[#D4009B] to-[#B00080] text-white",
    border: "border-red-300/20 hover:border-red-300/40",
  },
  dark: {
    gradient: "from-[#0f172a] via-[#1e293b] to-[#0a0f1d] text-white",
    border: "border-slate-400/20 hover:border-slate-400/40",
  },
};

export const PROMO_STYLE_CLASSES: Record<string, string> = {
  cream: "from-[#FBF5E6] via-[#F8EFD7] to-[#F1E3C2]",
  sky: "from-[#F3F6FA] via-[#E8EFF7] to-[#D9E5F2]",
  rose: "from-[#FDF2F4] via-[#FBE5E9] to-[#F7D3DA]",
  mint: "from-[#D8EFE4] to-[#C9E7D8]",
  lavender: "from-[#E6E7F8] to-[#D7DAF5]",
  peach: "from-[#F6ECE0] to-[#EFE1D0]",
  ice: "from-[#DCEEF8] to-[#C8E4F5]",
  violet: "from-[#E7E4F6] to-[#D9D4F3]",
  seafoam: "from-[#D7EFE4] to-[#C8E8D9]",
};

export const miniStyle = (key?: string | null) =>
  MINI_STYLE_CLASSES[key ?? ""] ?? MINI_STYLE_CLASSES.purple;

export const promoGradient = (key?: string | null) =>
  PROMO_STYLE_CLASSES[key ?? ""] ?? PROMO_STYLE_CLASSES.cream;
