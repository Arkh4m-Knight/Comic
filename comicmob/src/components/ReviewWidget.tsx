"use client";
import { useState } from "react";

interface ReviewWidgetProps {
  comicId: string;
}

export default function ReviewWidget({ comicId }: ReviewWidgetProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/comics/${comicId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content, type: "User", tags: { art: rating, story: rating, character: rating, worldbuilding: rating } }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setContent("");
      setMessage("Thanks for your review!");
    } catch (e) {
      setMessage("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-neutral-800 p-3">
      <div className="flex items-center justify-between">
        <label className="text-sm">Your Rating</label>
        <input type="range" min={1} max={5} value={rating} onChange={(e) => setRating(parseInt(e.target.value))} />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your thoughts..."
        className="h-24 w-full rounded-md border border-neutral-800 bg-neutral-950 p-2 text-sm outline-none"
      />
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-400">Rating: {rating}/5</span>
        <button disabled={submitting} onClick={submit} className="rounded-md bg-brand px-3 py-1 font-semibold text-white disabled:opacity-50">Submit</button>
      </div>
      {message && <p className="text-sm text-neutral-300">{message}</p>}
    </div>
  );
}




