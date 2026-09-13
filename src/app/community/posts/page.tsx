"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  profile_image: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  user_vote: string | null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function loadPosts() {
      try {
        const res = await fetch("/api/community/posts");
        const data = await res.json();
        if (!cancelled && mountedRef.current) {
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      }
    }

    loadPosts();
    return () => { cancelled = true; mountedRef.current = false; };
  }, []);

  async function reloadPosts() {
    try {
      const res = await fetch("/api/community/posts");
      const data = await res.json();
      if (mountedRef.current) {
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (res.status === 401) {
        router.push("/community/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      setTitle("");
      setContent("");
      setShowNew(false);
      await reloadPosts();
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(postId: number, voteType: "up" | "down") {
    const res = await fetch(`/api/community/posts/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteType }),
    });
    if (res.status === 401) {
      router.push("/community/login");
      return;
    }
    await reloadPosts();
  }

  return (
    <div className="min-h-screen">
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Posts</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">Community discussions</p>
          </div>
          <div className="flex gap-2">
            <Link href="/community" className="btn btn-outline text-xs">
              Voting
            </Link>
            <button onClick={() => setShowNew(!showNew)} className="btn btn-primary text-xs">
              {showNew ? "Cancel" : "New Post"}
            </button>
          </div>
        </div>

        {showNew && (
          <div className="card p-5 mb-6">
            <h2 className="text-sm font-semibold mb-3">Create Post</h2>
            {error && (
              <div className="rounded-lg px-4 py-2 text-sm bg-red-500/10 border border-red-500/20 text-red-400 mb-3">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Post title"
                autoFocus
              />
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input"
                rows={4}
                placeholder="Write your thoughts..."
              />
              <button type="submit" disabled={submitting} className="btn btn-primary text-sm disabled:opacity-50">
                {submitting ? "Posting..." : "Post"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[var(--text-muted)]">No posts yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="card p-4">
                <div className="flex gap-3">
                  <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                    <button
                      onClick={() => handleVote(post.id, "up")}
                      className={`p-1 rounded transition-colors ${
                        post.user_vote === "up"
                          ? "text-[var(--accent)] bg-[var(--accent)]/10"
                          : "text-[var(--text-muted)] hover:text-[var(--accent)]"
                      }`}
                    >
                      <svg className="w-4 h-4" fill={post.user_vote === "up" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <span className={`text-xs font-medium ${
                      post.upvotes - post.downvotes > 0 ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                    }`}>
                      {post.upvotes - post.downvotes}
                    </span>
                    <button
                      onClick={() => handleVote(post.id, "down")}
                      className={`p-1 rounded transition-colors ${
                        post.user_vote === "down"
                          ? "text-red-400 bg-red-500/10"
                          : "text-[var(--text-muted)] hover:text-red-400"
                      }`}
                    >
                      <svg className="w-4 h-4" fill={post.user_vote === "down" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <a href={`/community/posts/${post.id}`} className="font-medium text-sm hover:text-[var(--accent)] transition-colors">
                      {post.title}
                    </a>
                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        {post.profile_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={post.profile_image} alt="" className="w-4 h-4 rounded-full object-cover" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-[var(--accent)] flex items-center justify-center text-[8px] font-bold text-black">
                            {post.username[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs text-[var(--text-muted)]">{post.username}</span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{timeAgo(post.created_at)}</span>
                      <a href={`/community/posts/${post.id}`} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                        {post.comment_count} comments
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
