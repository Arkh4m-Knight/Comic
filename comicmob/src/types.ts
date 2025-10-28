export type Genre = "Action" | "Fantasy" | "Sci-Fi" | "Romance" | "Comedy" | "Drama" | "Adventure" | "Mystery" | "Horror" | "Thriller" | "Western" | "Animation" | "Documentary" | "Family" | "Music" | "Travel" | "History" | "Sports" | "Business" | "Technology" | "Fashion" | "Food" | "Health" | "Education" | "Other" | "Historical";
export type ComicFormat = "Comic" | "Manga" | "Manhwa";

export interface Episode {
  id: string;
  title: string;
  number: number;
  imageUrls: string[];
  createdAt: string;
}

export interface Comic {
  id: string;
  title: string;
  coverUrl?: string;
  genres: Genre[];
  format: ComicFormat;
  creatorId: string;
  episodes: Episode[];
  avgRating: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  role: "Reader" | "Creator" | "Reviewer" | "Admin";
}

export interface ReviewTagBreakdown {
  art: number; // 1-5
  story: number; // 1-5
  character: number; // 1-5
  worldbuilding: number; // 1-5
}

export interface Review {
  id: string;
  comicId: string;
  authorId: string;
  rating: number; // 1-5
  tags: ReviewTagBreakdown;
  content: string;
  createdAt: string;
  type: "Critic" | "User";
}

export interface LightNovel {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  synopsis?: string;
  createdAt: string;
}
