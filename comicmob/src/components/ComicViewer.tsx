"use client";
import { useState } from "react";

interface ComicViewerProps {
  imageUrls: string[];
  mode?: "scroll" | "page";
}

export default function ComicViewer({ imageUrls, mode = "scroll" }: ComicViewerProps) {
  const [pageIndex, setPageIndex] = useState(0);

  if (mode === "scroll") {
    return (
      <div className="grid gap-2">
        {imageUrls.map((src, i) => (
          // Using img for simplicity; next/image can be added later
          <img key={i} src={src} alt={`Page ${i + 1}`} className="w-full rounded-lg bg-neutral-800" />
        ))}
      </div>
    );
  }

  const prev = () => setPageIndex(i => Math.max(0, i - 1));
  const next = () => setPageIndex(i => Math.min(imageUrls.length - 1, i + 1));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-neutral-300">
        <span>Page {pageIndex + 1} / {imageUrls.length}</span>
        <div className="flex gap-2">
          <button onClick={prev} className="rounded-md border border-neutral-700 px-3 py-1">Prev</button>
          <button onClick={next} className="rounded-md border border-neutral-700 px-3 py-1">Next</button>
        </div>
      </div>
      <img src={imageUrls[pageIndex]} alt={`Page ${pageIndex + 1}`} className="w-full rounded-lg bg-neutral-800" />
    </div>
  );
}




