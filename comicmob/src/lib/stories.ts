import { Story } from "../types";

// The four ComicMob Originals. Status defaults to "in-development" for
// light novel and "planned" for manga/animation since only loglines exist
// so far, not finished chapters or art -- update these as real progress
// happens, rather than showing "available" before there's anything to read.
export const stories: Story[] = [
  {
    id: "orphanage",
    slug: "orphanage",
    title: "The Orphanage",
    genres: ["Mystery", "Action", "Drama"],
    hook: "A group of orphans fights for justice in a world that left them behind.",
    accent: "#C9A227", // gold -- flagship
    formats: {
      lightNovel: "in-development",
      manga: "planned",
      animation: "planned",
    },
    episodes: [],
  },
  {
    id: "unloved-boy",
    slug: "unloved-boy",
    title: "The Unloved Boy",
    genres: ["Romance", "Drama"],
    hook: "Two lonely individuals meet and carve out a path of their own.",
    accent: "#B5746B", // dusty rose/copper
    formats: {
      lightNovel: "in-development",
      manga: "planned",
      animation: "planned",
    },
    episodes: [],
  },
  {
    id: "chaabuk",
    slug: "chaabuk",
    title: "Chaabuk",
    genres: ["Horror", "Drama"],
    hook: "A book bound by an evil spirit seeks to dominate the world.",
    accent: "#7A2424", // oxblood
    formats: {
      lightNovel: "in-development",
      manga: "planned",
      animation: "planned",
    },
    episodes: [],
  },
  {
    id: "lock-x",
    slug: "lock-x",
    title: "Lock X",
    genres: ["Sci-Fi", "Action", "Adventure"],
    hook: "Scattered individuals unite against a sinister kingdom that wants to rule the universe.",
    accent: "#3E6E8C", // steel blue
    formats: {
      lightNovel: "in-development",
      manga: "planned",
      animation: "planned",
    },
    episodes: [],
  },
];

export function listStories(): Story[] {
  return stories;
}

export function getStoryBySlug(slug: string): Story | undefined {
  return stories.find((s) => s.slug === slug);
}
