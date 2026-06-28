export type Genre = "Action" | "Fantasy" | "Sci-Fi" | "Romance" | "Comedy" | "Drama" | "Adventure" | "Mystery" | "Horror" | "Thriller" | "Western" | "Animation" | "Documentary" | "Family" | "Music" | "Travel" | "History" | "Sports" | "Business" | "Technology" | "Fashion" | "Food" | "Health" | "Education" | "Other" | "Historical";

export interface Episode {
  id: string;
  title: string;
  number: number;
  imageUrls: string[];
  createdAt: string;
}

export type FormatStatus = "available" | "in-development" | "planned";

export interface Story {
  id: string;
  slug: string;
  title: string;
  genres: Genre[];
  hook: string;
  accent: string; // hex accent color, distinct per story
  formats: {
    lightNovel: FormatStatus;
    manga: FormatStatus;
    animation: FormatStatus;
  };
  episodes: Episode[]; // light novel chapters, once written
}

export interface UserProfile {
  id: string;
  displayName: string;
  role: "Reader" | "Creator" | "Reviewer" | "Admin";
}
