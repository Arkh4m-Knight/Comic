"use client";
import { useState } from "react";

export default function LightNovelForm({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/light-novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, coverUrl, synopsis }),
      });
      if (!res.ok) throw new Error("failed");
      setTitle(""); setAuthor(""); setCoverUrl(""); setSynopsis("");
      setMsg("Light novel added.");
      onCreated?.();
    } catch {
      setMsg("Could not add. Check fields.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-2 rounded-xl border border-neutral-800 p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-md border border-neutral-800 bg-neutral-950 p-2 text-sm outline-none" />
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" className="rounded-md border border-neutral-800 bg-neutral-950 p-2 text-sm outline-none" />
      </div>
      <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="Cover URL (optional)" className="rounded-md border border-neutral-800 bg-neutral-950 p-2 text-sm outline-none" />
      <textarea value={synopsis} onChange={(e) => setSynopsis(e.target.value)} placeholder="Synopsis (optional)" className="h-24 rounded-md border border-neutral-800 bg-neutral-950 p-2 text-sm outline-none" />
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-400">Add your light novel</span>
        <button disabled={saving} className="rounded-md bg-brand px-3 py-1 font-semibold text-white disabled:opacity-50">Save</button>
      </div>
      {msg && <p className="text-sm text-neutral-300">{msg}</p>}
    </form>
  );
}


