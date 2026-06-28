import { Comic, Episode, Review, UserProfile, LightNovel, Mood } from "../types";

// Simple in-memory mock store for demo purposes only.
const users: Record<string, UserProfile> = {
  u1: { id: "u1", displayName: "Mako", role: "Creator" },
  u2: { id: "u2", displayName: "Nova", role: "Reviewer" },
  u3: { id: "u3", displayName: "Rin", role: "Reader" },
};

const sampleImages = Array.from({ length: 10 }).map((_, i) =>
  `https://picsum.photos/seed/comic${i}/800/1200`
);

const episodes: Episode[] = [
  { id: "e1", title: "Chapter 1", number: 1, imageUrls: sampleImages, createdAt: new Date().toISOString() },
  { id: "e2", title: "Chapter 2", number: 2, imageUrls: sampleImages, createdAt: new Date().toISOString() },
];

const comics: Record<string, Comic> = {
  c1: {
    id: "c1",
    title: "Starfall Knights",
    coverUrl: "https://picsum.photos/seed/c1-starfallknights/400/600",
    genres: ["Action", "Fantasy"],
    format: "Comic",
    creatorId: "u1",
    episodes,
    avgRating: 4.4,
    moods: ["Edge of Your Seat", "Escape Tonight"],
  },
  c2: {
    id: "c2",
    title: "Neon Alley",
    coverUrl: "https://picsum.photos/seed/c2-neonalley/400/600",
    genres: ["Action", "Fantasy"],
    format: "Comic",
    creatorId: "u1",
    episodes,
    avgRating: 4.1,
    moods: ["Quick Read", "Edge of Your Seat"],
  },
  c3: {
    id: "c3",
    title: "Cyber Warriors",
    coverUrl: "https://picsum.photos/seed/c3-cyberwarriors/400/600",
    genres: ["Action", "Fantasy"],
    format: "Comic",
    creatorId: "u1",
    episodes,
    avgRating: 4.3,
    moods: ["Edge of Your Seat", "Quick Read"],
  },
  c4: {
    id: "c4",
    title: "Mystic Realms",
    coverUrl: "https://picsum.photos/seed/c4-mysticrealms/400/600",
    genres: ["Fantasy", "Action"],
    format: "Comic",
    creatorId: "u1",
    episodes,
    avgRating: 4.5,
    moods: ["Escape Tonight", "Slow Burn"],
  },
  m1: {
    id: "m1",
    title: "Blade of Sakura",
    coverUrl: "https://picsum.photos/seed/m1-bladeofsakura/400/600",
    genres: ["Action", "Fantasy"],
    format: "Manga",
    creatorId: "u1",
    episodes,
    avgRating: 4.6,
    moods: ["Edge of Your Seat", "Gut Punch"],
  },
  m2: {
    id: "m2",
    title: "Tokyo Shadows",
    coverUrl: "https://picsum.photos/seed/m2-tokyoshadows/400/600",
    genres: ["Fantasy", "Action"],
    format: "Manga",
    creatorId: "u1",
    episodes,
    avgRating: 4.2,
    moods: ["Slow Burn", "Gut Punch"],
  },
  m3: {
    id: "m3",
    title: "Samurai Dreams",
    coverUrl: "https://picsum.photos/seed/m3-samuraidreams/400/600",
    genres: ["Action", "Fantasy"],
    format: "Manga",
    creatorId: "u1",
    episodes,
    avgRating: 4.7,
    moods: ["Slow Burn", "Escape Tonight"],
  },
  m4: {
    id: "m4",
    title: "Schoolyard Chronicles",
    coverUrl: "https://picsum.photos/seed/m4-schoolyardchronicles/400/600",
    genres: ["Fantasy", "Action"],
    format: "Manga",
    creatorId: "u1",
    episodes,
    avgRating: 4.0,
    moods: ["Feel Good", "Quick Read"],
  },
  mh1: {
    id: "mh1",
    title: "Skybound Hunter",
    coverUrl: "https://picsum.photos/seed/mh1-skyboundhunter/400/600",
    genres: ["Fantasy", "Action"],
    format: "Manhwa",
    creatorId: "u1",
    episodes,
    avgRating: 4.2,
    moods: ["Escape Tonight", "Quick Read"],
  },
  mh2: {
    id: "mh2",
    title: "Shadow Ascension",
    coverUrl: "https://picsum.photos/seed/mh2-shadowascension/400/600",
    genres: ["Action", "Fantasy"],
    format: "Manhwa",
    creatorId: "u1",
    episodes,
    avgRating: 4.8,
    moods: ["Edge of Your Seat", "Gut Punch"],
  },
  mh3: {
    id: "mh3",
    title: "Spire of Eternity",
    coverUrl: "https://picsum.photos/seed/mh3-spireofeternity/400/600",
    genres: ["Fantasy", "Action"],
    format: "Manhwa",
    creatorId: "u1",
    episodes,
    avgRating: 4.6,
    moods: ["Slow Burn", "Escape Tonight"],
  },
  mh4: {
    id: "mh4",
    title: "Second Life Sovereign",
    coverUrl: "https://picsum.photos/seed/mh4-secondlifesovereign/400/600",
    genres: ["Fantasy", "Action"],
    format: "Manhwa",
    creatorId: "u1",
    episodes,
    avgRating: 4.4,
    moods: ["Feel Good", "Slow Burn"],
  },
};

let reviews: Review[] = [
  {
    id: "r1",
    comicId: "c1",
    authorId: "u2",
    rating: 5,
    tags: { art: 5, story: 4, character: 5, worldbuilding: 5 },
    content: "Gorgeous art with tight pacing.",
    createdAt: new Date().toISOString(),
    type: "Critic",
  },
];

let lightNovels: LightNovel[] = [
  {
    id: "ln1",
    title: "Moonlit Archive",
    author: "A. Sato",
    coverUrl: "https://picsum.photos/seed/ln1-moonlitarchive/400/600",
    synopsis: "A scholar uncovers a forgotten empire through lost diaries.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ln2",
    title: "Digital Dreams",
    author: "K. Chen",
    coverUrl: "https://picsum.photos/seed/ln2-digitaldreams/400/600",
    synopsis: "A programmer discovers a virtual world that affects reality.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ln3",
    title: "Eternal Garden",
    author: "M. Rodriguez",
    coverUrl: "https://picsum.photos/seed/ln3-eternalgarden/400/600",
    synopsis: "A botanist finds a garden where time stands still.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ln4",
    title: "Crimson Chronicles",
    author: "S. Kim",
    coverUrl: "https://picsum.photos/seed/ln4-crimsonchronicles/400/600",
    synopsis: "A detective solves supernatural crimes in a noir city.",
    createdAt: new Date().toISOString(),
  },
];

// User authentication and library management
interface AuthUser {
  id: string;
  email: string;
  username: string;
  password: string;
  library: string[]; // comic IDs
}

let authUsers: AuthUser[] = [];
let currentUser: AuthUser | null = null;

export const ALL_MOODS: Mood[] = [
  "Escape Tonight",
  "Quick Read",
  "Gut Punch",
  "Edge of Your Seat",
  "Slow Burn",
  "Feel Good",
];

export function listTrendingComics(): Comic[] {
  return Object.values(comics);
}

export function getComic(id: string): Comic | undefined {
  return comics[id];
}

export function getUser(id: string): UserProfile | undefined {
  return users[id];
}

export function listReviews(comicId: string): Review[] {
  return reviews.filter(r => r.comicId === comicId);
}

export function addReview(newReview: Omit<Review, "id" | "createdAt">): Review {
  const review: Review = {
    ...newReview,
    id: `r${reviews.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  reviews = [review, ...reviews];
  return review;
}

export function listLightNovels(): LightNovel[] {
  return lightNovels;
}

export function addLightNovel(input: Omit<LightNovel, "id" | "createdAt">): LightNovel {
  const ln: LightNovel = {
    ...input,
    id: `ln${lightNovels.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  lightNovels = [ln, ...lightNovels];
  return ln;
}

// Authentication functions
export function signUp(email: string, username: string, password: string): AuthUser | null {
  if (authUsers.find(u => u.email === email || u.username === username)) {
    return null; // User already exists
  }
  const user: AuthUser = {
    id: `user_${authUsers.length + 1}`,
    email,
    username,
    password,
    library: [],
  };
  authUsers.push(user);
  currentUser = user;
  return user;
}

export function signIn(email: string, password: string): AuthUser | null {
  const user = authUsers.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    return user;
  }
  return null;
}

export function getCurrentUser(): AuthUser | null {
  return currentUser;
}

export function signOut(): void {
  currentUser = null;
}

export function addToLibrary(comicId: string): boolean {
  if (!currentUser) return false;
  if (!currentUser.library.includes(comicId)) {
    currentUser.library.push(comicId);
    return true;
  }
  return false;
}

export function getUserLibrary(): Comic[] {
  if (!currentUser) return [];
  return currentUser.library.map(id => comics[id]).filter(Boolean);
}
