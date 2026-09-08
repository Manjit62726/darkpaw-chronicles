"use client";

interface ProgressBarProps {
  uploaded: number;
  total: number;
  status: string;
  size?: "sm" | "md" | "lg";
}

export default function ProgressBar({ uploaded, total, status, size = "md" }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 0;
  const isCompleted = status === "completed";

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {uploaded} / {total} chapters
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isCompleted
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
          }`}
        >
          {isCompleted ? "Completed" : "Ongoing"}
        </span>
      </div>
      <div className={`w-full ${heights[size]} bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border)]`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isCompleted ? "progress-bar-completed" : "progress-bar"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-right text-[10px] text-[var(--text-muted)] mt-1.5 font-medium">
        {percentage}% complete
      </p>
    </div>
  );
}
