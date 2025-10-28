"use client";
import { listTrendingComics, listLightNovels } from "@/src/lib/mock";
import { useState, useEffect } from "react";
import SignupModal from "@/src/components/SignupModal";

export default function HomePage() {
  const comics = listTrendingComics();
  const comicsOnly = comics.filter(c => c.format === "Comic");
  const mangaOnly = comics.filter(c => c.format === "Manga");
  const manhwaOnly = comics.filter(c => c.format === "Manhwa");
  const lightNovels = listLightNovels();
  const latestComics = comics.slice(0, 3); // Show 3 latest
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselComics = comics.slice(0, 5); // Use first 5 comics for carousel
  
  // Signup modal state
  const [showSignup, setShowSignup] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselComics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselComics.length]);

  async function handleAddToLibrary() {
    setShowSignup(true);
  }
  return (
    <div className="space-y-8">
      {/* Hero Banner - Single Comic Focus */}
      <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 -mx-4">
        {/* Background Carousel */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="flex h-full transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselComics.map((comic, index) => (
              <div key={comic.id} className="w-full h-full flex-shrink-0 relative">
                {comic.coverUrl && (
                  <img 
                    src={comic.coverUrl} 
                    alt={comic.title}
                    className="w-full h-full object-cover opacity-30"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 to-neutral-900/50"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 flex items-center min-h-[500px] p-8 lg:p-12">
          <div className="mx-auto max-w-6xl w-full">
            <div className="max-w-2xl">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-brand bg-brand/20 rounded-full uppercase tracking-wide">
                  {carouselComics[currentSlide]?.format}
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                {carouselComics[currentSlide]?.title}
              </h1>
              
              <p className="text-lg text-neutral-300 mb-8 max-w-lg leading-relaxed">
                {carouselComics[currentSlide]?.genres.join(" · ")} • Rating: {carouselComics[currentSlide]?.avgRating}/5
              </p>
              
              <div className="flex gap-4">
                <a 
                  href={`/reader/comic/${carouselComics[currentSlide]?.id}`}
                  className="rounded-lg bg-brand px-8 py-4 font-semibold text-white hover:bg-brand-dark transition-colors text-lg"
                >
                  Read Now
                </a>
                <button 
                  onClick={handleAddToLibrary}
                  className="rounded-lg border border-neutral-600 px-8 py-4 font-semibold text-white hover:bg-neutral-800 transition-colors text-lg"
                >
                  Add to Library
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
          {carouselComics.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-brand' : 'bg-neutral-600'
              }`}
            />
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8">

      <section>
        <h2 className="mb-4 text-xl font-bold">Comics</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {comicsOnly.map((c) => (
            <a key={c.id} href={`/reader/comic/${c.id}`} className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
              {c.coverUrl ? (
                <img src={c.coverUrl} alt={c.title} className="aspect-[3/4] w-full object-cover" />
              ) : (
                <div className="aspect-[3/4] bg-neutral-800" />
              )}
              <div className="p-3">
                <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-400">{c.format}</div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-xs text-neutral-400">{c.genres.join(" · ")}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Manga</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {mangaOnly.map((c) => (
            <a key={c.id} href={`/reader/comic/${c.id}`} className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
              {c.coverUrl ? (
                <img src={c.coverUrl} alt={c.title} className="aspect-[3/4] w-full object-cover" />
              ) : (
                <div className="aspect-[3/4] bg-neutral-800" />
              )}
              <div className="p-3">
                <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-400">{c.format}</div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-xs text-neutral-400">{c.genres.join(" · ")}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Manhwa</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {manhwaOnly.map((c) => (
            <a key={c.id} href={`/reader/comic/${c.id}`} className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
              {c.coverUrl ? (
                <img src={c.coverUrl} alt={c.title} className="aspect-[3/4] w-full object-cover" />
              ) : (
                <div className="aspect-[3/4] bg-neutral-800" />
              )}
              <div className="p-3">
                <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-400">{c.format}</div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-xs text-neutral-400">{c.genres.join(" · ")}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Light Novels</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {lightNovels.map((ln) => (
            <div key={ln.id} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
              {ln.coverUrl ? (
                <img src={ln.coverUrl} alt={ln.title} className="aspect-[3/4] w-full object-cover" />
              ) : (
                <div className="aspect-[3/4] bg-neutral-800" />
              )}
              <div className="p-3">
                <p className="font-semibold">{ln.title}</p>
                <p className="text-xs text-neutral-400">by {ln.author}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SignupModal 
        isOpen={showSignup} 
        onClose={() => setShowSignup(false)} 
        onSuccess={() => {
          // Add comic to library after successful signup
          const comicId = carouselComics[currentSlide]?.id;
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
    </div>
  );
}


