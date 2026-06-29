-- Lets one designated "Admin" account write chapters for the 4
-- ComicMob Originals (which have no creator_id, since they're
-- studio-owned, not tied to any one user). Run in Supabase SQL Editor.

-- Step 1: mark your studio account as Admin. Replace the email below
-- with whichever account you signed up with as the studio author.
update profiles set role = 'Admin'
where id = (select id from auth.users where email = 'officialcomicmob@gmail.com');

-- Step 2: allow Admins to add/edit chapters on Original stories.
create policy "Admins can manage Original chapters"
on story_chapters for all
using (
  exists (
    select 1 from stories
    where stories.id = story_chapters.story_id
    and stories.is_original = true
  )
  and exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'Admin'
  )
);

-- Step 3 (optional, lets the admin also edit an Original's own details
-- like title/hook/cover later, not just its chapters):
create policy "Admins can update Original stories"
on stories for update
using (
  is_original = true
  and exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'Admin'
  )
);
