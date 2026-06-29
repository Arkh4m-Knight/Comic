-- Sets up file storage for user-uploaded cover art. Run in Supabase SQL
-- Editor. This creates a storage "bucket" (a folder for files, separate
-- from your database tables) and rules for who can upload/read from it.

insert into storage.buckets (id, name, public)
values ('story-covers', 'story-covers', true)
on conflict (id) do nothing;

-- Anyone can view cover images (they're meant to be public on the site)
create policy "Cover images are publicly viewable"
on storage.objects for select
using (bucket_id = 'story-covers');

-- Signed-in users can only upload into a folder named after their own
-- user ID (e.g. "abc123/cover.jpg") -- this is the standard pattern for
-- keeping each user's uploads separate and self-owned.
create policy "Users can upload their own covers"
on storage.objects for insert
with check (
  bucket_id = 'story-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own covers"
on storage.objects for update
using (
  bucket_id = 'story-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own covers"
on storage.objects for delete
using (
  bucket_id = 'story-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);
