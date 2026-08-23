// app/sitemap.ts
import type { MetadataRoute } from "next";
import { listOriginals, listCommunityStories, listChapterNumbers } from "@/src/lib/stories-db";

const BASE_URL = "https://www.comicmob.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [originals, community] = await Promise.all([listOriginals(), listCommunityStories()]);
  const allStories = [...originals, ...community];

  const storyEntries: MetadataRoute.Sitemap = [];

  for (const story of allStories) {
    storyEntries.push({
      url: `${BASE_URL}/story/${story.slug}`,
      changeFrequency: "weekly",
      priority: story.is_original ? 0.9 : 0.6,
    });

    if (story.chapter_count > 0) {
      const chapterNumbers = await listChapterNumbers(story.id);
      for (const number of chapterNumbers) {
        storyEntries.push({
          url: `${BASE_URL}/story/${story.slug}/chapter/${number}`,
          changeFrequency: "monthly",
          priority: story.is_original ? 0.7 : 0.5,
        });
      }
    }
  }

 return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/originals`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/community`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/publish`, changeFrequency: "monthly", priority: 0.5 },
    ...storyEntries,
  ];
}
