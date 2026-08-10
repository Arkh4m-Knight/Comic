import { listCommunityStories } from "@/src/lib/stories-db";
import Cover from "@/src/components/Cover";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Stories — Original Web Novels | ComicMob",
  description:
    "Discover original web novels published by the ComicMob community. Read, review, and support independent creators, or publish your own story for free.",
};

export default async function CommunityPage() {
  const community = await listCommunityStories();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">
        From the Community
      </p>
      <h1 className="mx-auto max-w-2xl text-center font-display text-4xl italic leading-tight text-paper sm:text-5xl">
        Stories from Our Readers
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-paper-soft">
        ComicMob isn&rsquo;t just the Four Volumes — it&rsquo;s a platform for
        anyone to publish their own web novel or manga script, free.
        Community stories sit alongside the Originals, discoverable by any
        reader browsing the site. Explore what other creators have published
        below, or{" "}
        <a href="/publish" className="underline hover:text-foil">
          start your own
        </a>
        .
      </p>

      {community.length === 0 ? (
        <p className="mt-16 text-center text-sm text-paper-soft">
          No community stories yet —{" "}
          <a href="/publish" className="underline hover:text-foil">
            be the first to publish one
          </a>
          .
        </p>
      ) : (
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {community.map((story) => (
            
              key={story.id}
              href={`/story/${story.slug}`}
              className="group block"
              style={{ "--story-accent": story.accent } as React.CSSProperties}
            >
              <div className="overflow-hidden rounded-sm border border-line transition-colors group-hover:border-[var(--story-accent)]">
                <Cover
                  title={story.title}
                  accent={story.accent}
                  coverUrl={story.cover_url}
                  className="aspect-[2/3] w-full transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="pt-4">
                <p
                  className="text-[10px] font-medium uppercase tracking-widest2"
                  style={{ color: story.accent }}
                >
                  {story.genres.join(" · ")}
                </p>
                <p className="mt-1 font-display text-xl italic text-paper">{story.title}</p>
                {story.creator_name && (
                  <p className="mt-1 text-[11px] text-paper-faint">by {story.creator_name}</p>
                )}
                <p className="mt-2 text-xs leading-relaxed text-paper-soft">{story.hook}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
