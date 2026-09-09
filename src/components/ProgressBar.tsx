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
  const heights = { sm: "h-1", md: "h-1.5", lg: "h-2" };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-[var(--text-muted)]">
          {uploaded}/{total}
        </span>
        <span className={`text-[10px] font-medium ${isCompleted ? "text-emerald-500" : "text-[var(--accent)]"}`}>
          {isCompleted ? "Done" : "Ongoing"}
        </span>
      </div>
      <div className={`w-full ${heights[size]} bg-[var(--bg)] rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-[var(--accent)]"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
