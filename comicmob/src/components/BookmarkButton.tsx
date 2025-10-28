"use client";
import { useState } from "react";

export default function BookmarkButton({ comicId }: { comicId: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  return (
    <button
      aria-pressed={bookmarked}
      onClick={() => setBookmarked(v => !v)}
      className={`rounded-md px-3 py-1 text-sm font-semibold ${bookmarked ? "bg-neutral-200 text-neutral-900" : "bg-brand text-white"}`}
    >
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}




