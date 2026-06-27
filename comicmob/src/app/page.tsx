"use client";
import { listTrendingComics, listLightNovels, ALL_MOODS } from "@/src/lib/mock";
import { Mood } from "@/src/types";
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

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const moodResults = selectedMood
    ? comics.filter((c) => c.moods?.includes(selectedMood))
    : null;

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
      {/* Hero — floating featured edition in negative space */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-14 lg:grid-cols-[1fr_auto] lg:gap-4 lg:py-32">
          <div className="relative z-10 max-w-xl">
            <p className="mb-6 text-[11px] font-medium uppercase tracking-widest2 text-foil">
              Featured Edition
            </p>
            <h1 className="font-display text-6xl italic leading-[0.98] text-paper sm:text-7xl lg:text-8xl">
              {featured?.title}
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest2 text-paper-soft">
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

            <div className="mt-12 flex gap-2">
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

          {/* Floating cover + peek of next item, in negative space */}
          <div className="relative hidden h-[460px] w-[420px] lg:block">
            <div className="absolute right-0 top-1/2 h-[400px] w-[260px] -translate-y-1/2 overflow-hidden rounded-sm opacity-70">
              {carouselComics[(currentSlide + 1) % carouselComics.length]?.coverUrl && (
                <img
                  src={carouselComics[(currentSlide + 1) % carouselComics.length].coverUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-ink-950/30" />
            </div>

            <div className="absolute left-0 top-1/2 h-[400px] w-[260px] -translate-y-1/2 overflow-hidden rounded-sm shadow-[0_30px_80px_-20px_rgba(201,162,39,0.25)]">
              {featured?.coverUrl && (
                <img
                  src={featured.coverUrl}
                  alt={featured.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="absolute -bottom-2 left-0 flex items-center gap-3">
              <div className="h-px w-8 bg-foil" />
              <span className="text-xs uppercase tracking-widest2 text-paper-soft">
                {featured?.format}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-16">
        <section>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">
            What are you in the mood for?
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_MOODS.map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                  selectedMood === mood
                    ? "border-foil bg-foil text-ink-950"
                    : "border-line text-paper-soft hover:border-foil hover:text-paper"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </section>

        {moodResults ? (
          <section>
            <SectionHeader eyebrow="For your mood" title={selectedMood!} />
            {moodResults.length === 0 ? (
              <p className="text-sm text-paper-soft">Nothing tagged for this mood yet — check back soon.</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
                {moodResults.map((c) => (
                  <ComicCard key={c.id} comic={c} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <section>
              <SectionHeader eyebrow="Trending" title="Comics" />
              <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
                {comicsOnly[0] && (
                  <a href={`/reader/comic/${comicsOnly[0].id}`} className="group block">
                    <div className="overflow-hidden rounded-sm border border-line transition-colors group-hover:border-foil">
                      {comicsOnly[0].coverUrl && (
                        <img
                          src={comicsOnly[0].coverUrl}
                          alt={comicsOnly[0].title}
                          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      )}
                    </div>
                    <div className="pt-4">
                      <p className="text-[10px] font-medium uppercase tracking-widest2 text-foil/80">
                        {comicsOnly[0].format}
                      </p>
                      <p className="mt-1 font-display text-2xl italic text-paper">{comicsOnly[0].title}</p>
                      <p className="text-xs text-paper-soft">{comicsOnly[0].genres.join(" · ")}</p>
                    </div>
                  </a>
                )}

                <div className="flex flex-col divide-y divide-line">
                  {comicsOnly.slice(1).map((c) => (
                    <a key={c.id} href={`/reader/comic/${c.id}`} className="group flex items-center gap-4 py-4 first:pt-0">
                      <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-sm border border-line transition-colors group-hover:border-foil">
                        {c.coverUrl && (
                          <img src={c.coverUrl} alt={c.title} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-widest2 text-foil/80">{c.format}</p>
                        <p className="truncate font-display text-base text-paper">{c.title}</p>
                        <p className="truncate text-xs text-paper-soft">{c.genres.join(" · ")}</p>
                      </div>
                    </a>
                  ))}
                </div>
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
          </>
        )}

        <section>
          <SectionHeader eyebrow="From the Shelf" title="Light Novels" />
          <div className="-mx-6 flex gap-6 overflow-x-auto px-6 pb-2">
            {lightNovels.map((ln) => (
              <div key={ln.id} className="w-40 flex-shrink-0">
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
