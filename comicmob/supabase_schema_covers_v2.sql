-- Updates titles to match the new cover art exactly, and sets/refreshes
-- cover_url for all three (Orphanage, Chaabuk, Unloved Boy). Run in
-- Supabase SQL Editor. Slugs stay the same, so existing links keep working.

update stories set title = 'Orphans', cover_url = '/covers/orphanage.jpg' where slug = 'orphanage';
update stories set title = 'Chabuk', cover_url = '/covers/chaabuk.jpg' where slug = 'chaabuk';
update stories set title = 'Unloved Boy', cover_url = '/covers/unloved-boy.jpg' where slug = 'unloved-boy';
