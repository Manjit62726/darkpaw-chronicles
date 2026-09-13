"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/community/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }

      router.push("/community");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <a href="/community" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            &larr; Back to Community
          </a>
          <h1 className="text-xl font-bold mt-4">Create Account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Join the community to vote and post</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg px-4 py-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Choose a username"
              autoFocus
              minLength={2}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Letters, numbers, and underscores only</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="At least 4 characters"
              minLength={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="Repeat password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 font-medium disabled:opacity-50">
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="text-xs text-center text-[var(--text-muted)]">
            Already have an account?{" "}
            <a href="/community/login" className="text-[var(--accent)] hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
