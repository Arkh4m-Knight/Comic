"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

interface ChapterUnlockProps {
  chapterId: string;
  accent: string;
  freeAt: string;
  coinPrice: number;
  coinBalance: number;
}

function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return "any moment now";
  const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((msRemaining / (1000 * 60 * 60)) % 24);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((msRemaining / (1000 * 60)) % 60);
  return `${hours}h ${minutes}m`;
}

export default function ChapterUnlock({ chapterId, accent, freeAt, coinPrice, coinBalance }: ChapterUnlockProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    function tick() {
      setCountdown(formatCountdown(new Date(freeAt).getTime() - Date.now()));
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [freeAt]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, []);

  async function handleUnlock() {
    setUnlocking(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("unlock_chapter_with_coins", {
      p_chapter_id: chapterId,
    });

    if (rpcError) {
      setError("Something went wrong. Please try again.");
      setUnlocking(false);
      return;
    }

    if (!data?.success) {
      if (data?.reason === "insufficient_coins") {
        setError(`You need ${coinPrice} coins but only have ${data.balance}. Buy more coins to unlock this chapter.`);
      } else if (data?.reason === "not_signed_in") {
        setError("Sign in from the top of the page to unlock chapters.");
      } else {
        setError("Couldn't unlock this chapter. Please try again.");
      }
      setUnlocking(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-line text-2xl text-paper-soft">
        🔒
      </div>
      <h2 className="mb-3 font-display text-2xl italic text-paper">This chapter isn't free yet</h2>
      <p className="mb-8 text-sm text-paper-soft">
        It unlocks for everyone in <span className="text-paper">{countdown}</span> — or you can read it right
        now for {coinPrice} coins.
      </p>

      {signedIn === false ? (
        <p className="text-xs uppercase tracking-widest2 text-paper-faint">
          Sign in from the top of the page to unlock chapters with coins.
        </p>
      ) : (
        <>
          <button
            onClick={handleUnlock}
            disabled={unlocking}
            className="rounded-sm px-8 py-3 text-xs uppercase tracking-widest2 text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: accent }}
          >
            {unlocking ? "Unlocking…" : `Unlock for ${coinPrice} coins`}
          </button>
          <p className="mt-4 text-xs text-paper-faint">Your balance: {coinBalance} coins</p>
          {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
        </>
      )}
    </div>
  );
}
