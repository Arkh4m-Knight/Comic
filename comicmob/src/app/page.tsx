"use client";
import { listTrendingComics, listLightNovels } from "@/src/lib/mock";
import { useState, useEffect } from "react";
import AuthModal from "@/src/components/AuthModal";
import ComicCard from "@/src/components/ComicCard";
import SectionHeader from "@/src/components/SectionHeader";

export default function HomePage() {
  const comics = listTrendingComics();
  const comicsOnly = comics.filter((c) => c.format === "Comic");
  const mangaOnly = comics.filter((c) => c.format === "Manga");
  const manhwaOnly = comics.filter((c) => c.format === "Manhwa");
  const lightNovels = listLightNovels();

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselComics = comics.slice(0, 5);

  // Auth modal state
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselComics.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselComics.length]);

  async function handleAddToLibrary() {
    setShowSignup(true);
  }

  const featured = carouselComics[currentSlide];

  return (
    <div>
      {/* Hero — "Featured Edition" */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="mb-5 text-[11px] font-medium uppercase tracking-widest2 text-foil">
              Featured Edition
            </p>
            <h1 className="font-display text-5xl italic leading-[1.05] text-paper lg:text-6xl">
              {featured?.title}
            </h1>

            <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest2 text-paper-soft">
              <span>{featured?.format}</span>
              <span className="text-line">/</span>
              <span>{featured?.genres.join(" · ")}</span>
              <span className="text-line">/</span>
              <span>Rating {featured?.avgRating} / 5</span>
            </div>

            <div className="mt-10 flex gap-4">
              <a
                href={`/reader/comic/${featured?.id}`}
                className="rounded-sm bg-foil px-7 py-3 text-sm font-semibold text-ink-950 transition-colors hover:bg-foil-bright"
              >
                Read Now
              </a>
              <button
                onClick={handleAddToLibrary}
                className="rounded-sm border border-line px-7 py-3 text-sm font-semibold text-paper transition-colors hover:border-foil"
              >
                Add to Library
              </button>
            </div>

            <div className="mt-10 flex gap-2">
              {carouselComics.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Show featured edition ${index + 1}`}
                  className={`h-[2px] w-6 transition-colors ${
                    index === currentSlide ? "bg-foil" : "bg-line"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-[280px] lg:block">
            <div className="overflow-hidden rounded-sm border border-line">
              {featured?.coverUrl && (
                <img
                  src={featured.coverUrl}
                  alt={featured.title}
                  className="aspect-[3/4] w-full object-cover"
                />
              )}
            </div>
            <div className="pointer-events-none absolute -inset-3 -z-10 rounded-sm border border-line" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-16">
        <section>
          <SectionHeader eyebrow="Trending" title="Comics" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {comicsOnly.map((c) => (
              <ComicCard key={c.id} comic={c} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Trending" title="Manga" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {mangaOnly.map((c) => (
              <ComicCard key={c.id} comic={c} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Trending" title="Manhwa" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {manhwaOnly.map((c) => (
              <ComicCard key={c.id} comic={c} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="From the Shelf" title="Light Novels" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {lightNovels.map((ln) => (
              <div key={ln.id}>
                <div className="overflow-hidden rounded-sm border border-line bg-ink-900">
                  {ln.coverUrl ? (
                    <img
                      src={ln.coverUrl}
                      alt={ln.title}
                      className="aspect-[3/4] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[3/4] bg-ink-800" />
                  )}
                </div>
                <div className="pt-3">
                  <p className="font-display text-base text-paper">{ln.title}</p>
                  <p className="text-xs text-paper-soft">by {ln.author}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AuthModal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onSuccess={() => {
          const comicId = featured?.id;
          if (comicId) {
            fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "addToLibrary", comicId }),
            });
          }
        }}
      />
    </div>
  );
}
