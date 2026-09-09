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
  playlist_url: string;
  notes: string;
  total_chapters: number;
  uploaded_chapters: number;
  status: string;
}

const emptyForm = {
  title: "",
  novelName: "",
  youtubeUrl: "",
  thumbnailUrl: "",
  playlistUrl: "",
  notes: "",
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

    const autoStatus = form.totalChapters > 0 && form.uploadedChapters >= form.totalChapters
      ? "completed"
      : form.status;

    const body = {
      title: form.title,
      novelName: form.novelName,
      youtubeUrl: form.youtubeUrl,
      thumbnailUrl: form.thumbnailUrl,
      playlistUrl: form.playlistUrl,
      notes: form.notes,
      totalChapters: form.totalChapters,
      uploadedChapters: form.uploadedChapters,
      status: autoStatus,
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
      playlistUrl: novel.playlist_url || "",
      notes: novel.notes || "",
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

  function handleExportCSV() {
    const headers = ["Title", "Novel Name", "YouTube URL", "Playlist URL", "Notes", "Total Chapters", "Uploaded", "Status"];
    const rows = novels.map((n) => [
      n.title,
      n.novel_name,
      n.youtube_url,
      n.playlist_url || "",
      (n.notes || "").replace(/"/g, '""'),
      String(n.total_chapters),
      String(n.uploaded_chapters),
      n.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "novels.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              &larr; Home
            </a>
            <span className="text-[var(--border)]">/</span>
            <span className="text-sm font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV} className="btn btn-outline text-xs px-3 py-1.5">
              Export
            </button>
            <button onClick={handleLogout} className="btn btn-outline text-xs px-3 py-1.5">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Novels</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{novels.length} total</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setForm(emptyForm);
            }}
            className="btn btn-primary text-sm"
          >
            {showForm ? "Cancel" : "Add Novel"}
          </button>
        </div>

        {showForm && (
          <div className="card p-5 mb-6">
            <h2 className="text-sm font-semibold mb-4">
              {editingId ? "Edit Novel" : "New Novel"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">YouTube URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={form.youtubeUrl}
                    onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                    onBlur={handleFetchYoutube}
                    className="input flex-1"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <button
                    type="button"
                    onClick={handleFetchYoutube}
                    disabled={fetching || !form.youtubeUrl}
                    className="btn btn-outline text-xs disabled:opacity-50"
                  >
                    {fetching ? "..." : "Fetch"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  Playlist URL <span className="text-[var(--text-muted)]">(optional)</span>
                </label>
                <input
                  type="url"
                  value={form.playlistUrl}
                  onChange={(e) => setForm({ ...form, playlistUrl: e.target.value })}
                  className="input"
                  placeholder="https://youtube.com/playlist?list=..."
                />
              </div>

              {form.thumbnailUrl && (
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg)]">
                  <img src={form.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Video Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input"
                    placeholder="Auto-filled from YouTube"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Novel Name</label>
                  <input
                    type="text"
                    required
                    value={form.novelName}
                    onChange={(e) => setForm({ ...form, novelName: e.target.value })}
                    className="input"
                    placeholder="e.g. Solo Leveling"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Total Chapters</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.totalChapters || ""}
                    onChange={(e) => setForm({ ...form, totalChapters: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Uploaded Chapters</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.uploadedChapters || ""}
                    onChange={(e) => setForm({ ...form, uploadedChapters: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="input"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  Notes <span className="text-[var(--text-muted)]">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Short description or links..."
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="btn btn-primary text-sm disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                  className="btn btn-outline text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : novels.length === 0 ? (
          <div className="text-center py-16 card">
            <p className="text-[var(--text-muted)] text-sm">No novels yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {novels.map((novel) => (
              <div key={novel.id} className="card p-4 flex items-center gap-4">
                <div className="w-32 h-20 rounded-lg overflow-hidden bg-[var(--bg)] shrink-0 hidden sm:block">
                  {novel.thumbnail_url ? (
                    <img src={novel.thumbnail_url} alt={novel.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{novel.title}</h3>
                  <p className="text-xs text-[var(--accent)] mt-0.5">{novel.novel_name}</p>
                  {novel.notes && (
                    <p className="text-xs text-[var(--text-muted)] mt-1 truncate">{novel.notes}</p>
                  )}
                  <div className="mt-2 max-w-xs">
                    <ProgressBar uploaded={novel.uploaded_chapters} total={novel.total_chapters} status={novel.status} size="sm" />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-1.5">
                    <a
                      href={novel.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline text-xs px-2.5 py-1.5"
                    >
                      Watch
                    </a>
                    <button onClick={() => handleEdit(novel)} className="btn btn-outline text-xs px-2.5 py-1.5">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(novel.id)}
                      className="btn text-xs px-2.5 py-1.5 text-red-400 border border-red-500/20 hover:bg-red-500/10"
                    >
                      Del
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
