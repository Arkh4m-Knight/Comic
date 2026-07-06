"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";

// Dispatched by ChapterUnlock and StoryReviews after any action that
// changes the signed-in reader's coin balance, so the nav badge updates
// without needing a shared state library.
export const COINS_UPDATED_EVENT = "comicmob:coins-updated";

export default function CoinBalance() {
  const [balance, setBalance] = useState<number | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  async function refresh() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    setSignedIn(!!userData.user);
    if (!userData.user) {
      setBalance(null);
      return;
    }
    const { data } = await supabase.rpc("get_my_coin_balance");
    setBalance((data as number) ?? 0);
  }

  useEffect(() => {
    refresh();
    window.addEventListener(COINS_UPDATED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(COINS_UPDATED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  if (!signedIn || balance === null) return null;

  return (
    <a
      href="/coins"
      className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 normal-case tracking-normal text-paper transition-colors hover:border-foil"
      title="Your coin balance"
    >
      <span style={{ color: "#D4AF37" }}>🪙</span>
      {balance}
    </a>
  );
}
