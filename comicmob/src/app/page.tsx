import { listOriginals, listCommunityStories } from "@/src/lib/stories-db";
import Cover from "@/src/components/Cover";
import GoldGlyph from "@/src/components/GoldGlyph";

// app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ComicMob — Original Web Novels: Sci-Fi, Horror & Romance",
  description:
    "Four worlds, one studio. Read original web novels across sci-fi, horror, romance, and mystery — with a path from light novel to manga to animation.",
};

export default async function HomePage() {
  const originals = await listOriginals();
  const community = await listCommunityStories();

  return (
    <div>
      {/* Studio intro */}
      <section className="relative overflow-hidden border-b border-line">
        <GoldGlyph className="absolute -right-20 -top-20 h-72 w-72 animate-slow-spin opacity-60" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-28 text-center">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-widest2 text-foil">
            ComicMob Originals
          </p>
          <h1 className="font-display text-5xl italic leading-tight text-paper sm:text-6xl">
            Four worlds.<br />One studio.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-paper-soft">
            ComicMob is building original stories from the ground up — light novel
            first, then manhwa or manga, and eventually animation, shaped by where
            readers want each world to go next.
          </p>
        </div>
      </section>

      {/* Four Volumes shelf */}
      <section id="originals" className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-10 text-center text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">
          The Four Volumes
        </p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {originals.map((story) => (
            <a
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
                <p className="mt-2 text-xs leading-relaxed text-paper-soft">{story.hook}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Community stories */}
      <section id="community" className="mx-auto max-w-6xl border-t border-line px-6 py-20">
        <div className="mb-10 flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">
            From the Community
          </p>
          <a
            href="/publish"
            className="rounded-sm border border-line px-4 py-2 text-xs uppercase tracking-widest2 text-paper hover:border-foil"
          >
            Publish Your Own
          </a>
        </div>

        {community.length === 0 ? (
          <p className="text-sm text-paper-soft">
            No community stories yet — be the first to publish one.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {community.map((story) => (
              <a
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
      </section>
    </div>
  );
}
