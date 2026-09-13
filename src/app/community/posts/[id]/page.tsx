"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import VoteButtons from "@/components/VoteButtons";

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  profile_image: string;
  content: string;
  parent_comment_id: number | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  user_vote: string | null;
}

interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  profile_image: string;
  upvotes: number;
  downvotes: number;
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

function CommentItem({
  comment,
  onReply,
  onVote,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  submittingReply,
  handleSubmitReply,
}: {
  comment: Comment;
  onReply: (id: number) => void;
  onVote: (id: number, vt: "up" | "down") => void;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  replyContent: string;
  setReplyContent: (v: string) => void;
  submittingReply: boolean;
  handleSubmitReply: (parentId: number) => void;
}) {
  return (
    <div className="py-3">
      <div className="flex items-start gap-2">
        <div className="shrink-0 mt-0.5">
          {comment.profile_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={comment.profile_image} alt="" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[9px] font-bold text-black">
              {comment.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">{comment.username}</span>
            <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <VoteButtons
              upvotes={comment.upvotes || 0}
              downvotes={comment.downvotes || 0}
              userVote={comment.user_vote}
              onVote={(vt) => onVote(comment.id, vt)}
              size="sm"
            />
            <button
              onClick={() => onReply(comment.id)}
              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Reply
            </button>
          </div>

          {replyingTo === comment.id && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitReply(comment.id);
              }}
              className="mt-2 flex gap-2"
            >
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="input text-xs py-1.5 flex-1"
                placeholder="Write a reply..."
                autoFocus
              />
              <button type="submit" disabled={submittingReply || !replyContent.trim()} className="btn btn-primary text-xs px-2.5 py-1 disabled:opacity-50">
                {submittingReply ? "..." : "Reply"}
              </button>
              <button type="button" onClick={() => setReplyingTo(null)} className="btn btn-outline text-xs px-2.5 py-1">
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function loadData() {
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`/api/community/posts/${postId}`),
          fetch(`/api/community/posts/${postId}/comments`),
        ]);
        if (postRes.ok && !cancelled && mountedRef.current) setPost(await postRes.json());
        const commentsData = await commentsRes.json();
        if (!cancelled && mountedRef.current) {
          setComments(Array.isArray(commentsData) ? commentsData : []);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { cancelled = true; mountedRef.current = false; };
  }, [postId]);

  async function reload() {
    try {
      const [postRes, commentsRes] = await Promise.all([
        fetch(`/api/community/posts/${postId}`),
        fetch(`/api/community/posts/${postId}/comments`),
      ]);
      if (postRes.ok && mountedRef.current) setPost(await postRes.json());
      const commentsData = await commentsRes.json();
      if (mountedRef.current) {
        setComments(Array.isArray(commentsData) ? commentsData : []);
      }
    } catch {
      // ignore
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });
      if (res.status === 401) {
        router.push("/community/login");
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed");
        return;
      }
      setCommentText("");
      await reload();
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: number) {
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, parentCommentId: parentId }),
      });
      if (res.status === 401) {
        router.push("/community/login");
        return;
      }
      setReplyContent("");
      setReplyingTo(null);
      await reload();
    } catch {
      // ignore
    } finally {
      setSubmittingReply(false);
    }
  }

  async function handleVotePost(voteType: "up" | "down") {
    const res = await fetch(`/api/community/posts/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteType }),
    });
    if (res.status === 401) {
      router.push("/community/login");
      return;
    }
    await reload();
  }

  async function handleVoteComment(commentId: number, voteType: "up" | "down") {
    const res = await fetch(`/api/community/comments/${commentId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteType }),
    });
    if (res.status === 401) {
      router.push("/community/login");
      return;
    }
    await reload();
  }

  const topLevelComments = comments.filter((c) => !c.parent_comment_id);
  const repliesMap = new Map<number, Comment[]>();
  comments.forEach((c) => {
    if (c.parent_comment_id) {
      const existing = repliesMap.get(c.parent_comment_id) || [];
      existing.push(c);
      repliesMap.set(c.parent_comment_id, existing);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Post not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16">
        <Link href="/community/posts" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-4 inline-block">
          &larr; Back to posts
        </Link>

        <div className="card p-5 mb-6">
          <div className="flex gap-3">
            <div className="shrink-0">
              <VoteButtons
                upvotes={post.upvotes || 0}
                downvotes={post.downvotes || 0}
                userVote={post.user_vote}
                onVote={handleVotePost}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold">{post.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                {post.profile_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.profile_image} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-[8px] font-bold text-black">
                    {post.username[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-[var(--text-muted)]">{post.username}</span>
                <span className="text-xs text-[var(--text-muted)]">{timeAgo(post.created_at)}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-3 whitespace-pre-wrap break-words">{post.content}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3">Comments ({comments.length})</h2>

          <form onSubmit={handleAddComment} className="mb-4">
            {error && (
              <div className="rounded-lg px-4 py-2 text-sm bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="input flex-1 text-sm"
                placeholder="Add a comment..."
              />
              <button type="submit" disabled={submitting || !commentText.trim()} className="btn btn-primary text-sm disabled:opacity-50">
                {submitting ? "..." : "Comment"}
              </button>
            </div>
          </form>

          <div className="divide-y divide-[var(--border)]">
            {topLevelComments.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  onReply={(id) => setReplyingTo(replyingTo === id ? null : id)}
                  onVote={handleVoteComment}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  submittingReply={submittingReply}
                  handleSubmitReply={handleReply}
                />
                {(repliesMap.get(comment.id) || []).map((reply) => (
                  <div key={reply.id} className="ml-8 border-l-2 border-[var(--border)] pl-3">
                    <CommentItem
                      comment={reply}
                      onReply={(id) => setReplyingTo(replyingTo === id ? null : id)}
                      onVote={handleVoteComment}
                      replyingTo={replyingTo}
                      setReplyingTo={setReplyingTo}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                      submittingReply={submittingReply}
                      handleSubmitReply={handleReply}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
