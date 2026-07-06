"use client";
import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";
import { COINS_UPDATED_EVENT } from "./CoinBalance";

interface CurrentUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
}

export default function AuthStatus() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  async function refreshUser() {
    try {
      const res = await fetch("/api/auth");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signout" }),
    });
    setUser(null);
    window.dispatchEvent(new Event(COINS_UPDATED_EVENT));
  }

  if (loading) {
    return <div className="h-6 w-14 animate-pulse rounded-sm bg-ink-800" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 normal-case tracking-normal">
        <span className="text-paper-soft">{user.displayName || user.username || user.email}</span>
        <button
          onClick={handleSignOut}
          className="rounded-sm border border-line px-3 py-1.5 text-paper transition-colors hover:border-foil"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAuth(true)}
        className="rounded-sm border border-line px-3 py-1.5 normal-case tracking-normal text-paper transition-colors hover:border-foil"
      >
        Sign In
      </button>
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          refreshUser();
          window.dispatchEvent(new Event(COINS_UPDATED_EVENT));
        }}
      />
    </>
  );
}
