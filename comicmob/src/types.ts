export type Genre = "Action" | "Fantasy" | "Sci-Fi" | "Romance" | "Comedy" | "Drama" | "Adventure" | "Mystery" | "Horror" | "Thriller" | "Western" | "Animation" | "Documentary" | "Family" | "Music" | "Travel" | "History" | "Sports" | "Business" | "Technology" | "Fashion" | "Food" | "Health" | "Education" | "Other" | "Historical";

export interface UserProfile {
  id: string;
  displayName: string;
  role: "Reader" | "Creator" | "Reviewer" | "Admin";
}
