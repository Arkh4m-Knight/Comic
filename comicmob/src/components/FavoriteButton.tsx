"use client";
import { useEffect, useState } from "react";

export default function FavoriteButton({ storyId, accent }: { storyId: string; accent: string }) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    fetch(`/api/stories/${storyId}/favorite`)
      .then((res) => res.json())
      .then((data) => setFavorited(data.favorited))
      .finally(() => setLoading(false));
  }, [storyId]);

  async function toggle() {
    const method = favorited ? "DELETE" : "POST";
    const res = await fetch(`/api/stories/${storyId}/favorite`, { method });
    if (res.status === 401) {
      setSignedIn(false);
      return;
    }
    const data = await res.json();
    setFavorited(data.favorited);
  }

  if (loading) return <div className="h-10 w-32 animate-pulse rounded-sm bg-ink-900" />;

  return (
    <div>
      <button
        onClick={toggle}
        className="flex items-center gap-2 rounded-sm border px-5 py-2.5 text-xs uppercase tracking-widest2 transition-colors"
        style={{
          borderColor: favorited ? accent : undefined,
          color: favorited ? accent : undefined,
        }}
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill={favorited ? accent : "none"}
          stroke={favorited ? accent : "currentColor"}
          strokeWidth={1.5}
        >
          <path d="M12 21s-7-4.5-9.5-9C.5 8 2.5 4 6.5 4c2 0 3.5 1.2 4.5 2.5C12 5.2 13.5 4 15.5 4c4 0 6 4 4 8-2.5 4.5-9.5 9-9.5 9z" />
        </svg>
        {favorited ? "Saved" : "Save"}
      </button>
      {!signedIn && (
        <p className="mt-2 text-xs text-paper-faint">Sign in to save stories to your library.</p>
      )}
    </div>
  );
}
