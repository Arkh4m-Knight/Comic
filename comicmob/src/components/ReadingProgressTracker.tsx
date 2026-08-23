"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { pushToDataLayer } from "@/src/lib/gtm";

interface ReadingProgressTrackerProps {
  storyId: string;
  storySlug: string;
  genre: string;
  chapterId: string;
  chapterNumber: number;
  resumeParagraphIndex: number | null;
}

const PROGRESS_MILESTONES = [25, 50, 75, 100] as const;

const SAVE_DEBOUNCE_MS = 2000;

export default function ReadingProgressTracker({
  storyId,
  storySlug,
  genre,
  chapterId,
  chapterNumber,
  resumeParagraphIndex,
}: ReadingProgressTrackerProps) {
  // Tracks the topmost paragraph currently visible in the viewport --
  // this is what "where the reader stopped" means at any given moment.
  const currentParagraphIndex = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasScrolledToResume = useRef(false);

  // Furthest point reached in THIS chapter, and which of the 25/50/75/100%
  // GTM milestones have already fired for it. Both reset per chapter below --
  // reading progress is scoped to one chapter, not the whole story.
  const maxParagraphIndexReached = useRef(0);
  const firedMilestones = useRef<Set<number>>(new Set());

  function checkMilestones(totalParagraphs: number) {
    if (totalParagraphs === 0) return;
    const percent = ((maxParagraphIndexReached.current + 1) / totalParagraphs) * 100;
    for (const milestone of PROGRESS_MILESTONES) {
      if (percent >= milestone && !firedMilestones.current.has(milestone)) {
        firedMilestones.current.add(milestone);
        pushToDataLayer({
          event: "reading_progress",
          story_slug: storySlug,
          genre,
          chapter_number: chapterNumber,
          progress_percent: milestone,
        });
      }
    }
  }

  async function save() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from("reading_progress").upsert(
      {
        user_id: userData.user.id,
        story_id: storyId,
        chapter_id: chapterId,
        chapter_number: chapterNumber,
        paragraph_index: currentParagraphIndex.current,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,story_id" }
    );
  }

  function scheduleSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, SAVE_DEBOUNCE_MS);
  }

  // Scroll to the saved position once, on first mount, only when this
  // page IS the bookmarked chapter. Opening a different chapter never
  // auto-scrolls -- it starts at the top like normal, and simply starts
  // tracking a fresh position in this new chapter.
  useEffect(() => {
    if (hasScrolledToResume.current) return;
    if (resumeParagraphIndex === null || resumeParagraphIndex === 0) return;

    const el = document.getElementById(`para-${resumeParagraphIndex}`);
    if (el) {
      el.scrollIntoView({ block: "start" });
      hasScrolledToResume.current = true;
    }
  }, [resumeParagraphIndex]);

  useEffect(() => {
    // New chapter -- reset progress tracking so milestones can fire again.
    maxParagraphIndexReached.current = 0;
    firedMilestones.current = new Set();

    const paragraphs = Array.from(document.querySelectorAll("[data-paragraph-index]"));
    if (paragraphs.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Among paragraphs currently intersecting the viewport, track the
        // one with the smallest index (topmost) as the reading position.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => Number((e.target as HTMLElement).dataset.paragraphIndex))
          .filter((n) => !Number.isNaN(n));

        if (visible.length > 0) {
          currentParagraphIndex.current = Math.min(...visible);

          const highestVisible = Math.max(...visible);
          if (highestVisible > maxParagraphIndexReached.current) {
            maxParagraphIndexReached.current = highestVisible;
            checkMilestones(paragraphs.length);
          }

          scheduleSave();
        }
      },
      { rootMargin: "0px 0px -70% 0px" } // "in view" = near the top of the viewport
    );

    paragraphs.forEach((p) => observer.observe(p));

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") save();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      save(); // best-effort save on unmount (e.g. navigating to another chapter)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  return null;
}
