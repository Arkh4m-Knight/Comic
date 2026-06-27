"use client";
import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";

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
  }

  if (loading) {
    return <div className="h-8 w-16 animate-pulse rounded-md bg-neutral-800" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-neutral-300">{user.displayName || user.username || user.email}</span>
        <button
          onClick={handleSignOut}
          className="rounded-md border border-neutral-700 px-3 py-1 text-xs font-semibold text-white hover:bg-neutral-800"
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
        className="rounded-md border border-neutral-700 px-3 py-1 text-xs font-semibold text-white hover:bg-neutral-800"
      >
        Sign In
      </button>
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => refreshUser()}
      />
    </>
  );
}
