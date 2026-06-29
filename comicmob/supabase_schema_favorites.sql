-- Lets signed-in readers save/favorite stories to their own personal
-- list. Run in Supabase SQL Editor.

create table if not exists favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  story_id uuid not null references stories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, story_id)
);

alter table favorites enable row level security;

-- Each user can only see/manage their own saved list, never anyone else's.
create policy "Users can view own favorites" on favorites for select using (auth.uid() = user_id);
create policy "Users can add own favorites" on favorites for insert with check (auth.uid() = user_id);
create policy "Users can remove own favorites" on favorites for delete using (auth.uid() = user_id);
