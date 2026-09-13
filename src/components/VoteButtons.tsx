"use client";

import { useState } from "react";

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote: string | null;
  onVote: (voteType: "up" | "down") => void | Promise<void>;
  size?: "sm" | "md";
}

export default function VoteButtons({ upvotes, downvotes, userVote, onVote, size = "md" }: VoteButtonsProps) {
  const [loading, setLoading] = useState(false);
  const score = upvotes - downvotes;
  const btnSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  async function handleVote(voteType: "up" | "down") {
    setLoading(true);
    try {
      await onVote(voteType);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleVote("up")}
        disabled={loading}
        className={`p-1 rounded transition-colors ${
          userVote === "up"
            ? "text-[var(--accent)] bg-[var(--accent)]/10"
            : "text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5"
        }`}
      >
        <svg className={btnSize} fill={userVote === "up" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <span className={`${textSize} font-medium min-w-[20px] text-center ${
        score > 0 ? "text-[var(--accent)]" : score < 0 ? "text-red-400" : "text-[var(--text-muted)]"
      }`}>
        {score}
      </span>

      <button
        onClick={() => handleVote("down")}
        disabled={loading}
        className={`p-1 rounded transition-colors ${
          userVote === "down"
            ? "text-red-400 bg-red-500/10"
            : "text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/5"
        }`}
      >
        <svg className={btnSize} fill={userVote === "down" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
