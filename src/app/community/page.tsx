"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VoteButtons from "@/components/VoteButtons";

interface Novel {
  id: number;
  title: string;
  novel_name: string;
  youtube_url: string;
  thumbnail_url: string;
  total_chapters: number;
  uploaded_chapters: number;
  status: string;
  vote_upvotes: number;
  vote_downvotes: number;
  user_vote: string | null;
}

export default function CommunityPage() {
  const router = useRouter();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/community/novels");
        const data = await res.json();
        if (!cancelled && mountedRef.current) {
          setNovels(Array.isArray(data) ? data : []);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; mountedRef.current = false; };
  }, []);

  async function handleVote(novelId: number, voteType: "up" | "down") {
    const res = await fetch(`/api/community/novels/${novelId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteType }),
    });
    if (res.status === 401) {
      router.push("/community/login");
      return;
    }
    const reloadRes = await fetch("/api/community/novels");
    const data = await reloadRes.json();
    setNovels(Array.isArray(data) ? data : []);
  }

  return (
    <div className="min-h-screen">
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Community Voting</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Vote for novels you want to see uploaded. Only novels with 60+ remaining chapters are shown.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Link href="/community/posts" className="btn btn-outline text-xs">
            Posts &amp; Discussions
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : novels.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[var(--text-muted)]">No novels currently need more votes.</p>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Novels with 60+ remaining chapters will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {novels.map((novel) => (
              <div key={novel.id} className="card p-4 flex items-center gap-4">
                <div className="w-28 h-16 rounded-lg overflow-hidden bg-[var(--bg)] shrink-0 hidden sm:block">
                  {novel.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
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
                  <a href={`/novel/${novel.id}`} className="font-medium text-sm hover:text-[var(--accent)] transition-colors line-clamp-1">
                    {novel.title}
                  </a>
                  <p className="text-xs text-[var(--accent)] mt-0.5">{novel.novel_name}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-[var(--text-muted)]">
                      {novel.uploaded_chapters}/{novel.total_chapters} uploaded
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {novel.total_chapters - novel.uploaded_chapters} remaining
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <VoteButtons
                    upvotes={novel.vote_upvotes || 0}
                    downvotes={novel.vote_downvotes || 0}
                    userVote={novel.user_vote}
                    onVote={(vt) => handleVote(novel.id, vt)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
