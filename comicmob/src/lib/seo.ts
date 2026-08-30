// Central place for anything that needs to know the site's public origin.
// Vercel preview deployments can override this with NEXT_PUBLIC_SITE_URL so
// that canonicals and sitemap entries point at the preview, not production.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.comicmob.in"
).replace(/\/+$/, "");

export const SITE_NAME = "ComicMob";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// Google renders roughly 155-160 characters of a description before
// truncating mid-word. Trim on a word boundary so the snippet still reads
// like a sentence instead of stopping halfway through one.
export function clampDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.lastIndexOf(" ", max - 1);
  return `${clean.slice(0, cut > 0 ? cut : max - 1).trimEnd()}…`;
}
