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
  content: string;
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

export async function listOriginals(): Promise<DbStory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, slug, title, hook, genres, accent, is_original, creator_id, cover_url, story_chapters(count)")
    .eq("is_original", true)
    .order("created_at", { ascending: true });

  return (data ?? []).map((s: any) => ({
    ...s,
    chapter_count: s.story_chapters?.[0]?.count ?? 0,
  }));
}

export async function listCommunityStories(): Promise<DbStory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, slug, title, hook, genres, accent, is_original, creator_id, cover_url, story_chapters(count)")
    .eq("is_original", false)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const names = await getDisplayNames(rows.map((s: any) => s.creator_id));

  return rows.map((s: any) => ({
    ...s,
    creator_name: s.creator_id ? names[s.creator_id] ?? null : null,
    chapter_count: s.story_chapters?.[0]?.count ?? 0,
  }));
}

export async function getStoryBySlug(slug: string): Promise<DbStory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, slug, title, hook, genres, accent, is_original, creator_id, cover_url, story_chapters(count)")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  const names = data.creator_id ? await getDisplayNames([data.creator_id]) : {};

  return {
    ...(data as any),
    creator_name: data.creator_id ? names[data.creator_id] ?? null : null,
    chapter_count: (data as any).story_chapters?.[0]?.count ?? 0,
  };
}

export async function getChapter(storyId: string, number: number): Promise<DbChapter | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("story_chapters")
    .select("id, story_id, number, title, content")
    .eq("story_id", storyId)
    .eq("number", number)
    .maybeSingle();
  return data ?? null;
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

export async function getMyStories(userId: string): Promise<DbStory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, slug, title, hook, genres, accent, is_original, creator_id, cover_url, story_chapters(count)")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((s: any) => ({
    ...s,
    chapter_count: s.story_chapters?.[0]?.count ?? 0,
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
    .select(
      "story_id, stories(id, slug, title, hook, genres, accent, is_original, creator_id, cover_url, story_chapters(count))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const rows = (data ?? []).map((f: any) => f.stories).filter(Boolean);
  const names = await getDisplayNames(rows.map((s: any) => s.creator_id));

  return rows.map((s: any) => ({
    ...s,
    creator_name: s.creator_id ? names[s.creator_id] ?? null : null,
    chapter_count: s.story_chapters?.[0]?.count ?? 0,
  }));
}
