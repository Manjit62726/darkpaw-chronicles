"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  profile_image: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
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
          if (!data.user) {
            router.push("/community/login");
            return;
          }
          setUser(data.user);
          setPreview(data.user.profile_image || "");
        }
      } catch {
        if (!cancelled && mountedRef.current) {
          router.push("/community/login");
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; mountedRef.current = false; };
  }, [router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      setError("Image must be under 500KB");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!preview || preview === user?.profile_image) return;
    setUploading(true);
    setError("");

    try {
      const res = await fetch("/api/community/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setUser(data.user);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setUploading(true);
    try {
      const res = await fetch("/api/community/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "" }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setPreview("");
      }
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <section className="max-w-md mx-auto px-4 pt-20 pb-16">
        <a href="/community" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-4 inline-block">
          &larr; Back to Community
        </a>

        <h1 className="text-xl font-bold mb-6">Profile</h1>

        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-4">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-2xl font-bold text-black">
                {user.username[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-xs text-[var(--text-muted)]">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-[var(--text-muted)] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--bg)] file:text-[var(--text-secondary)] file:border file:border-[var(--border)] hover:file:border-[#3f3f46] cursor-pointer"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Max 500KB. Will be resized by browser.</p>
          </div>

          {error && (
            <div className="rounded-lg px-4 py-2 text-sm bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading || !preview || preview === user.profile_image}
              className="btn btn-primary text-sm disabled:opacity-50"
            >
              {uploading ? "Saving..." : "Save Image"}
            </button>
            {user.profile_image && (
              <button
                onClick={handleRemove}
                disabled={uploading}
                className="btn btn-outline text-sm text-red-400 border-red-500/20 hover:bg-red-500/10 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
