-- Daily Pass + reviews-for-coins. Run after the previous two migration
-- files.

-- ===== 1. Daily Pass: one free temporary unlock per user per 24h =====
create table if not exists daily_pass_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  chapter_id uuid not null references story_chapters(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique (user_id, chapter_id)
);

alter table daily_pass_redemptions enable row level security;
create policy "Users can view own daily pass redemptions" on daily_pass_redemptions for select using (auth.uid() = user_id);
-- No insert policy -- writes only happen inside redeem_daily_pass() below.

-- Re-defines get_chapter_access() (same signature as before) to also treat
-- an active, unexpired Daily Pass redemption as access -- separate from a
-- permanent coin unlock in chapter_unlocks.
create or replace function get_chapter_access(p_story_id uuid, p_number int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chapter story_chapters%rowtype;
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

  v_free_at := v_chapter.published_at + interval '7 days';

  if v_chapter.number <= 5 then
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

-- redeem_daily_pass: claims today's free unlock for one locked chapter.
-- One redemption per user per rolling 24h, enforced by checking the most
-- recent redeemed_at -- not a calendar-day reset, so it can't be gamed by
-- redeeming at 11:59pm and again at 12:01am.
create or replace function redeem_daily_pass(p_chapter_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_chapter story_chapters%rowtype;
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

  v_free_at := v_chapter.published_at + interval '7 days';
  if v_chapter.number <= 5 or now() >= v_free_at then
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

grant execute on function redeem_daily_pass(uuid) to authenticated;

-- Tells the UI whether the reader can redeem a Daily Pass right now, so
-- the button can show a "come back in Xh" state instead of failing silently.
create or replace function get_my_daily_pass_status()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_last_redeemed timestamptz;
begin
  if v_user_id is null then
    return jsonb_build_object('can_redeem', false, 'next_available_at', null);
  end if;

  select max(redeemed_at) into v_last_redeemed from daily_pass_redemptions where user_id = v_user_id;

  if v_last_redeemed is null or v_last_redeemed <= now() - interval '24 hours' then
    return jsonb_build_object('can_redeem', true, 'next_available_at', null);
  end if;

  return jsonb_build_object('can_redeem', false, 'next_available_at', v_last_redeemed + interval '24 hours');
end;
$$;

grant execute on function get_my_daily_pass_status() to authenticated;

-- ===== 2. Story reviews, with a one-time 1-coin reward per story =====
create table if not exists story_reviews (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  content text not null,
  created_at timestamptz not null default now(),
  unique (story_id, author_id) -- one review per reader per story; also stops
                                -- the coin reward from being farmed by
                                -- repeat-reviewing the same story
);

alter table story_reviews enable row level security;

create policy "Story reviews are publicly viewable" on story_reviews for select using (true);

-- Blocks reviewing your own community story (self-review coin farming).
-- Originals have creator_id = null, so this doesn't restrict reviewing them.
create policy "Signed-in users can review stories they didn't create" on story_reviews for insert with check (
  auth.uid() = author_id
  and not exists (select 1 from stories where stories.id = story_reviews.story_id and stories.creator_id = auth.uid())
);
create policy "Users can update own story reviews" on story_reviews for update using (auth.uid() = author_id);
create policy "Users can delete own story reviews" on story_reviews for delete using (auth.uid() = author_id);

alter table coin_transactions drop constraint if exists coin_transactions_type_check;
alter table coin_transactions add constraint coin_transactions_type_check
  check (type in ('purchase', 'spend', 'refund', 'admin_grant', 'signup_bonus', 'review_reward'));

-- Pays out 1 coin the first (and only, thanks to the unique constraint
-- above) time a reader reviews a given story. Runs as SECURITY DEFINER
-- since profiles.coin_balance isn't directly UPDATE-able by users.
create or replace function public.handle_new_story_review()
returns trigger as $$
begin
  update profiles set coin_balance = coin_balance + 1 where id = new.author_id;
  insert into coin_transactions (user_id, amount, type) values (new.author_id, 1, 'review_reward');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_story_review_created on story_reviews;
create trigger on_story_review_created
  after insert on story_reviews
  for each row execute procedure public.handle_new_story_review();
