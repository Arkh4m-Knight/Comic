"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import type { DbStoryReview } from "@/src/lib/stories-db";

interface StoryReviewsProps {
  storyId: string;
  accent: string;
  initialReviews: DbStoryReview[];
  isOwnStory: boolean;
}

const MIN_REVIEW_LENGTH = 20;

function StarPicker({ rating, onChange, accent }: { rating: number; onChange: (n: number) => void; accent: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-label={`${n} stars`}
          className="text-lg"
          style={{ color: n <= rating ? accent : "#3A3A3F" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function StoryReviews({ storyId, accent, initialReviews, isOwnStory }: StoryReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(!!data.user);
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const alreadyReviewed = reviews.some((r) => r.author_id === userId);

  async function submit() {
    if (content.trim().length < MIN_REVIEW_LENGTH) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong.");
        return;
      }
      setReviews((prev) => [{ ...data.review, author_name: "You" }, ...prev]);
      setContent("");
      setMessage("Thanks for the review! +1 coin added to your balance.");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(review: DbStoryReview) {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditContent(review.content);
    setEditMessage(null);
  }

  async function saveEdit() {
    if (editContent.trim().length < MIN_REVIEW_LENGTH) return;
    setEditSubmitting(true);
    setEditMessage(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/reviews`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: editRating, content: editContent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditMessage(data.error ?? "Something went wrong.");
        return;
      }
      setReviews((prev) => prev.map((r) => (r.id === data.review.id ? { ...r, ...data.review } : r)));
      setEditingId(null);
    } catch {
      setEditMessage("Something went wrong.");
    } finally {
      setEditSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-3xl">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">
        Reviews {reviews.length > 0 && `(${reviews.length})`}
      </p>
      <h2 className="mb-8 font-display text-2xl italic text-paper">What readers are saying</h2>

      {signedIn && !alreadyReviewed && !isOwnStory && (
        <div className="mb-10 rounded-sm border border-line p-5">
          <p className="mb-3 text-xs text-paper-soft">
            Leave a review and get <span style={{ color: accent }}>+1 free coin</span> — first review only.
          </p>
          <StarPicker rating={rating} onChange={setRating} accent={accent} />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What did you think? (at least 20 characters)"
            className="h-24 w-full rounded-sm border border-line bg-transparent p-3 text-sm text-paper outline-none placeholder:text-paper-faint"
          />
          <p className="mt-1 text-[11px] text-paper-faint">
            {content.trim().length}/{MIN_REVIEW_LENGTH} characters
          </p>
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={submit}
              disabled={submitting || content.trim().length < MIN_REVIEW_LENGTH}
              className="rounded-sm px-6 py-2.5 text-xs uppercase tracking-widest2 text-ink-950 disabled:opacity-50"
              style={{ backgroundColor: accent }}
            >
              {submitting ? "Posting…" : "Post Review"}
            </button>
            {message && <p className="text-xs text-paper-soft">{message}</p>}
          </div>
        </div>
      )}

      {signedIn === false && (
        <p className="mb-10 text-xs uppercase tracking-widest2 text-paper-faint">
          Sign in from the top of the page to leave a review and earn a free coin.
        </p>
      )}

      <div className="space-y-6">
        {reviews.length === 0 && <p className="text-sm text-paper-faint">No reviews yet — be the first.</p>}
        {reviews.map((r) => {
          const isMine = r.author_id === userId;
          const isEditing = editingId === r.id;

          if (isEditing) {
            return (
              <div key={r.id} className="rounded-sm border border-line p-5">
                <StarPicker rating={editRating} onChange={setEditRating} accent={accent} />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="What did you think? (at least 20 characters)"
                  className="h-24 w-full rounded-sm border border-line bg-transparent p-3 text-sm text-paper outline-none placeholder:text-paper-faint"
                />
                <p className="mt-1 text-[11px] text-paper-faint">
                  {editContent.trim().length}/{MIN_REVIEW_LENGTH} characters
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={saveEdit}
                    disabled={editSubmitting || editContent.trim().length < MIN_REVIEW_LENGTH}
                    className="rounded-sm px-6 py-2.5 text-xs uppercase tracking-widest2 text-ink-950 disabled:opacity-50"
                    style={{ backgroundColor: accent }}
                  >
                    {editSubmitting ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    disabled={editSubmitting}
                    className="text-xs uppercase tracking-widest2 text-paper-faint hover:text-paper"
                  >
                    Cancel
                  </button>
                  {editMessage && <p className="text-xs text-paper-soft">{editMessage}</p>}
                </div>
              </div>
            );
          }

          return (
            <div key={r.id} className="border-b border-line pb-6 last:border-b-0">
              <div className="mb-1.5 flex items-center gap-3">
                <span className="text-sm text-paper">{r.author_name}</span>
                <span style={{ color: accent }} className="text-xs">
                  {"★".repeat(r.rating)}
                  <span className="text-paper-faint">{"★".repeat(5 - r.rating)}</span>
                </span>
                {isMine && (
                  <button
                    onClick={() => startEditing(r)}
                    className="text-[11px] uppercase tracking-widest2 text-paper-faint hover:text-paper"
                  >
                    Edit
                  </button>
                )}
              </div>
              <p className="text-sm leading-relaxed text-paper-soft">{r.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
