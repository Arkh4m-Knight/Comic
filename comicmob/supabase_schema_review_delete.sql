-- Lets a reader delete their own review. The DELETE RLS policy already
-- exists (from supabase_schema_daily_pass_and_reviews.sql), so this file
-- only adds the piece that's missing: clawing back the 1-coin reward on
-- delete, so post -> delete -> repost can't be used to farm coins forever.
-- (Without this, deleting reopens the unique(story_id, author_id) slot,
-- letting someone earn +1 coin every time they write and delete a fresh
-- review.)

alter table coin_transactions drop constraint if exists coin_transactions_type_check;
alter table coin_transactions add constraint coin_transactions_type_check
  check (type in ('purchase', 'spend', 'refund', 'admin_grant', 'signup_bonus', 'review_reward', 'review_reward_reversed'));

create or replace function public.handle_deleted_story_review()
returns trigger as $$
declare
  v_current_balance integer;
  v_deduction integer;
begin
  select coin_balance into v_current_balance from profiles where id = old.author_id for update;
  -- Claw back at most what they still have -- never push balance negative
  -- just because they already spent the coin elsewhere.
  v_deduction := least(1, coalesce(v_current_balance, 0));

  if v_deduction > 0 then
    update profiles set coin_balance = coin_balance - v_deduction where id = old.author_id;
    insert into coin_transactions (user_id, amount, type) values (old.author_id, -v_deduction, 'review_reward_reversed');
  end if;

  return old;
end;
$$ language plpgsql security definer;

drop trigger if exists on_story_review_deleted on story_reviews;
create trigger on_story_review_deleted
  after delete on story_reviews
  for each row execute procedure public.handle_deleted_story_review();
