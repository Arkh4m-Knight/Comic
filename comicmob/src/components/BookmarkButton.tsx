"use client";
import { useState } from "react";

export default function BookmarkButton({ comicId }: { comicId: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  return (
    <button
      aria-pressed={bookmarked}
      onClick={() => setBookmarked((v) => !v)}
      className={`rounded-sm border px-4 py-1.5 text-xs font-medium uppercase tracking-widest2 transition-colors ${
        bookmarked
          ? "border-foil bg-foil text-ink-950"
          : "border-line text-paper hover:border-foil"
      }`}
    >
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
