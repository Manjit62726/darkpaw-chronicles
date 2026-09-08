"use client";

import { useState, useEffect } from "react";

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
  const [novels, setNovels] = useState<Novel[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNovels();
  }, []);

  async function fetchNovels() {
    try {
      const res = await fetch("/api/novels");
      const data = await res.json();
      setNovels(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
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
      await fetchNovels();
    } catch {
      alert("Failed to save novel");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this novel?")) return;
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <a href="/" className="text-zinc-500 hover:text-amber-400 text-sm mb-2 inline-block">
              ← Back to site
            </a>
            <h1 className="text-3xl font-black">Admin Dashboard</h1>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-10"
        >
          <h2 className="text-lg font-bold mb-4">
            {editingId ? "Edit Novel" : "Add New Novel"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Video Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                placeholder="e.g. Solo Leveling Ch.1 Audiobook"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Real Novel Name</label>
              <input
                type="text"
                required
                value={form.novelName}
                onChange={(e) => setForm({ ...form, novelName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                placeholder="e.g. Solo Leveling"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">YouTube URL</label>
              <input
                type="url"
                required
                value={form.youtubeUrl}
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Thumbnail URL</label>
              <input
                type="url"
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                placeholder="https://i.ytimg.com/..."
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Total Chapters (Novel)</label>
              <input
                type="number"
                required
                min={0}
                value={form.totalChapters || ""}
                onChange={(e) => setForm({ ...form, totalChapters: parseInt(e.target.value) || 0 })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                placeholder="e.g. 200"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Uploaded Chapters (YouTube)</label>
              <input
                type="number"
                required
                min={0}
                value={form.uploadedChapters || ""}
                onChange={(e) => setForm({ ...form, uploadedChapters: parseInt(e.target.value) || 0 })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                placeholder="e.g. 45"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              {saving ? "Saving..." : editingId ? "Update Novel" : "Add Novel"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Novel List */}
        <div>
          <h2 className="text-lg font-bold mb-4">Your Novels ({novels.length})</h2>
          {loading ? (
            <p className="text-zinc-500">Loading...</p>
          ) : novels.length === 0 ? (
            <p className="text-zinc-600">No novels added yet.</p>
          ) : (
            <div className="space-y-3">
              {novels.map((novel) => (
                <div
                  key={novel.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{novel.title}</p>
                    <p className="text-sm text-amber-400/70">{novel.novel_name}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {novel.uploaded_chapters}/{novel.total_chapters} chapters &bull;{" "}
                      <span className={novel.status === "completed" ? "text-emerald-400" : "text-amber-400"}>
                        {novel.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(novel)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(novel.id)}
                      className="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors"
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
    </div>
  );
}
