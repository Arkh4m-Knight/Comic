"use client";
import { useState, useRef, useCallback } from "react";

interface ComicViewerProps {
  imageUrls: string[];
  mode?: "scroll" | "page" | "reveal";
}

export default function ComicViewer({ imageUrls, mode = "scroll" }: ComicViewerProps) {
  if (mode === "scroll") {
    return (
      <div className="grid gap-2">
        {imageUrls.map((src, i) => (
          <img key={i} src={src} alt={`Page ${i + 1}`} className="w-full rounded-sm bg-ink-900" />
        ))}
      </div>
    );
  }

  if (mode === "page") {
    return <PageMode imageUrls={imageUrls} />;
  }

  return <RevealMode imageUrls={imageUrls} />;
}

function PageMode({ imageUrls }: { imageUrls: string[] }) {
  const [pageIndex, setPageIndex] = useState(0);
  const prev = () => setPageIndex((i) => Math.max(0, i - 1));
  const next = () => setPageIndex((i) => Math.min(imageUrls.length - 1, i + 1));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-paper-soft">
        <span>Page {pageIndex + 1} / {imageUrls.length}</span>
        <div className="flex gap-2">
          <button onClick={prev} className="rounded-sm border border-line px-3 py-1 hover:border-foil">Prev</button>
          <button onClick={next} className="rounded-sm border border-line px-3 py-1 hover:border-foil">Next</button>
        </div>
      </div>
      <img
        src={imageUrls[pageIndex]}
        alt={`Page ${pageIndex + 1}`}
        className="min-h-[400px] w-full rounded-sm bg-ink-900 object-contain sm:min-h-[600px]"
      />
    </div>
  );
}

// "Reveal" mode: paces the story one page at a time, tap/swipe/arrow-key to
// advance, with a deliberate transition instead of free scrolling. This is
// the foundation for true panel-by-panel reveal once panel-separated art
// exists — for now it operates at the page level.
function RevealMode({ imageUrls }: { imageUrls: string[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const touchStartX = useRef<number | null>(null);

  const goNext = useCallback(() => {
    setDirection("forward");
    setIndex((i) => Math.min(imageUrls.length - 1, i + 1));
  }, [imageUrls.length]);

  const goBack = useCallback(() => {
    setDirection("back");
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) goNext();
      else goBack();
    }
    touchStartX.current = null;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === " ") goNext();
    if (e.key === "ArrowLeft") goBack();
  }

  const atEnd = index === imageUrls.length - 1;

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative select-none outline-none"
    >
      <div className="relative overflow-hidden rounded-sm border border-line bg-ink-900">
        <img
          key={index}
          src={imageUrls[index]}
          alt={`Page ${index + 1}`}
          className={`min-h-[400px] w-full object-contain sm:min-h-[600px] ${
            direction === "forward" ? "animate-reveal-in" : "animate-reveal-in-back"
          }`}
        />

        {/* Tap zones */}
        <button
          aria-label="Previous page"
          onClick={goBack}
          className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize"
        />
        <button
          aria-label="Next page"
          onClick={goNext}
          className="absolute inset-y-0 right-0 w-1/3 cursor-e-resize"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest2 text-paper-soft">
          {index + 1} / {imageUrls.length}
        </span>
        <div className="flex gap-1.5">
          {imageUrls.map((_, i) => (
            <div
              key={i}
              className={`h-[2px] w-4 transition-colors ${
                i <= index ? "bg-foil" : "bg-line"
              }`}
            />
          ))}
        </div>
        {atEnd ? (
          <span className="text-xs uppercase tracking-widest2 text-foil">End of chapter</span>
        ) : (
          <span className="text-xs uppercase tracking-widest2 text-paper-faint">
            Tap or swipe to continue
          </span>
        )}
      </div>
    </div>
  );
}
