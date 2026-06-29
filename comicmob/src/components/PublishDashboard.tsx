"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DbStory } from "@/src/lib/stories-db";
import { uploadCoverImage } from "@/src/lib/upload-cover";
import { createClient } from "@/src/lib/supabase/client";

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

interface ChapterSummary {
  id: string;
  number: number;
  title: string;
}

export default function PublishDashboard({
  myStories,
  originals,
  isAdmin,
  chaptersByStory,
}: {
  myStories: DbStory[];
  originals: DbStory[];
  isAdmin: boolean;
  chaptersByStory: Record<string, ChapterSummary[]>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [accent, setAccent] = useState(ACCENT_OPTIONS[0].value);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [uploadingCoverFor, setUploadingCoverFor] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  function toggleGenre(g: string) {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleCreateStory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let cover_url: string | null = null;
      if (coverFile && userId) {
        cover_url = await uploadCoverImage(coverFile, userId);
      }
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, hook, genres, accent, cover_url }),
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

  async function handleChangeCover(storyId: string, file: File) {
    if (!userId) return;
    setUploadingCoverFor(storyId);
    try {
      const cover_url = await uploadCoverImage(file, userId);
      const res = await fetch(`/api/stories/${storyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover_url }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update cover.");
        return;
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload cover.");
    } finally {
      setUploadingCoverFor(null);
    }
  }

  async function handleDeleteStory(storyId: string, storyTitle: string) {
    if (!confirm(`Delete "${storyTitle}" and all its chapters? This can't be undone.`)) return;
    setDeletingId(storyId);
    try {
      const res = await fetch(`/api/stories/${storyId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete story.");
        return;
      }
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteChapter(storyId: string, chapterId: string, chapterTitle: string) {
    if (!confirm(`Delete chapter "${chapterTitle}"? This can't be undone.`)) return;
    setDeletingId(chapterId);
    try {
      const res = await fetch(`/api/stories/${storyId}/chapters/${chapterId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete chapter.");
        return;
      }
      router.refresh();
    } finally {
      setDeletingId(null);
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
              Cover Image (optional — a placeholder is used if you skip this)
            </label>
            <div className="flex items-center gap-4">
              {coverPreview && (
                <img src={coverPreview} alt="" className="h-24 w-16 rounded-sm border border-line object-cover" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="text-xs text-paper-soft"
              />
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

      {isAdmin && (
        <section>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">
            Studio Originals
          </p>
          <p className="mb-3 text-xs text-paper-faint">
            Add chapters to the 4 ComicMob Originals. Visible only to the studio admin account.
          </p>
          <div className="divide-y divide-line rounded-sm border border-line">
            {originals.map((s) => renderStoryRow(s, { allowDeleteStory: false }))}
          </div>
        </section>
      )}

      <section>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">My Stories</p>
        {myStories.length === 0 ? (
          <p className="text-sm text-paper-soft">You haven&apos;t published any stories yet.</p>
        ) : (
          <div className="divide-y divide-line rounded-sm border border-line">
            {myStories.map((s) => renderStoryRow(s, { allowDeleteStory: true }))}
          </div>
        )}
      </section>
    </div>
  );

  function renderStoryRow(s: DbStory, options: { allowDeleteStory: boolean }) {
    const chapters = chaptersByStory[s.id] ?? [];
    const isExpanded = expandedStory === s.id;
    return (
      <div key={s.id}>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="font-display text-lg italic text-paper">{s.title}</p>
            <button
              onClick={() => setExpandedStory(isExpanded ? null : s.id)}
              className="text-xs text-paper-faint underline hover:text-paper-soft"
            >
              {s.chapter_count} chapter(s) published {chapters.length > 0 && (isExpanded ? "(hide)" : "(show)")}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor={`cover-${s.id}`}
              className="cursor-pointer rounded-sm border border-line px-3 py-2 text-xs uppercase tracking-widest2 text-paper hover:border-foil"
            >
              {uploadingCoverFor === s.id ? "Uploading..." : "Change Cover"}
            </label>
            <input
              id={`cover-${s.id}`}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingCoverFor === s.id}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleChangeCover(s.id, file);
              }}
            />
            <a
              href={`/publish/${s.slug}/new-chapter`}
              className="rounded-sm border border-line px-4 py-2 text-xs uppercase tracking-widest2 text-paper hover:border-foil"
            >
              + Add Chapter
            </a>
            {options.allowDeleteStory && (
              <button
                onClick={() => handleDeleteStory(s.id, s.title)}
                disabled={deletingId === s.id}
                className="rounded-sm border border-line px-3 py-2 text-xs uppercase tracking-widest2 text-red-400 hover:border-red-400 disabled:opacity-50"
              >
                {deletingId === s.id ? "..." : "Delete"}
              </button>
            )}
          </div>
        </div>

        {isExpanded && chapters.length > 0 && (
          <div className="divide-y divide-line bg-ink-950 px-5">
            {chapters.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <span className="text-sm text-paper-soft">
                  Ch. {c.number} — {c.title}
                </span>
                <button
                  onClick={() => handleDeleteChapter(s.id, c.id, c.title)}
                  disabled={deletingId === c.id}
                  className="text-xs uppercase tracking-widest2 text-red-400 hover:underline disabled:opacity-50"
                >
                  {deletingId === c.id ? "..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
