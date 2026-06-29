-- Adds the real cover art for Lock X and updates its title to match.
-- Run in Supabase SQL Editor.

update stories set title = 'Prana Wars: Lock X', cover_url = '/covers/lock-x.jpg' where slug = 'lock-x';
