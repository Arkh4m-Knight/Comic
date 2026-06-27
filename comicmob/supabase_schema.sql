-- ComicMob database schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

-- 1. Profiles table (extends Supabase's built-in auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  role text not null default 'Reader' check (role in ('Reader', 'Creator', 'Reviewer', 'Admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Comics table
create table if not exists comics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cover_url text,
  genres text[] not null default '{}',
  format text not null check (format in ('Comic', 'Manga', 'Manhwa')),
  creator_id uuid references profiles(id) on delete set null,
  avg_rating numeric(3,2) not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Episodes (chapters) belonging to a comic
create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  comic_id uuid not null references comics(id) on delete cascade,
  title text not null,
  number int not null,
  image_urls text[] not null default '{}',
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. Reviews
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  comic_id uuid not null references comics(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  tags jsonb not null default '{}',
  content text not null,
  type text not null default 'Reader' check (type in ('Reader', 'Critic')),
  created_at timestamptz not null default now()
);

-- 5. Light novels
create table if not exists light_novels (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  cover_url text,
  synopsis text,
  created_at timestamptz not null default now()
);

-- 6. User library (which comics a reader has saved)
create table if not exists library (
  user_id uuid not null references profiles(id) on delete cascade,
  comic_id uuid not null references comics(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, comic_id)
);

-- 7. Subscriptions (for Stripe integration later)
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  status text not null default 'inactive' check (status in ('inactive', 'active', 'past_due', 'canceled')),
  plan text,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- ===== Row Level Security =====
alter table profiles enable row level security;
alter table comics enable row level security;
alter table episodes enable row level security;
alter table reviews enable row level security;
alter table light_novels enable row level security;
alter table library enable row level security;
alter table subscriptions enable row level security;

-- Profiles: anyone can view profiles (needed to show usernames/creator names), only owner can edit their own
create policy "Profiles are publicly viewable" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Comics: publicly readable; only the creator can edit/delete their own
create policy "Comics are publicly viewable" on comics for select using (true);
create policy "Creators can insert own comics" on comics for insert with check (auth.uid() = creator_id);
create policy "Creators can update own comics" on comics for update using (auth.uid() = creator_id);
create policy "Creators can delete own comics" on comics for delete using (auth.uid() = creator_id);

-- Episodes: publicly readable; only the parent comic's creator can manage
create policy "Episodes are publicly viewable" on episodes for select using (true);
create policy "Creators can manage own episodes" on episodes for all using (
  exists (select 1 from comics where comics.id = episodes.comic_id and comics.creator_id = auth.uid())
);

-- Reviews: publicly readable; logged-in users can post their own, edit/delete their own
create policy "Reviews are publicly viewable" on reviews for select using (true);
create policy "Users can insert own reviews" on reviews for insert with check (auth.uid() = author_id);
create policy "Users can update own reviews" on reviews for update using (auth.uid() = author_id);
create policy "Users can delete own reviews" on reviews for delete using (auth.uid() = author_id);

-- Light novels: publicly readable; any logged-in user can add for now (tighten later if needed)
create policy "Light novels are publicly viewable" on light_novels for select using (true);
create policy "Logged in users can add light novels" on light_novels for insert with check (auth.uid() is not null);

-- Library: users can only see/manage their own saved list
create policy "Users can view own library" on library for select using (auth.uid() = user_id);
create policy "Users can add to own library" on library for insert with check (auth.uid() = user_id);
create policy "Users can remove from own library" on library for delete using (auth.uid() = user_id);

-- Subscriptions: users can view their own only; writes happen via service role (Stripe webhook), not directly by users
create policy "Users can view own subscription" on subscriptions for select using (auth.uid() = user_id);
