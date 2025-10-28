"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Comic {
  id: string;
  title: string;
  coverUrl?: string;
  genres: string[];
  format: string;
  avgRating: number;
}

interface User {
  id: string;
  email: string;
  username: string;
}

export default function LibraryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [library, setLibrary] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserAndLibrary() {
      try {
        const res = await fetch("/api/auth");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          
          // Load library
          const libraryRes = await fetch("/api/library");
          if (libraryRes.ok) {
            const libraryData = await libraryRes.json();
            setLibrary(libraryData.library);
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserAndLibrary();
  }, []);

  async function removeFromLibrary(comicId: string) {
    try {
      const res = await fetch("/api/library", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comicId }),
      });
      
      if (res.ok) {
        setLibrary(prev => prev.filter(comic => comic.id !== comicId));
      }
    } catch (error) {
      console.error("Failed to remove from library:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-neutral-400">Loading your library...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">My Library</h1>
        <p className="text-neutral-400">Please sign in to view your library.</p>
        <Link 
          href="/" 
          className="inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Library</h1>
          <p className="text-neutral-400">Welcome back, {user.username}!</p>
        </div>
        <Link 
          href="/reader" 
          className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
        >
          Browse Comics
        </Link>
      </div>

      {library.length === 0 ? (
        <div className="text-center space-y-4 py-12">
          <p className="text-neutral-400">Your library is empty.</p>
          <p className="text-sm text-neutral-500">Add comics to your library to see them here.</p>
          <Link 
            href="/reader" 
            className="inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Start Reading
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {library.map((comic) => (
            <div key={comic.id} className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
              <Link href={`/reader/comic/${comic.id}`}>
                {comic.coverUrl ? (
                  <img src={comic.coverUrl} alt={comic.title} className="aspect-[3/4] w-full object-cover group-hover:opacity-90" />
                ) : (
                  <div className="aspect-[3/4] bg-neutral-800" />
                )}
              </Link>
              <div className="p-3">
                <div className="mb-1 text-[10px] uppercase tracking-wide text-brand font-semibold">{comic.format}</div>
                <Link href={`/reader/comic/${comic.id}`} className="font-semibold hover:text-brand transition-colors">
                  {comic.title}
                </Link>
                <p className="text-xs text-neutral-400 mt-1">{comic.genres.join(" · ")}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-neutral-400">★ {comic.avgRating}</span>
                  <button
                    onClick={() => removeFromLibrary(comic.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


