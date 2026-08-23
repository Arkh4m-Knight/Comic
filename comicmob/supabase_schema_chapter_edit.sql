-- get_chapter_for_edit: the content column on story_chapters has been
-- column-locked since supabase_schema_chapter_access.sql (only readable
-- through get_chapter_access(), which enforces the paywall). That's
-- correct for readers, but it also blocked the rightful editor (the
-- story's creator, or an Admin managing an Original) from ever reading
-- their own chapter's content back for editing. This function is the
-- authorized bypass -- same ownership check as the existing DELETE route,
-- reused here for reads.

create or replace function get_chapter_for_edit(p_chapter_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chapter story_chapters%rowtype;
  v_story stories%rowtype;
  v_user_id uuid := auth.uid();
  v_is_admin boolean := false;
begin
  if v_user_id is null then
    return jsonb_build_object('error', 'not_signed_in');
  end if;

  select * into v_chapter from story_chapters where id = p_chapter_id;
  if not found then
    return jsonb_build_object('error', 'not_found');
  end if;

  select * into v_story from stories where id = v_chapter.story_id;

  if v_story.is_original then
    select coalesce(role = 'Admin', false) into v_is_admin from profiles where id = v_user_id;
  end if;

  if v_story.creator_id is distinct from v_user_id and not v_is_admin then
    return jsonb_build_object('error', 'forbidden');
  end if;

  return jsonb_build_object(
    'id', v_chapter.id,
    'story_id', v_chapter.story_id,
    'number', v_chapter.number,
    'title', v_chapter.title,
    'content', v_chapter.content
  );
end;
$$;

grant execute on function get_chapter_for_edit(uuid) to authenticated;
