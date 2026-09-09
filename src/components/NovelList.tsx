"use client";

import { useState, useMemo } from "react";
import NovelCard from "./NovelCard";

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
  updated_at: string;
}

export default function NovelList({ novels }: { novels: Novel[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ongoing" | "completed">("all");

  const filtered = useMemo(() => {
    let result = novels;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.novel_name.toLowerCase().includes(q)
      );
    }

    if (filter !== "all") {
      result = result.filter((n) => n.status === filter);
    }

    // ongoing first, then completed
    return [...result].sort((a, b) => {
      if (a.status === "ongoing" && b.status === "completed") return -1;
      if (a.status === "completed" && b.status === "ongoing") return 1;
      return 0;
    });
  }, [novels, search, filter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1"
          placeholder="Search novels..."
        />
        <div className="flex gap-1">
          {(["all", "ongoing", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn text-xs px-3 py-2 ${
                filter === f ? "btn-primary" : "btn-outline"
              }`}
            >
              {f === "all" ? "All" : f === "ongoing" ? "Ongoing" : "Done"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-[var(--text-muted)] text-sm">
            {search || filter !== "all" ? "No matches." : "No novels yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      )}
    </div>
  );
}
