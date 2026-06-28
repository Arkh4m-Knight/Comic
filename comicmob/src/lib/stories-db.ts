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

export async function listOriginals(): Promise<DbStory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, slug, title, hook, genres, accent, is_original, creator_id, story_chapters(count)")
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
    .select(
      "id, slug, title, hook, genres, accent, is_original, creator_id, profiles(display_name), story_chapters(count)"
    )
    .eq("is_original", false)
    .order("created_at", { ascending: false });

  return (data ?? []).map((s: any) => ({
    ...s,
    creator_name: s.profiles?.display_name ?? null,
    chapter_count: s.story_chapters?.[0]?.count ?? 0,
  }));
}

export async function getStoryBySlug(slug: string): Promise<DbStory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select(
      "id, slug, title, hook, genres, accent, is_original, creator_id, profiles(display_name), story_chapters(count)"
    )
    .eq("slug", slug)
    .single();

  if (!data) return null;
  return {
    ...(data as any),
    creator_name: (data as any).profiles?.display_name ?? null,
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
    .single();
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
    .select("id, slug, title, hook, genres, accent, is_original, creator_id, story_chapters(count)")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((s: any) => ({
    ...s,
    chapter_count: s.story_chapters?.[0]?.count ?? 0,
  }));
}
