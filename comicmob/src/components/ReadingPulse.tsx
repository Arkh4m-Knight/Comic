"use client";
import { useEffect, useRef, useState } from "react";

const HEARTBEAT_INTERVAL_MS = 15000;

function getSessionId(): string {
  const key = "comicmob_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function ReadingPulse({ comicId, episodeId }: { comicId: string; episodeId: string }) {
  const [count, setCount] = useState<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current = getSessionId();

    async function beat() {
      try {
        const res = await fetch("/api/pulse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comicId, episodeId, sessionId: sessionIdRef.current }),
        });
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
        }
      } catch {
        // Silently ignore — this is a nice-to-have, never block reading on it.
      }
    }

    beat();
    const interval = setInterval(beat, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [comicId, episodeId]);

  if (count === null || count < 2) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-paper-soft">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foil opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foil" />
      </span>
      <span className="uppercase tracking-widest2">{count} reading now</span>
    </div>
  );
}
