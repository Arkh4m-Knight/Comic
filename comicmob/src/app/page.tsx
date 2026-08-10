import GoldGlyph from "@/src/components/GoldGlyph";

// app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ComicMob — Original Web Novels: Sci-Fi, Horror & Romance",
  description:
    "Four worlds, one studio. Read original web novels across sci-fi, horror, romance, and mystery — with a path from light novel to manga to animation.",
};

export default function HomePage() {
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
          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="/originals"
              className="rounded-sm bg-foil px-7 py-3 text-sm font-semibold text-ink-950"
            >
              Explore the Originals
            </a>
            <a
              href="/community"
              className="rounded-sm border border-line px-7 py-3 text-sm text-paper hover:border-foil"
            >
              Browse Community
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
