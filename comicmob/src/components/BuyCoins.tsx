"use client";
import { useState } from "react";
import { COINS_UPDATED_EVENT } from "./CoinBalance";

interface CoinPackage {
  id: string;
  coins: number;
  amountInr: number;
  label: string;
}

// Mirrors src/lib/coin-packages.ts for display only -- the server looks
// the price up by id itself and never trusts anything the client sends,
// so this list is just what's shown as buttons.
const PACKAGES: CoinPackage[] = [
  { id: "small", coins: 50, amountInr: 49, label: "Starter" },
  { id: "medium", coins: 250, amountInr: 199, label: "Popular" },
  { id: "large", coins: 600, amountInr: 399, label: "Best Value" },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BuyCoins({ accent }: { accent: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function buy(pkg: CoinPackage) {
    setLoadingId(pkg.id);
    setMessage(null);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setMessage("Couldn't load the payment popup. Check your connection and try again.");
      setLoadingId(null);
      return;
    }

    try {
      const orderRes = await fetch("/api/coins/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const order = await orderRes.json();

      if (!orderRes.ok) {
        setMessage(order.error ?? "Couldn't start the purchase.");
        setLoadingId(null);
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "ComicMob",
        description: `${pkg.coins} coins`,
        theme: { color: accent },
        handler: async (response: any) => {
          setMessage("Confirming your payment…");
          const verifyRes = await fetch("/api/coins/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) {
            setMessage(`+${pkg.coins} coins added!`);
            window.dispatchEvent(new Event(COINS_UPDATED_EVENT));
          } else {
            setMessage("Payment received — your coins should appear shortly. Refresh in a moment if not.");
          }
          setLoadingId(null);
        },
        modal: {
          ondismiss: () => setLoadingId(null),
        },
      });

      razorpay.on("payment.failed", () => {
        setMessage("Payment failed or was cancelled.");
        setLoadingId(null);
      });

      razorpay.open();
    } catch {
      setMessage("Something went wrong. Please try again.");
      setLoadingId(null);
    }
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => buy(pkg)}
            disabled={loadingId !== null}
            className="rounded-sm border border-line p-5 text-center transition-colors hover:border-foil disabled:opacity-50"
          >
            <p className="text-[10px] uppercase tracking-widest2 text-paper-faint">{pkg.label}</p>
            <p className="mt-2 font-display text-2xl italic text-paper">{pkg.coins} coins</p>
            <p className="mt-1 text-sm text-paper-soft">₹{pkg.amountInr}</p>
            {loadingId === pkg.id && <p className="mt-2 text-[11px] text-paper-faint">Loading…</p>}
          </button>
        ))}
      </div>
      {message && <p className="mt-4 text-center text-xs text-paper-soft">{message}</p>}
    </div>
  );
}
