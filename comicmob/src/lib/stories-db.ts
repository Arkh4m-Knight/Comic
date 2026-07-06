import { createClient } from "@/src/lib/supabase/server";

export interface DbStory {
  id: string;
  slug: string;
  title: string;
  hook: string;
  genres: string[];
  accent: string;
  is_original: boolean;
  creator_id: string | null;
  cover_url: string | null;
  creator_name?: string | null;
  chapter_count: number;
}

export interface DbChapter {
  id: string;
  story_id: string;
  number: number;
  title: string;
  content: string | null;
  locked: boolean;
  free_at: string;
  coin_price: number;
  unlocked_with_coins: boolean;
  unlocked_with_daily_pass: boolean;
  daily_pass_expires_at: string | null;
}

// Looks up display names for a set of creator IDs in one query. Used
// instead of embedding profiles(...) directly in the stories query --
// that embed silently behaves like an inner join, which drops any row
// whose creator_id is null (true for the 4 Originals, which are
// studio-owned with no creator account), causing getStoryBySlug to
// return nothing for them and the page to 404. A separate lookup avoids
// this entirely and works the same regardless of null creator_ids.
async function getDisplayNames(userIds: string[]): Promise<Record<string, string>> {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (ids.length === 0) return {};

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, display_name").in("id", ids);

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.id] = row.display_name;
  }
  return map;
}

// Batch chapter-count lookup. Uses get_chapter_counts() instead of the
// PostgREST embedded join story_chapters(count), which requires
// table-level SELECT on story_chapters -- gone since that table now only
// has column-level grants (see supabase_schema_chapter_access.sql).
async function getChapterCounts(storyIds: string[]): Promise<Record<string, number>> {
  const ids = [...new Set(storyIds.filter(Boolean))];
  if (ids.length === 0) return {};

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_chapter_counts", { p_story_ids: ids });

  const map: Record<string, number> = {};
  for (const row of (data ?? []) as { story_id: string; chapter_count: number }[]) {
    map[row.story_id] = row.chapter_count;
  }
  return map;
}

export async function listOriginals(): Promise<DbStory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, slug, title, hook, genres, accent, is_original, creator_id, cover_url")
    .eq("is_original", true)
    .order("created_at", { ascending: true });

  const rows = data ?? [];
  const counts = await getChapterCounts(rows.map((s) => s.id));

  return rows.map((s) => ({
    ...s,
    chapter_count: counts[s.id] ?? 0,
  }));
}

export async function listCommunityStories(): Promise<DbStory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, slug, title, hook, genres, accent, is_original, creator_id, cover_url")
    .eq("is_original", false)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const [names, counts] = await Promise.all([
    getDisplayNames(rows.map((s) => s.creator_id)),
    getChapterCounts(rows.map((s) => s.id)),
  ]);

  return rows.map((s) => ({
    ...s,
    creator_name: s.creator_id ? names[s.creator_id] ?? null : null,
    chapter_count: counts[s.id] ?? 0,
  }));
}

export async function getStoryBySlug(slug: string): Promise<DbStory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, slug, title, hook, genres, accent, is_original, creator_id, cover_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  const [names, counts] = await Promise.all([
    data.creator_id ? getDisplayNames([data.creator_id]) : Promise.resolve({} as Record<string, string>),
    getChapterCounts([data.id]),
  ]);

  return {
    ...data,
    creator_name: data.creator_id ? names[data.creator_id] ?? null : null,
    chapter_count: counts[data.id] ?? 0,
  };
}

export async function getChapter(storyId: string, number: number): Promise<DbChapter | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_chapter_access", {
    p_story_id: storyId,
    p_number: number,
  });
  return (data as DbChapter | null) ?? null;
}

// Reader's own coin wallet balance. Returns 0 for signed-out users (the
// RPC requires auth.uid(), which is null when signed out).
export async function getMyCoinBalance(): Promise<number> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return 0;

  const { data } = await supabase.rpc("get_my_coin_balance");
  return (data as number) ?? 0;
}

export interface DbCoinTransaction {
  id: string;
  amount: number;
  type: string;
  chapter_id: string | null;
  created_at: string;
}

export async function getMyCoinTransactions(userId: string): Promise<DbCoinTransaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coin_transactions")
    .select("id, amount, type, chapter_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export interface DailyPassStatus {
  can_redeem: boolean;
  next_available_at: string | null;
}

export async function getMyDailyPassStatus(): Promise<DailyPassStatus> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { can_redeem: false, next_available_at: null };

  const { data } = await supabase.rpc("get_my_daily_pass_status");
  return (data as DailyPassStatus) ?? { can_redeem: false, next_available_at: null };
}

export interface DbStoryReview {
  id: string;
  story_id: string;
  author_id: string;
  rating: number;
  content: string;
  created_at: string;
  author_name: string;
}

export async function getStoryReviews(storyId: string): Promise<DbStoryReview[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("story_reviews")
    .select("id, story_id, author_id, rating, content, created_at")
    .eq("story_id", storyId)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const names = await getDisplayNames(rows.map((r) => r.author_id));

  return rows.map((r) => ({ ...r, author_name: names[r.author_id] ?? "A reader" }));
}

export async function getMyReviewForStory(storyId: string, userId: string): Promise<DbStoryReview | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("story_reviews")
    .select("id, story_id, author_id, rating, content, created_at")
    .eq("story_id", storyId)
    .eq("author_id", userId)
    .maybeSingle();
  if (!data) return null;
  return { ...data, author_name: "" };
}

export async function listChapterNumbers(storyId: string): Promise<number[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("story_chapters")
    .select("number")
    .eq("story_id", storyId)
    .order("number", { ascending: true });
  return (data ?? []).map((c) => c.number);
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "Admin";
}

export async function getMyStories(userId: string): Promise<DbStory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, slug, title, hook, genres, accent, is_original, creator_id, cover_url")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const counts = await getChapterCounts(rows.map((s) => s.id));

  return rows.map((s) => ({
    ...s,
    chapter_count: counts[s.id] ?? 0,
  }));
}

export interface ChapterSummary {
  id: string;
  number: number;
  title: string;
}

export async function getStoryChapters(storyId: string): Promise<ChapterSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("story_chapters")
    .select("id, number, title")
    .eq("story_id", storyId)
    .order("number", { ascending: true });
  return data ?? [];
}

export async function getFavoriteStories(userId: string): Promise<DbStory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("story_id, stories(id, slug, title, hook, genres, accent, is_original, creator_id, cover_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const rows = (data ?? []).map((f: any) => f.stories).filter(Boolean);
  const [names, counts] = await Promise.all([
    getDisplayNames(rows.map((s: any) => s.creator_id)),
    getChapterCounts(rows.map((s: any) => s.id)),
  ]);

  return rows.map((s: any) => ({
    ...s,
    creator_name: s.creator_id ? names[s.creator_id] ?? null : null,
    chapter_count: counts[s.id] ?? 0,
  }));
}
