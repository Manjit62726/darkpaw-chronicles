"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";

interface Novel {
  id: number;
  title: string;
  novel_name: string;
  youtube_url: string;
  thumbnail_url: string;
  total_chapters: number;
  uploaded_chapters: number;
  status: string;
}

const emptyForm = {
  title: "",
  novelName: "",
  youtubeUrl: "",
  thumbnailUrl: "",
  totalChapters: 0,
  uploadedChapters: 0,
  status: "ongoing",
};

export default function AdminPage() {
  const router = useRouter();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchNovels();
  }, []);

  async function fetchNovels() {
    try {
      const res = await fetch("/api/novels");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setNovels(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchYoutube() {
    if (!form.youtubeUrl) return;
    setFetching(true);
    try {
      const res = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.youtubeUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({
          ...prev,
          title: data.title || prev.title,
          thumbnailUrl: data.thumbnail || prev.thumbnailUrl,
        }));
      }
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      title: form.title,
      novelName: form.novelName,
      youtubeUrl: form.youtubeUrl,
      thumbnailUrl: form.thumbnailUrl,
      totalChapters: form.totalChapters,
      uploadedChapters: form.uploadedChapters,
      status: form.status,
    };

    try {
      if (editingId) {
        await fetch(`/api/novels/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/novels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await fetchNovels();
    } catch {
      alert("Failed to save novel");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this novel permanently?")) return;
    try {
      await fetch(`/api/novels/${id}`, { method: "DELETE" });
      await fetchNovels();
    } catch {
      alert("Failed to delete");
    }
  }

  function handleEdit(novel: Novel) {
    setEditingId(novel.id);
    setForm({
      title: novel.title,
      novelName: novel.novel_name,
      youtubeUrl: novel.youtube_url,
      thumbnailUrl: novel.thumbnail_url,
      totalChapters: novel.total_chapters,
      uploadedChapters: novel.uploaded_chapters,
      status: novel.status,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </a>
            <div className="w-px h-6 bg-[var(--border)]" />
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-[var(--text-muted)] hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/5"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Your Novels</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {novels.length} novel{novels.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setForm(emptyForm);
            }}
            className="btn-primary text-sm font-semibold px-5 py-2.5 rounded-xl text-black flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Novel
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card rounded-2xl p-6 mb-8 glow-accent">
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
              {editingId ? "Edit Novel" : "Add New Novel"}
              <span className="text-xs text-[var(--text-muted)] font-normal">
                (Paste YouTube URL to auto-fill title & thumbnail)
              </span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* YouTube URL with fetch button */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  YouTube Video URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={form.youtubeUrl}
                    onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                    onBlur={handleFetchYoutube}
                    className="input-field flex-1 px-4 py-2.5 rounded-xl text-sm"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <button
                    type="button"
                    onClick={handleFetchYoutube}
                    disabled={fetching || !form.youtubeUrl}
                    className="btn-ghost px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {fetching ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    Fetch
                  </button>
                </div>
              </div>

              {/* Preview thumbnail */}
              {form.thumbnailUrl && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
                  <img
                    src={form.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                    Preview
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Video Title
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field w-full px-4 py-2.5 rounded-xl text-sm"
                    placeholder="Auto-filled from YouTube"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Real Novel Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.novelName}
                    onChange={(e) => setForm({ ...form, novelName: e.target.value })}
                    className="input-field w-full px-4 py-2.5 rounded-xl text-sm"
                    placeholder="e.g. Solo Leveling"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Total Chapters (Novel)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.totalChapters || ""}
                    onChange={(e) => setForm({ ...form, totalChapters: parseInt(e.target.value) || 0 })}
                    className="input-field w-full px-4 py-2.5 rounded-xl text-sm"
                    placeholder="e.g. 200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Uploaded Chapters (YouTube)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.uploadedChapters || ""}
                    onChange={(e) => setForm({ ...form, uploadedChapters: parseInt(e.target.value) || 0 })}
                    className="input-field w-full px-4 py-2.5 rounded-xl text-sm"
                    placeholder="e.g. 45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="input-field w-full px-4 py-2.5 rounded-xl text-sm"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail URL (hidden but set by fetch) */}
              <input type="hidden" value={form.thumbnailUrl} />

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update Novel" : "Add Novel"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="btn-ghost px-6 py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Novel List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[var(--text-muted)] text-sm mt-4">Loading...</p>
          </div>
        ) : novels.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <p className="text-[var(--text-muted)]">No novels added yet. Click &quot;Add Novel&quot; to start.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {novels.map((novel) => (
              <div
                key={novel.id}
                className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-40 h-24 rounded-xl overflow-hidden bg-[var(--bg-secondary)] shrink-0 relative">
                  {novel.thumbnail_url ? (
                    <img
                      src={novel.thumbnail_url}
                      alt={novel.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[var(--text-primary)] truncate">{novel.title}</h4>
                  <p className="text-sm text-amber-400/70 mt-0.5">{novel.novel_name}</p>
                  <div className="mt-3 max-w-md">
                    <ProgressBar
                      uploaded={novel.uploaded_chapters}
                      total={novel.total_chapters}
                      status={novel.status}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <a
                    href={novel.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                      <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    Watch
                  </a>
                  <button
                    onClick={() => handleEdit(novel)}
                    className="btn-ghost px-3 py-2 rounded-xl text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(novel.id)}
                    className="px-3 py-2 rounded-xl text-xs text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
