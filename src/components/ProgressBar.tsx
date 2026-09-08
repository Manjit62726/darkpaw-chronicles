"use client";

interface ProgressBarProps {
  uploaded: number;
  total: number;
  status: string;
}

export default function ProgressBar({ uploaded, total, status }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-zinc-400">
          {uploaded} / {total} chapters
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          status === "completed"
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-amber-500/20 text-amber-400"
        }`}>
          {status === "completed" ? "Completed" : "Ongoing"}
        </span>
      </div>
      <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background:
              status === "completed"
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, #f59e0b, #fbbf24)",
          }}
        />
      </div>
      <p className="text-right text-xs text-zinc-500 mt-1">{percentage}% complete</p>
    </div>
  );
}
