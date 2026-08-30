import { getStoryBySlug, getStoryReviews, getReadingProgress } from "@/src/lib/stories-db";
import OpenBook from "@/src/components/OpenBook";
import FavoriteButton from "@/src/components/FavoriteButton";
import StoryReviews from "@/src/components/StoryReviews";
import { createClient } from "@/src/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

// app/story/[slug]/page.tsx
import type { Metadata } from "next";
import { SITE_NAME, clampDescription } from "@/src/lib/seo";

// Hand-written copy for the Originals. These are the pages we actually want to
// rank, so the titles and descriptions are tuned rather than generated: each
// leads with the story name (branded search is the realistic win), states the
// genre, and ends with a reason to click.
const STORY_META: Record<string, { title: string; description: string }> = {
  "lock-x": {
    title: "Prana Wars: Lock X — Sci-Fi Web Novel, Read Free | ComicMob",
    description:
      "A sinister kingdom wants to rule the universe. Scattered strangers are all that stand in its way. Prana Wars: Lock X is a sci-fi web novel — start free.",
  },
  orphanage: {
    title: "Orphans — Mystery Action Web Novel | Read Free on ComicMob",
    description:
      "A group of orphans fights for justice in a world that left them behind. Orphans is an original mystery and action web novel — start reading free on ComicMob.",
  },
  chaabuk: {
    title: "Chabuk — Horror Web Novel | Read Free on ComicMob",
    description:
      "A book bound by an evil spirit hungers to rule the world. Chabuk is an original horror drama light novel — start reading the free chapters on ComicMob.",
  },
  "unloved-boy": {
    title: "Unloved Boy — Romance Web Novel | Read Free on ComicMob",
    description:
      "Two lonely people meet and carve out a path of their own. Unloved Boy is an original romance drama web novel — start reading the free chapters on ComicMob.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const handWritten = STORY_META[params.slug];
  const story = await getStoryBySlug(params.slug);

  // Unknown slug: don't let a 404 shell sit in the index under the site-wide
  // default title.
  if (!story) {
    return {
      title: "Story not found | ComicMob",
      robots: { index: false, follow: true },
    };
  }

  // Community stories previously all inherited the bare "ComicMob" title,
  // which made every one of them look like a duplicate to a crawler. Fall back
  // to the story's own title, genres and hook instead.
  const byline = story.creator_name ? ` by ${story.creator_name}` : "";
  const title =
    handWritten?.title ??
    `${story.title} — ${story.genres.join(" · ")} Web Novel | ComicMob`;
  const description = clampDescription(
    handWritten?.description ??
      `${story.hook} Read ${story.title}${byline} free on ComicMob — original serialised fiction from independent writers.`,
  );

  const path = `/story/${story.slug}`;
  const images = story.cover_url
    ? [{ url: story.cover_url, alt: `${story.title} cover art` }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "book",
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: story.cover_url ? [story.cover_url] : undefined,
    },
  };
}

function RoadmapStep({
  label,
  available,
  accent,
}: {
  label: string;
  available: boolean;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-line py-5 last:border-b-0">
      <div
        className="h-2 w-2 flex-shrink-0 rounded-full"
        style={{ backgroundColor: available ? accent : "#3A3A3F" }}
      />
      <div className="flex-1">
        <p className="font-display text-lg italic text-paper">{label}</p>
      </div>
      <span
        className="text-[10px] font-medium uppercase tracking-widest2"
        style={{ color: available ? accent : undefined }}
      >
        <span className={available ? "" : "text-paper-faint"}>
          {available ? "Available Now" : "In Development"}
        </span>
      </span>
    </div>
  );
}

export default async function StoryHubPage({ params }: { params: { slug: string } }) {
  const story = await getStoryBySlug(params.slug);
  if (!story) return notFound();

  const [reviews, supabase] = await Promise.all([getStoryReviews(story.id), createClient()]);
  const { data: userData } = await supabase.auth.getUser();
  const isOwnStory = !!userData.user && userData.user.id === story.creator_id;
  const progress = userData.user ? await getReadingProgress(userData.user.id, story.id) : null;
  const resumeChapter = progress?.chapter_number ?? null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/"
        className="mb-10 inline-block text-xs uppercase tracking-widest2 text-paper-soft hover:text-paper"
      >
        ← All Stories
      </Link>

      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="flex justify-center">
          {story.cover_url ? (
            <div
              className="w-full max-w-xs overflow-hidden rounded-sm border"
              style={{ borderColor: story.accent + "80" }}
            >
              <img src={story.cover_url} alt={story.title} className="aspect-[2/3] w-full object-cover" />
            </div>
          ) : (
            <OpenBook accent={story.accent} className="w-full max-w-md" />
          )}
        </div>

        <div>
          <p
            className="mb-3 text-[11px] font-medium uppercase tracking-widest2"
            style={{ color: story.accent }}
          >
            {story.genres.join(" · ")}
          </p>
          <h1 className="font-display text-4xl italic leading-tight text-paper sm:text-5xl">
            {story.title}
          </h1>
          {!story.is_original && story.creator_name && (
            <p className="mt-2 text-xs uppercase tracking-widest2 text-paper-faint">
              by {story.creator_name}
            </p>
          )}
          <p
            className="mt-6 max-w-xl border-l-2 pl-4 font-display text-xl italic leading-relaxed text-paper-soft"
            style={{ borderColor: story.accent }}
          >
            &ldquo;{story.hook}&rdquo;
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {story.chapter_count > 0 && (
              <Link
                href={`/story/${story.slug}/chapter/${resumeChapter ?? 1}`}
                className="inline-block rounded-sm px-7 py-3 text-sm font-semibold text-ink-950"
                style={{ backgroundColor: story.accent }}
              >
                {resumeChapter ? `Continue — Chapter ${resumeChapter}` : "Read Online"}
              </Link>
            )}
            <FavoriteButton
              storyId={story.id}
              storySlug={story.slug}
              genre={story.genres.join(", ")}
              accent={story.accent}
            />
          </div>

          {story.is_original ? (
            <div className="mt-12">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">
                The Roadmap
              </p>
              <div className="rounded-sm border border-line px-2">
                <RoadmapStep label="Light Novel" available={story.chapter_count > 0} accent={story.accent} />
                <RoadmapStep label="Manga / Manhwa" available={false} accent={story.accent} />
                <RoadmapStep label="Animation" available={false} accent={story.accent} />
              </div>
              <p className="mt-4 text-xs text-paper-faint">
                Each format moves forward as the story and reader demand grow.
              </p>
            </div>
          ) : (
            <p className="mt-12 text-xs text-paper-faint">
              {story.chapter_count} chapter{story.chapter_count === 1 ? "" : "s"} published
            </p>
          )}
        </div>
      </div>

      <StoryReviews
        storyId={story.id}
        storySlug={story.slug}
        accent={story.accent}
        initialReviews={reviews}
        isOwnStory={isOwnStory}
      />
    </div>
  );
}
