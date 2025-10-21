"use client";
import Link from "next/link";
import { useState } from "react";
import ComicViewer from "@/src/components/ComicViewer";
import BookmarkButton from "@/src/components/BookmarkButton";
import { getComic } from "@/src/lib/mock";

// Define necessary interfaces locally to bypass persistent build errors on type resolution
interface Episode {
  id: string;
  title: string;
  number: number;
  imageUrls: string[];
  createdAt: string;
}

interface Comic {
  id: string;
  title: string;
  coverUrl: string;
  genres: string[];
  format: string;
  creatorId: string;
  episodes: Episode[]; // Use the locally defined Episode
  avgRating: number;
}


export default function ComicReaderPage({ params }: { params: { id: string } }) {
  const { id } = params;
  // Note: getComic returns the Comic type (imported or inferred from mock)
  const comic = getComic(id) as Comic | undefined; 
  const [currentEpisode, setCurrentEpisode] = useState(0);

  if (!comic) {
    return <p className="text-neutral-400">Comic not found.</p>;
  }

  const episodes = comic.episodes;
  const currentEp = episodes[currentEpisode];

  const goToPrevious = () => {
    if (currentEpisode > 0) {
      setCurrentEpisode(currentEpisode - 1);
    }
  };

  const goToNext = () => {
    if (currentEpisode < episodes.length - 1) {
      setCurrentEpisode(currentEpisode + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link className="rounded-md border border-neutral-700 px-3 py-1 text-sm" href="/reader">← Back</Link>
          <h1 className="text-2xl font-bold">{comic.title}</h1>
        </div>
        <BookmarkButton comicId={comic.id} />
      </div>

      {/* Chapter Navigation */}
      <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
        <button 
          onClick={goToPrevious}
          disabled={currentEpisode === 0}
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800"
        >
          ← Previous
        </button>

        <div className="flex items-center gap-4">
          <select 
            value={currentEpisode}
            onChange={(e) => setCurrentEpisode(parseInt(e.target.value))}
            className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          >
            {/* FIX: Explicitly type 'ep' to satisfy noImplicitAny and fix the build error */}
            {episodes.map((ep: Episode, index) => (
              <option key={ep.id} value={index}>
                Chapter {ep.number}: {ep.title}
              </option>
            ))}
          </select>

          <span className="text-sm text-neutral-400">
            {currentEpisode + 1} of {episodes.length}
          </span>
        </div>

        <button 
          onClick={goToNext}
          disabled={currentEpisode === episodes.length - 1}
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800"
        >
          Next →
        </button>
      </div>

      {/* Comic Viewer */}
      <ComicViewer imageUrls={currentEp.imageUrls} mode="scroll" />
    </div>
  );
}
