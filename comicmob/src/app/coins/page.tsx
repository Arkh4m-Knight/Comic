import { createClient } from "@/src/lib/supabase/server";
import { getMyCoinBalance, getMyCoinTransactions } from "@/src/lib/stories-db";
import BuyCoins from "@/src/components/BuyCoins";
import Link from "next/link";

const TRANSACTION_LABELS: Record<string, string> = {
  purchase: "Bought coins",
  spend: "Unlocked a chapter",
  refund: "Refund",
  admin_grant: "Bonus from ComicMob",
  signup_bonus: "Welcome bonus",
  review_reward: "Reward for a review",
  review_reward_reversed: "Review deleted",
};

export default async function CoinsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-2xl italic text-paper">Sign in to see your coins</p>
        <p className="mt-3 text-sm text-paper-soft">Your coin balance is tied to your account.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-sm border border-line px-6 py-3 text-xs uppercase tracking-widest2 text-paper hover:border-foil"
        >
          ← Back home, then use Sign In
        </Link>
      </div>
    );
  }

  const [balance, transactions] = await Promise.all([
    getMyCoinBalance(),
    getMyCoinTransactions(data.user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">Your Wallet</p>
      <h1 className="mb-10 font-display text-4xl italic text-paper">
        <span style={{ color: "#D4AF37" }}>🪙</span> {balance} coins
      </h1>

      {/* How coins work */}
      <div className="mb-12 grid gap-6 sm:grid-cols-3">
        <div className="rounded-sm border border-line p-5">
          <p className="mb-1 font-display text-lg italic text-paper">Unlock chapters</p>
          <p className="text-xs text-paper-soft">
            Chapters newer than 7 days cost 10 coins to read early — or wait for the free-for-everyone window.
          </p>
        </div>
        <div className="rounded-sm border border-line p-5">
          <p className="mb-1 font-display text-lg italic text-paper">Free Daily Pass</p>
          <p className="text-xs text-paper-soft">
            Once every 24 hours, unlock one locked chapter for free — no coins needed.
          </p>
        </div>
        <div className="rounded-sm border border-line p-5">
          <p className="mb-1 font-display text-lg italic text-paper">Leave a review</p>
          <p className="text-xs text-paper-soft">
            Your first review on any story (20+ characters) earns you +1 coin, automatically.
          </p>
        </div>
      </div>

      {/* Buy coins */}
      <div className="mb-12">
        <p className="mb-4 font-display text-xl italic text-paper">Buy more coins</p>
        <BuyCoins accent="#D4AF37" />
      </div>

      {/* Transaction history */}
      <p className="mb-4 text-[11px] font-medium uppercase tracking-widest2 text-paper-faint">Recent Activity</p>
      {transactions.length === 0 ? (
        <p className="text-sm text-paper-faint">No coin activity yet.</p>
      ) : (
        <div className="divide-y divide-line border-t border-line">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3.5 text-sm">
              <span className="text-paper-soft">{TRANSACTION_LABELS[t.type] ?? t.type}</span>
              <span className={t.amount >= 0 ? "text-paper" : "text-paper-faint"}>
                {t.amount >= 0 ? "+" : ""}
                {t.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
