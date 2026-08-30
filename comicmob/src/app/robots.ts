// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal, per-user routes: nothing here is useful in a search result,
      // and crawling them just burns budget that should go to chapters.
      // /publish stays crawlable on purpose — it's a real landing page.
      disallow: ["/api/", "/auth/", "/library", "/coins"],
    },
    sitemap: "https://www.comicmob.in/sitemap.xml",
  };
}
