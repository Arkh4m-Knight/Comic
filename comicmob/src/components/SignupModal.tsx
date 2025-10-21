"use client";
import { useState } from "react";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SignupModal({ isOpen, onClose, onSuccess }: SignupModalProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Signup failed");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Create Account</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-white outline-none focus:border-brand"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
