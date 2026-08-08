-- Paragraph-level "continue reading" bookmarks. One row per (user, story)
-- -- it always reflects the reader's most recent position in that story,
-- overwritten as they read further (or back up). Low-stakes data (just a
-- scroll position, no coins/security concern), so unlike coin_transactions
-- etc. this allows direct client upsert under RLS rather than routing
-- through a SECURITY DEFINER function.

create table if not exists reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  story_id uuid not null references stories(id) on delete cascade,
  chapter_id uuid not null references story_chapters(id) on delete cascade,
  chapter_number integer not null,
  paragraph_index integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, story_id)
);

alter table reading_progress enable row level security;

create policy "Users can view own reading progress" on reading_progress for select using (auth.uid() = user_id);
create policy "Users can upsert own reading progress" on reading_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own reading progress" on reading_progress for update using (auth.uid() = user_id);
