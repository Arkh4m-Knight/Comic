"use client";
import Link from "next/link";
import { useState } from "react";
import ComicViewer from "@/src/components/ComicViewer";
import BookmarkButton from "@/src/components/BookmarkButton";
import ReadingPulse from "@/src/components/ReadingPulse";
import { getComic } from "@/src/lib/mock";
import { Comic, Episode } from "@/src/types";

export default function ComicReaderPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const comic = getComic(id) as Comic | undefined;
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [viewMode, setViewMode] = useState<"reveal" | "scroll" | "page">("reveal");

  if (!comic) {
    return <p className="mx-auto max-w-6xl px-6 py-16 text-paper-soft">Comic not found.</p>;
  }

  const episodes: Episode[] = comic.episodes;
  const currentEp = episodes[currentEpisode];

  const goToPrevious = () => currentEpisode > 0 && setCurrentEpisode(currentEpisode - 1);
  const goToNext = () => currentEpisode < episodes.length - 1 && setCurrentEpisode(currentEpisode + 1);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link className="rounded-sm border border-line px-3 py-1.5 text-xs uppercase tracking-widest2 text-paper-soft hover:border-foil" href="/reader">
            ← Back
          </Link>
          <h1 className="font-display text-2xl italic text-paper">{comic.title}</h1>
        </div>
        <BookmarkButton comicId={comic.id} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-line bg-ink-900 p-4">
        <button
          onClick={goToPrevious}
          disabled={currentEpisode === 0}
          className="rounded-sm border border-line px-4 py-2 text-xs uppercase tracking-widest2 text-paper disabled:opacity-30 hover:border-foil disabled:hover:border-line"
        >
          ← Previous
        </button>

        <div className="flex items-center gap-4">
          <select
            value={currentEpisode}
            onChange={(e) => setCurrentEpisode(parseInt(e.target.value))}
            className="rounded-sm border border-line bg-ink-950 px-3 py-2 text-sm text-paper outline-none focus:border-foil"
          >
            {episodes.map((ep, index) => (
              <option key={ep.id} value={index}>
                Chapter {ep.number}: {ep.title}
              </option>
            ))}
          </select>
          <span className="text-xs text-paper-soft">{currentEpisode + 1} of {episodes.length}</span>
        </div>

        <button
          onClick={goToNext}
          disabled={currentEpisode === episodes.length - 1}
          className="rounded-sm border border-line px-4 py-2 text-xs uppercase tracking-widest2 text-paper disabled:opacity-30 hover:border-foil disabled:hover:border-line"
        >
          Next →
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-sm border border-line p-1">
          {(["reveal", "scroll", "page"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`rounded-sm px-3 py-1.5 text-[11px] uppercase tracking-widest2 transition-colors ${
                viewMode === m ? "bg-foil text-ink-950" : "text-paper-soft hover:text-paper"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <ReadingPulse comicId={comic.id} episodeId={currentEp.id} />
      </div>

      <ComicViewer imageUrls={currentEp.imageUrls} mode={viewMode} />
    </div>
  );
}
