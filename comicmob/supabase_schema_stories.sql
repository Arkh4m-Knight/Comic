-- Stories & chapters: the real schema backing both the 4 ComicMob
-- Originals and any community-published stories. Run this in Supabase
-- SQL Editor after the original supabase_schema.sql (this is additive,
-- doesn't touch the old comics/episodes tables, which are unused now).

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  hook text not null,
  genres text[] not null default '{}',
  accent text not null default '#C9A227',
  is_original boolean not null default false,
  creator_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists story_chapters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  number int not null,
  title text not null,
  content text not null, -- paragraphs joined by \n\n
  created_at timestamptz not null default now(),
  unique (story_id, number)
);

alter table stories enable row level security;
alter table story_chapters enable row level security;

-- Stories: publicly readable; any signed-in user can create their own;
-- only the creator can edit/delete their own. The 4 Originals are
-- inserted directly by you (service role / SQL editor), not through
-- this policy, so creator_id stays null for those.
create policy "Stories are publicly viewable" on stories for select using (true);
create policy "Signed-in users can create stories" on stories for insert with check (auth.uid() = creator_id);
create policy "Creators can update own stories" on stories for update using (auth.uid() = creator_id);
create policy "Creators can delete own stories" on stories for delete using (auth.uid() = creator_id);

-- Chapters: publicly readable; only the parent story's creator can manage
create policy "Chapters are publicly viewable" on story_chapters for select using (true);
create policy "Creators can manage own chapters" on story_chapters for all using (
  exists (select 1 from stories where stories.id = story_chapters.story_id and stories.creator_id = auth.uid())
);

-- Seed the 4 ComicMob Originals (creator_id left null -- these are studio
-- stories, not tied to any one user account)
insert into stories (slug, title, hook, genres, accent, is_original, creator_id)
values
  ('orphanage', 'The Orphanage', 'A group of orphans fights for justice in a world that left them behind.', array['Mystery','Action','Drama'], '#C9A227', true, null),
  ('unloved-boy', 'The Unloved Boy', 'Two lonely individuals meet and carve out a path of their own.', array['Romance','Drama'], '#B5746B', true, null),
  ('chaabuk', 'Chaabuk', 'A book bound by an evil spirit seeks to dominate the world.', array['Horror','Drama'], '#7A2424', true, null),
  ('lock-x', 'Lock X', 'Scattered individuals unite against a sinister kingdom that wants to rule the universe.', array['Sci-Fi','Action','Adventure'], '#3E6E8C', true, null)
on conflict (slug) do nothing;
