-- Fixes story listings (Originals, Community, favorites, etc.) breaking
-- after supabase_schema_chapter_access.sql locked story_chapters down to
-- column-level grants. The app was using PostgREST's embedded resource
-- join syntax -- .select("...stories fields..., story_chapters(count)")
-- -- to get a chapter count per story. That embed requires ordinary
-- table-level SELECT on story_chapters, which no longer exists (only
-- specific columns are grantable now), so the whole query was failing
-- and returning no rows at all -- not just missing counts.
--
-- Fix: a dedicated function that returns counts directly, bypassing the
-- embed entirely.

create or replace function get_chapter_counts(p_story_ids uuid[])
returns table(story_id uuid, chapter_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select story_chapters.story_id, count(*) as chapter_count
  from story_chapters
  where story_chapters.story_id = any(p_story_ids)
  group by story_chapters.story_id;
$$;

grant execute on function get_chapter_counts(uuid[]) to anon, authenticated;
