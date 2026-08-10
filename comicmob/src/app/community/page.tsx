import { listCommunityStories } from "@/src/lib/stories-db";
import StoryGrid from "@/src/components/StoryGrid";
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
        <div className="mt-16">
          <StoryGrid stories={community} showCreator />
        </div>
      )}
    </div>
  );
}
