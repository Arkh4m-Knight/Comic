-- Reading Pulse: lightweight, anonymous "N people reading this chapter now"
-- Run this in Supabase SQL Editor (same as supabase_schema.sql) after the
-- main schema. No RLS policies are defined on purpose — this table is only
-- ever touched by the server using the service_role key (see
-- src/lib/supabase/admin.ts), never directly from the browser.

create table if not exists reading_sessions (
  session_id text primary key,
  comic_id text not null,
  episode_id text not null,
  last_seen timestamptz not null default now()
);

alter table reading_sessions enable row level security;
-- Intentionally no policies: only the service_role key (server-side) can
-- read/write this table. The anon key gets nothing.

create index if not exists reading_sessions_episode_idx on reading_sessions (episode_id, last_seen);
