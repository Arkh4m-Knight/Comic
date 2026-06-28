"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DbStory } from "@/src/lib/stories-db";

const ACCENT_OPTIONS = [
  { label: "Gold", value: "#C9A227" },
  { label: "Rose", value: "#B5746B" },
  { label: "Oxblood", value: "#7A2424" },
  { label: "Steel Blue", value: "#3E6E8C" },
  { label: "Forest", value: "#3F6B4A" },
];

const GENRE_OPTIONS = [
  "Action", "Fantasy", "Sci-Fi", "Romance", "Comedy", "Drama", "Adventure", "Mystery", "Horror", "Thriller",
];

export default function PublishDashboard({ myStories }: { myStories: DbStory[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [accent, setAccent] = useState(ACCENT_OPTIONS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleGenre(g: string) {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  async function handleCreateStory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, hook, genres, accent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create story");
      router.push(`/story/${data.story.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-16">
      <section>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">
          New Story
        </p>
        <form onSubmit={handleCreateStory} className="space-y-5 rounded-sm border border-line p-6">
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-widest2 text-paper-soft">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-sm border border-line bg-ink-950 p-3 text-sm text-paper outline-none focus:border-foil"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-widest2 text-paper-soft">
              Hook (one sentence)
            </label>
            <textarea
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              required
              rows={2}
              className="w-full rounded-sm border border-line bg-ink-950 p-3 text-sm text-paper outline-none focus:border-foil"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-widest2 text-paper-soft">Genres</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    genres.includes(g) ? "border-foil bg-foil text-ink-950" : "border-line text-paper-soft"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-widest2 text-paper-soft">
              Accent Color
            </label>
            <div className="flex gap-2">
              {ACCENT_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setAccent(opt.value)}
                  title={opt.label}
                  className="h-8 w-8 rounded-full border-2 transition-transform"
                  style={{
                    backgroundColor: opt.value,
                    borderColor: accent === opt.value ? "#EDEBE6" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-sm bg-foil px-6 py-3 text-sm font-semibold text-ink-950 hover:bg-foil-bright disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Story"}
          </button>
        </form>
      </section>

      <section>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">My Stories</p>
        {myStories.length === 0 ? (
          <p className="text-sm text-paper-soft">You haven&apos;t published any stories yet.</p>
        ) : (
          <div className="divide-y divide-line rounded-sm border border-line">
            {myStories.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-display text-lg italic text-paper">{s.title}</p>
                  <p className="text-xs text-paper-faint">{s.chapter_count} chapter(s) published</p>
                </div>
                <a
                  href={`/publish/${s.slug}/new-chapter`}
                  className="rounded-sm border border-line px-4 py-2 text-xs uppercase tracking-widest2 text-paper hover:border-foil"
                >
                  + Add Chapter
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
