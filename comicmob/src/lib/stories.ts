import { Story, FormatStatus } from "../types";

// The four ComicMob Originals. Manga/animation status is set manually
// below (update as real progress happens). Light novel status, shown via
// lightNovelStatus(story), is derived from whether chapters actually
// exist -- once you add a story's first chapter here, its hub page
// switches to "Available Now" automatically, no separate flag to remember.
export const stories: Story[] = [
  {
    id: "orphanage",
    slug: "orphanage",
    title: "The Orphanage",
    genres: ["Mystery", "Action", "Drama"],
    hook: "A group of orphans fights for justice in a world that left them behind.",
    accent: "#C9A227", // gold -- flagship
    formats: {
      manga: "planned",
      animation: "planned",
    },
    chapters: [],
  },
  {
    id: "unloved-boy",
    slug: "unloved-boy",
    title: "The Unloved Boy",
    genres: ["Romance", "Drama"],
    hook: "Two lonely individuals meet and carve out a path of their own.",
    accent: "#B5746B", // dusty rose/copper
    formats: {
      manga: "planned",
      animation: "planned",
    },
    chapters: [],
  },
  {
    id: "chaabuk",
    slug: "chaabuk",
    title: "Chaabuk",
    genres: ["Horror", "Drama"],
    hook: "A book bound by an evil spirit seeks to dominate the world.",
    accent: "#7A2424", // oxblood
    formats: {
      manga: "planned",
      animation: "planned",
    },
    chapters: [],
  },
  {
    id: "lock-x",
    slug: "lock-x",
    title: "Lock X",
    genres: ["Sci-Fi", "Action", "Adventure"],
    hook: "Scattered individuals unite against a sinister kingdom that wants to rule the universe.",
    accent: "#3E6E8C", // steel blue
    formats: {
      manga: "planned",
      animation: "planned",
    },
    chapters: [],
  },
];

export function listStories(): Story[] {
  return stories;
}

export function getStoryBySlug(slug: string): Story | undefined {
  return stories.find((s) => s.slug === slug);
}

export function lightNovelStatus(story: Story): FormatStatus {
  return story.chapters.length > 0 ? "available" : "in-development";
}

export function getChapter(story: Story, number: number) {
  return story.chapters.find((c) => c.number === number);
}
