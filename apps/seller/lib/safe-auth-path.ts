/** Keep post-auth navigation on this application, including query parameters. */
export function safeAuthPath(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;

  try {
    const url = new URL(value, "https://seller.ushop.local");
    if (url.origin !== "https://seller.ushop.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
