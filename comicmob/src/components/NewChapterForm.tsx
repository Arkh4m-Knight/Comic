"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewChapterForm({
  storyId,
  storySlug,
  nextNumber,
}: {
  storyId: string;
  storySlug: string;
  nextNumber: number;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/stories/${storyId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: nextNumber, title, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish chapter");
      router.push(`/story/${storySlug}/chapter/${nextNumber}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-[11px] uppercase tracking-widest2 text-paper-soft">
          Chapter {nextNumber} Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-sm border border-line bg-ink-950 p-3 text-sm text-paper outline-none focus:border-foil"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[11px] uppercase tracking-widest2 text-paper-soft">
          Chapter Text (new paragraph on each line, or separated by a blank line — both work)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={16}
          className="w-full rounded-sm border border-line bg-ink-950 p-3 text-sm leading-relaxed text-paper outline-none focus:border-foil"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-sm bg-foil px-6 py-3 text-sm font-semibold text-ink-950 hover:bg-foil-bright disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish Chapter"}
      </button>
    </form>
  );
}
