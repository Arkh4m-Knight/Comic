export type Genre = "Action" | "Fantasy" | "Sci-Fi" | "Romance" | "Comedy" | "Drama" | "Adventure" | "Mystery" | "Horror" | "Thriller" | "Western" | "Animation" | "Documentary" | "Family" | "Music" | "Travel" | "History" | "Sports" | "Business" | "Technology" | "Fashion" | "Food" | "Health" | "Education" | "Other" | "Historical";

export interface Chapter {
  number: number;
  title: string;
  paragraphs: string[];
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
    manga: FormatStatus;
    animation: FormatStatus;
  };
  chapters: Chapter[]; // light novel chapters -- empty until real ones are added
}

export interface UserProfile {
  id: string;
  displayName: string;
  role: "Reader" | "Creator" | "Reviewer" | "Admin";
}
