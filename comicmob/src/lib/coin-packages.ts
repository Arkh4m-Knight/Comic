export interface CoinPackage {
  id: string;
  coins: number;
  amountInr: number; // rupees
  label: string;
}

// Bulk-discounted tiers, roughly matching the Webtoon-style pricing
// discussed earlier (bigger packs = better per-coin rate). Adjust freely --
// this is the only place prices live, since the create-order route looks
// up the amount by id rather than trusting anything the client sends.
export const COIN_PACKAGES: CoinPackage[] = [
  { id: "small", coins: 50, amountInr: 49, label: "Starter" },
  { id: "medium", coins: 250, amountInr: 199, label: "Popular" },
  { id: "large", coins: 600, amountInr: 399, label: "Best Value" },
];

export function getCoinPackage(id: string): CoinPackage | undefined {
  return COIN_PACKAGES.find((p) => p.id === id);
}
