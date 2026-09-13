"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: number;
  username: string;
  profile_image: string;
}

export default function CommunityNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/community/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "me" }),
        });
        const data = await res.json();
        if (!cancelled && mountedRef.current) {
          setUser(data.user);
        }
      } catch {
        if (!cancelled && mountedRef.current) {
          setUser(null);
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; mountedRef.current = false; };
  }, []);

  async function handleLogout() {
    await fetch("/api/community/auth", { method: "DELETE" });
    setUser(null);
    setMenuOpen(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="/community"
        className="text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors px-2 py-1"
      >
        Community
      </a>

      {loading ? (
        <div className="w-5 h-5 border-2 border-[var(--border)] border-t-transparent rounded-full animate-spin" />
      ) : user ? (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
          >
            {user.profile_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profile_image}
                alt={user.username}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[10px] font-bold text-black">
                {user.username[0].toUpperCase()}
              </div>
            )}
            <span className="text-[var(--text-secondary)] hidden sm:inline">{user.username}</span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-44 card p-1.5 shadow-xl">
                <a
                  href="/community/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg)] rounded-lg transition-colors"
                >
                  Profile
                </a>
                <Link
                  href="/community/posts"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg)] rounded-lg transition-colors"
                >
                  Posts
                </Link>
                <hr className="border-[var(--border)] my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <a
            href="/community/login"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors px-2 py-1"
          >
            Login
          </a>
          <a
            href="/community/register"
            className="btn btn-primary text-xs px-3 py-1.5"
          >
            Sign Up
          </a>
        </div>
      )}
    </div>
  );
}
