-- Chapter access control: "5 free chapters per story, then buy with coins
-- or wait 7 days for it to open up for free."
--
-- Run this in Supabase Dashboard -> SQL Editor, after supabase_schema.sql
-- and supabase_schema_stories.sql.
--
-- IMPORTANT CONTEXT: story_chapters currently has
--   create policy "Chapters are publicly viewable" on story_chapters for select using (true);
-- which means the `content` column is readable by ANYONE hitting the
-- Supabase REST API directly with the public anon key -- not just through
-- your Next.js pages. RLS is row-level, not column-level, so a paywall
-- coded only into page.tsx would be cosmetic; the content would still be
-- one curl command away. This migration locks `content` (and coin_balance)
-- behind column-level privileges, so they can only be read/written through
-- the SECURITY DEFINER functions below, which enforce the unlock logic
-- inside the database itself.

-- ===== 1. New columns on story_chapters =====
alter table story_chapters add column if not exists published_at timestamptz;
alter table story_chapters add column if not exists coin_price integer not null default 20;

-- Backfill: existing chapters published_at = their original created_at, so
-- nothing already live suddenly locks for readers when this ships. Any
-- chapter you publish after running this migration gets published_at =
-- now() automatically.
update story_chapters set published_at = created_at where published_at is null;
alter table story_chapters alter column published_at set not null;
alter table story_chapters alter column published_at set default now();

-- ===== 2. Coin wallet on profiles =====
alter table profiles add column if not exists coin_balance integer not null default 0;

-- ===== 3. Ledger of every coin movement =====
create table if not exists coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount integer not null, -- positive = credit (purchase/refund/grant), negative = debit (spend)
  type text not null check (type in ('purchase', 'spend', 'refund', 'admin_grant')),
  chapter_id uuid references story_chapters(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ===== 4. Which chapters a user has unlocked early with coins =====
create table if not exists chapter_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  chapter_id uuid not null references story_chapters(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

alter table coin_transactions enable row level security;
alter table chapter_unlocks enable row level security;

-- Read-only for the owning user; INSERT is deliberately not granted to
-- anyone here -- all writes happen inside the SECURITY DEFINER functions
-- below, which run as the table owner and bypass these policies. This
-- stops someone from PATCHing a fake unlock or transaction row directly.
create policy "Users can view own coin transactions" on coin_transactions for select using (auth.uid() = user_id);
create policy "Users can view own chapter unlocks" on chapter_unlocks for select using (auth.uid() = user_id);

-- ===== 5. Lock down sensitive columns =====
-- story_chapters.content: only readable through get_chapter_access() below.
revoke select on story_chapters from anon, authenticated;
grant select (id, story_id, number, title, published_at, coin_price, created_at)
  on story_chapters to anon, authenticated;

-- profiles.coin_balance: only readable through get_my_coin_balance(), and
-- never directly writable by the user (closes the "PATCH my own balance
-- to 999999" hole left open by the existing "auth.uid() = id" update policy).
revoke select on profiles from anon, authenticated;
grant select (id, username, display_name, role, created_at)
  on profiles to anon, authenticated;
revoke update (coin_balance) on profiles from authenticated;

-- ===== 6. get_chapter_access: the single source of truth for "can this
-- reader see this chapter", called instead of selecting story_chapters
-- directly. Returns content only when access is allowed. =====
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
    'unlocked_with_coins', v_unlocked_with_coins
  );
end;
$$;

grant execute on function get_chapter_access(uuid, int) to anon, authenticated;

-- ===== 7. unlock_chapter_with_coins: atomic spend + unlock. Row-locks the
-- profile so a double-click can't spend coins twice. =====
create or replace function unlock_chapter_with_coins(p_chapter_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_price integer;
  v_balance integer;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'reason', 'not_signed_in');
  end if;

  select coin_price into v_price from story_chapters where id = p_chapter_id;
  if not found then
    return jsonb_build_object('success', false, 'reason', 'chapter_not_found');
  end if;

  if exists (select 1 from chapter_unlocks where user_id = v_user_id and chapter_id = p_chapter_id) then
    return jsonb_build_object('success', true, 'already_unlocked', true);
  end if;

  select coin_balance into v_balance from profiles where id = v_user_id for update;

  if v_balance < v_price then
    return jsonb_build_object('success', false, 'reason', 'insufficient_coins', 'balance', v_balance, 'price', v_price);
  end if;

  update profiles set coin_balance = coin_balance - v_price where id = v_user_id;

  insert into coin_transactions (user_id, amount, type, chapter_id)
    values (v_user_id, -v_price, 'spend', p_chapter_id);

  insert into chapter_unlocks (user_id, chapter_id)
    values (v_user_id, p_chapter_id)
    on conflict do nothing;

  return jsonb_build_object('success', true, 'new_balance', v_balance - v_price);
end;
$$;

grant execute on function unlock_chapter_with_coins(uuid) to authenticated;

-- ===== 8. get_my_coin_balance: reader's own wallet balance =====
create or replace function get_my_coin_balance()
returns integer
language sql
security definer
set search_path = public
as $$
  select coin_balance from profiles where id = auth.uid();
$$;

grant execute on function get_my_coin_balance() to authenticated;

-- ===== 9. grant_coins: used by the Razorpay webhook (service role) to
-- credit a user after a verified payment. Not exposed to anon/authenticated. =====
create or replace function grant_coins(p_user_id uuid, p_amount integer, p_type text default 'purchase')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update profiles set coin_balance = coin_balance + p_amount where id = p_user_id;
  insert into coin_transactions (user_id, amount, type) values (p_user_id, p_amount, p_type);
end;
$$;
-- Deliberately no GRANT EXECUTE here -- only callable via the service role
-- key from a trusted server-side webhook, once Razorpay is wired up.
