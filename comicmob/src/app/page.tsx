import { listStories } from "@/src/lib/stories";
import StoryCover from "@/src/components/StoryCover";
import GoldGlyph from "@/src/components/GoldGlyph";

export default function HomePage() {
  const stories = listStories();

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
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-10 text-center text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">
          The Four Volumes
        </p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((story) => (
            <a
              key={story.id}
              href={`/story/${story.slug}`}
              className="group block"
              style={{ "--story-accent": story.accent } as React.CSSProperties}
            >
              <div className="overflow-hidden rounded-sm border border-line transition-colors group-hover:border-[var(--story-accent)]">
                <StoryCover
                  title={story.title}
                  accent={story.accent}
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
    </div>
  );
}
