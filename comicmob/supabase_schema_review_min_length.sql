-- Minimum review length, to cut down on one-word reviews written purely
-- to grab the 1-coin reward. Enforced at the DB level (not just the API
-- route or the UI) since story_reviews has a direct client-insert RLS
-- policy -- a constraint here is the only layer that can't be bypassed.

alter table story_reviews drop constraint if exists story_reviews_content_min_length;
alter table story_reviews add constraint story_reviews_content_min_length
  check (char_length(trim(content)) >= 20);
