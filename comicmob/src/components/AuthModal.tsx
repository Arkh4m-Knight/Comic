"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/src/lib/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmNotice, setConfirmNotice] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setConfirmNotice(false);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup"
            ? { action: "signup", email, username, password }
            : { action: "signin", email, password }
        ),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          typeof data?.error === "string" && data.error.length > 0
            ? data.error
            : `${mode === "signup" ? "Signup" : "Sign in"} failed. Please try again.`;
        throw new Error(message);
      }

      if (mode === "signup" && data.needsEmailConfirmation) {
        setConfirmNotice(true);
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
      setEmail("");
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("Couldn't start Google sign-in. Please try again.");
      setGoogleLoading(false);
    }
    // On success, the browser navigates away to Google -- no further
    // action needed here; the callback route handles the return trip.
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4">
      <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-sm border border-line bg-ink-900 p-7">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl italic text-paper">
            {mode === "signup" ? "Create Account" : "Sign In"}
          </h2>
          <button onClick={onClose} className="text-paper-soft hover:text-paper">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!confirmNotice && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="mb-5 flex w-full items-center justify-center gap-3 rounded-sm border border-line bg-ink-950 py-3 text-sm font-medium text-paper transition-colors hover:border-foil disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </button>
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[11px] uppercase tracking-widest2 text-paper-faint">or</span>
              <div className="h-px flex-1 bg-line" />
            </div>
          </>
        )}

        {confirmNotice ? (
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-paper-soft">
              Check your email — we sent a confirmation link. Click it, then come back and sign in.
            </p>
            <button
              onClick={() => {
                setMode("signin");
                setConfirmNotice(false);
              }}
              className="w-full rounded-sm bg-foil py-3 text-sm font-semibold text-ink-950 hover:bg-foil-bright"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-widest2 text-paper-soft">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-sm border border-line bg-ink-950 p-3 text-sm text-paper outline-none focus:border-foil"
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-widest2 text-paper-soft">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-sm border border-line bg-ink-950 p-3 text-sm text-paper outline-none focus:border-foil"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-widest2 text-paper-soft">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-sm border border-line bg-ink-950 p-3 text-sm text-paper outline-none focus:border-foil"
              />
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-foil py-3 text-sm font-semibold text-ink-950 transition-colors hover:bg-foil-bright disabled:opacity-50"
            >
              {loading
                ? mode === "signup" ? "Creating Account..." : "Signing In..."
                : mode === "signup" ? "Create Account" : "Sign In"}
            </button>

            <p className="text-center text-xs text-paper-soft">
              {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signup" ? "signin" : "signup");
                  setError("");
                }}
                className="text-foil hover:underline"
              >
                {mode === "signup" ? "Sign In" : "Create one"}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
