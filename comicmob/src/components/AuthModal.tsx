"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `${mode === "signup" ? "Signup" : "Sign in"} failed`);
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
