-- Adds real cover art support to stories. Run in Supabase SQL Editor.

alter table stories add column if not exists cover_url text;

update stories set cover_url = '/covers/orphanage.jpg' where slug = 'orphanage';
update stories set cover_url = '/covers/unloved-boy.jpg' where slug = 'unloved-boy';
