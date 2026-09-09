interface HeroProps {
  novelCount: number;
  totalChapters: number;
  totalUploaded: number;
}

export default function Hero({ novelCount, totalChapters, totalUploaded }: HeroProps) {
  const percentage = totalChapters > 0 ? Math.round((totalUploaded / totalChapters) * 100) : 0;

  return (
    <section className="pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          DarkPaw Chronicles
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8">
          Novel audiobook progress tracker
        </p>

        <div className="grid grid-cols-4 gap-3 max-w-xl">
          <div className="card p-4">
            <div className="text-2xl font-bold">{novelCount}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Novels</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold">{totalChapters}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Chapters</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-[var(--accent)]">{totalUploaded}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Uploaded</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold">{percentage}%</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Done</div>
          </div>
        </div>

        {totalChapters > 0 && (
          <div className="max-w-xl mt-6">
            <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {totalUploaded} of {totalChapters} chapters
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
