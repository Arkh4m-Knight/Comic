"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ChapterReaderProps {
  storyTitle: string;
  storySlug: string;
  accent: string;
  chapterNumber: number;
  chapterTitle: string;
  paragraphs: string[];
  totalChapters: number;
}

const FONT_SIZES = ["text-base", "text-lg", "text-xl"];

export default function ChapterReader({
  storyTitle,
  storySlug,
  accent,
  chapterNumber,
  chapterTitle,
  paragraphs,
  totalChapters,
}: ChapterReaderProps) {
  const [progress, setProgress] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    }
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hasPrev = chapterNumber > 1;
  const hasNext = chapterNumber < totalChapters;

  return (
    <div>
      {/* Scroll progress line */}
      <div className="fixed left-0 top-0 z-50 h-[3px] w-full bg-ink-900">
        <div
          className="h-full transition-[width] duration-150"
          style={{ width: `${progress}%`, backgroundColor: accent }}
        />
      </div>

      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-ink-950/90 px-6 py-3.5 backdrop-blur">
        <Link
          href={`/story/${storySlug}`}
          className="text-xs uppercase tracking-widest2 text-paper-soft hover:text-paper"
        >
          ← {storyTitle}
        </Link>
        <p className="hidden font-display text-sm italic text-paper sm:block">
          Chapter {chapterNumber} — {chapterTitle}
        </p>
        <div className="flex items-center gap-3 text-xs text-paper-soft">
          <button
            onClick={() => setFontSizeIndex((i) => Math.max(0, i - 1))}
            aria-label="Decrease text size"
            className="hover:text-paper"
          >
            A−
          </button>
          <button
            onClick={() => setFontSizeIndex((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
            aria-label="Increase text size"
            className="hover:text-paper"
          >
            A+
          </button>
          <a
            href={`/api/pdf/${storySlug}/${chapterNumber}`}
            aria-label="Download this chapter as a PDF"
            className="hover:text-paper"
            title="Download PDF"
          >
            ⤓ PDF
          </a>
          <span className="hidden tracking-widest2 sm:inline">
            {chapterNumber} / {totalChapters}
          </span>
        </div>
      </div>

      {/* Reading column */}
      <div className="mx-auto max-w-2xl px-6 py-14">
        <p className="mb-2 font-display text-sm italic text-paper-soft sm:hidden">
          Chapter {chapterNumber} — {chapterTitle}
        </p>
        <h1 className="mb-10 font-display text-3xl italic text-paper">{chapterTitle}</h1>
        <div className={`space-y-5 font-display leading-relaxed text-paper-soft ${FONT_SIZES[fontSizeIndex]}`}>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {/* Chapter navigation */}
      <div className="mx-auto flex max-w-2xl items-center justify-between border-t border-line px-6 py-8">
        {hasPrev ? (
          <Link
            href={`/story/${storySlug}/chapter/${chapterNumber - 1}`}
            className="rounded-sm border border-line px-5 py-2.5 text-xs uppercase tracking-widest2 text-paper hover:border-foil"
          >
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        {hasNext ? (
          <Link
            href={`/story/${storySlug}/chapter/${chapterNumber + 1}`}
            className="rounded-sm border border-line px-5 py-2.5 text-xs uppercase tracking-widest2 text-paper hover:border-foil"
          >
            Next →
          </Link>
        ) : (
          <span className="text-xs uppercase tracking-widest2 text-paper-faint">End of Chapter</span>
        )}
      </div>
    </div>
  );
}
