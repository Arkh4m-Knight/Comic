"use client";
import { useState } from "react";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {mode === "signup" ? "Create Account" : "Sign In"}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {confirmNotice ? (
          <div className="space-y-4">
            <p className="text-sm text-neutral-300">
              Check your email — we sent a confirmation link. Click it, then come back and sign in.
            </p>
            <button
              onClick={() => {
                setMode("signin");
                setConfirmNotice(false);
              }}
              className="w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white hover:bg-brand-dark"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-white outline-none focus:border-brand"
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-white outline-none focus:border-brand"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-white outline-none focus:border-brand"
              />
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {loading
                ? mode === "signup" ? "Creating Account..." : "Signing In..."
                : mode === "signup" ? "Create Account" : "Sign In"}
            </button>

            <p className="text-center text-sm text-neutral-400">
              {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signup" ? "signin" : "signup");
                  setError("");
                }}
                className="text-brand hover:underline"
              >
                {mode === "signup" ? "Sign In" : "Create one"}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
