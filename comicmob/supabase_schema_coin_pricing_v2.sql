-- Pricing tweaks, run after supabase_schema_chapter_access.sql:
--   1. Lower the flat per-chapter price (still the same price for every
--      chapter sitewide -- intentionally not using per-chapter pricing,
--      to keep the unlock cost predictable and fair for readers, even
--      though the coin_price column technically supports varying it).
--   2. Grant every new signup a small free coin balance, so they can try
--      the unlock flow without having to pay first.

-- ===== 1. Lower the default + apply to existing chapters still on the
-- old default (none have been manually priced yet, so this is safe) =====
alter table story_chapters alter column coin_price set default 10;
update story_chapters set coin_price = 10 where coin_price = 20;

-- ===== 2. Allow a 'signup_bonus' ledger entry type =====
alter table coin_transactions drop constraint if exists coin_transactions_type_check;
alter table coin_transactions add constraint coin_transactions_type_check
  check (type in ('purchase', 'spend', 'refund', 'admin_grant', 'signup_bonus'));

-- ===== 3. Grant starter coins on signup =====
-- Replaces the handle_new_user() trigger function from supabase_schema.sql
-- to also seed coin_balance and log it in the ledger. The trigger itself
-- (on_auth_user_created) already exists and points at this function name,
-- so no need to recreate the trigger -- redefining the function is enough.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_signup_bonus integer := 15;
begin
  insert into public.profiles (id, username, display_name, coin_balance)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    v_signup_bonus
  );

  insert into public.coin_transactions (user_id, amount, type)
  values (new.id, v_signup_bonus, 'signup_bonus');

  return new;
end;
$$ language plpgsql security definer;
