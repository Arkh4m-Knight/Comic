-- Per-story paywall settings. Previously "5 free chapters, 7-day wait"
-- was a fixed sitewide constant baked into get_chapter_access() and
-- redeem_daily_pass(). This makes both configurable per story (e.g. a
-- slower-releasing horror title might use a 10-day wait, a fast-updating
-- action title might stick with 5 free chapters and 7 days).

alter table stories add column if not exists free_chapter_count integer not null default 5;
alter table stories add column if not exists unlock_wait_days integer not null default 7;

-- Re-defines get_chapter_access() (same signature as before) to pull
-- free_chapter_count/unlock_wait_days from the story instead of hardcoding
-- 5 and 7 days.
create or replace function get_chapter_access(p_story_id uuid, p_number int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chapter story_chapters%rowtype;
  v_story stories%rowtype;
  v_user_id uuid := auth.uid();
  v_free_at timestamptz;
  v_can_read boolean := false;
  v_unlocked_with_coins boolean := false;
  v_unlocked_with_daily_pass boolean := false;
  v_daily_pass_expires_at timestamptz;
begin
  select * into v_chapter from story_chapters
    where story_id = p_story_id and number = p_number;

  if not found then
    return null;
  end if;

  select * into v_story from stories where id = p_story_id;

  v_free_at := v_chapter.published_at + (v_story.unlock_wait_days || ' days')::interval;

  if v_chapter.number <= v_story.free_chapter_count then
    v_can_read := true;
  elsif now() >= v_free_at then
    v_can_read := true;
  elsif v_user_id is not null and exists (
    select 1 from chapter_unlocks where user_id = v_user_id and chapter_id = v_chapter.id
  ) then
    v_can_read := true;
    v_unlocked_with_coins := true;
  elsif v_user_id is not null then
    select expires_at into v_daily_pass_expires_at
      from daily_pass_redemptions
      where user_id = v_user_id and chapter_id = v_chapter.id and expires_at > now();
    if found then
      v_can_read := true;
      v_unlocked_with_daily_pass := true;
    end if;
  end if;

  return jsonb_build_object(
    'id', v_chapter.id,
    'story_id', v_chapter.story_id,
    'number', v_chapter.number,
    'title', v_chapter.title,
    'content', case when v_can_read then v_chapter.content else null end,
    'locked', not v_can_read,
    'free_at', v_free_at,
    'coin_price', v_chapter.coin_price,
    'unlocked_with_coins', v_unlocked_with_coins,
    'unlocked_with_daily_pass', v_unlocked_with_daily_pass,
    'daily_pass_expires_at', v_daily_pass_expires_at
  );
end;
$$;

-- Re-defines redeem_daily_pass() the same way, for consistency, so a
-- Daily Pass can't be used on a chapter that's already free per this
-- story's own free_chapter_count/unlock_wait_days.
create or replace function redeem_daily_pass(p_chapter_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_chapter story_chapters%rowtype;
  v_story stories%rowtype;
  v_free_at timestamptz;
  v_last_redeemed timestamptz;
  v_expires_at timestamptz;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'reason', 'not_signed_in');
  end if;

  select * into v_chapter from story_chapters where id = p_chapter_id;
  if not found then
    return jsonb_build_object('success', false, 'reason', 'chapter_not_found');
  end if;

  select * into v_story from stories where id = v_chapter.story_id;

  v_free_at := v_chapter.published_at + (v_story.unlock_wait_days || ' days')::interval;
  if v_chapter.number <= v_story.free_chapter_count or now() >= v_free_at then
    return jsonb_build_object('success', false, 'reason', 'already_free');
  end if;

  if exists (select 1 from chapter_unlocks where user_id = v_user_id and chapter_id = p_chapter_id) then
    return jsonb_build_object('success', true, 'already_unlocked', true);
  end if;

  select max(redeemed_at) into v_last_redeemed from daily_pass_redemptions where user_id = v_user_id;

  if v_last_redeemed is not null and v_last_redeemed > now() - interval '24 hours' then
    return jsonb_build_object(
      'success', false,
      'reason', 'already_used_today',
      'next_available_at', v_last_redeemed + interval '24 hours'
    );
  end if;

  v_expires_at := now() + interval '14 days';

  insert into daily_pass_redemptions (user_id, chapter_id, expires_at)
    values (v_user_id, p_chapter_id, v_expires_at)
    on conflict (user_id, chapter_id) do nothing;

  return jsonb_build_object('success', true, 'expires_at', v_expires_at);
end;
$$;
