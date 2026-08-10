import { listOriginals } from "@/src/lib/stories-db";
import Cover from "@/src/components/Cover";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ComicMob Originals — Sci-Fi, Horror & Romance",
  description:
    "The Four Volumes: ComicMob's original web novels spanning sci-fi, horror, and romance — light novel first, evolving toward manga and animation.",
};

export default async function OriginalsPage() {
  const originals = await listOriginals();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-widest2 text-foil">
        ComicMob Originals
      </p>
      <h1 className="mx-auto max-w-2xl text-center font-display text-4xl italic leading-tight text-paper sm:text-5xl">
        The Four Volumes
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-paper-soft">
        The Four Volumes are ComicMob&rsquo;s flagship original stories — imagined,
        written, and illustrated in-house rather than sourced from outside
        publishers. Each begins as a light novel, evolving toward manga or
        manhwa and eventually animation as its readership grows: a sci-fi war
        epic, a mystery drama about orphaned outcasts, a horror tale bound to
        a cursed book, and a quiet romance between two lonely people finding
        each other.
      </p>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {originals.map((story) => (
          
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
    </div>
  );
}
