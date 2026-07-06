"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { COINS_UPDATED_EVENT } from "./CoinBalance";

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
  const [redeemingPass, setRedeemingPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [passStatus, setPassStatus] = useState<{ can_redeem: boolean; next_available_at: string | null } | null>(
    null
  );
  const [passCooldown, setPassCooldown] = useState("");

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
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(!!data.user);
      if (data.user) {
        supabase.rpc("get_my_daily_pass_status").then(({ data: status }) => setPassStatus(status ?? null));
      }
    });
  }, []);

  useEffect(() => {
    if (!passStatus?.next_available_at) {
      setPassCooldown("");
      return;
    }
    function tick() {
      setPassCooldown(formatCountdown(new Date(passStatus!.next_available_at!).getTime() - Date.now()));
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [passStatus]);

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

    window.dispatchEvent(new Event(COINS_UPDATED_EVENT));
    router.refresh();
  }

  async function handleDailyPass() {
    setRedeemingPass(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("redeem_daily_pass", {
      p_chapter_id: chapterId,
    });

    if (rpcError) {
      setError("Something went wrong. Please try again.");
      setRedeemingPass(false);
      return;
    }

    if (!data?.success) {
      if (data?.reason === "already_used_today") {
        setPassStatus({ can_redeem: false, next_available_at: data.next_available_at });
        setError("You've already used today's free pass. Come back tomorrow, or unlock with coins.");
      } else if (data?.reason === "not_signed_in") {
        setError("Sign in from the top of the page to use your free daily pass.");
      } else {
        setError("Couldn't redeem your daily pass. Please try again.");
      }
      setRedeemingPass(false);
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
        It unlocks for everyone in <span className="text-paper">{countdown}</span>.
      </p>

      {signedIn === false ? (
        <p className="text-xs uppercase tracking-widest2 text-paper-faint">
          Sign in from the top of the page to read it sooner.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {passStatus?.can_redeem !== false && (
              <button
                onClick={handleDailyPass}
                disabled={redeemingPass}
                className="rounded-sm border px-8 py-3 text-xs uppercase tracking-widest2 text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ borderColor: accent }}
              >
                {redeemingPass ? "Redeeming…" : "Use Free Daily Pass"}
              </button>
            )}
            <button
              onClick={handleUnlock}
              disabled={unlocking}
              className="rounded-sm px-8 py-3 text-xs uppercase tracking-widest2 text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: accent }}
            >
              {unlocking ? "Unlocking…" : `Unlock for ${coinPrice} coins`}
            </button>
          </div>
          {passStatus?.can_redeem === false && passCooldown && (
            <p className="mt-4 text-xs text-paper-faint">Next free pass available in {passCooldown}</p>
          )}
          <p className="mt-4 text-xs text-paper-faint">Your balance: {coinBalance} coins</p>
          {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
        </>
      )}
    </div>
  );
}
