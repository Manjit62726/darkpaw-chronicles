interface HeroProps {
  novelCount: number;
  totalChapters: number;
  totalUploaded: number;
}

export default function Hero({ novelCount, totalChapters, totalUploaded }: HeroProps) {
  const percentage = totalChapters > 0 ? Math.round((totalUploaded / totalChapters) * 100) : 0;

  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 blur-[150px] rounded-full" />
        <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-orange-500/3 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-amber-500/3 blur-[80px] rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8 animate-pulse-glow">
          <span className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="text-amber-400 text-sm font-medium">Audiobook Progress Tracker</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">
          <span className="text-[var(--text-primary)]">DarkPaw </span>
          <span className="text-gradient">Chronicles</span>
        </h1>

        <p className="text-[var(--text-secondary)] text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Track every novel audiobook from reading sites to YouTube uploads.
          <br className="hidden sm:block" />
          See your progress at a glance.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-5">
            <div className="text-3xl font-black text-[var(--text-primary)]">{novelCount}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1 font-medium uppercase tracking-wider">Novels</div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="text-3xl font-black text-[var(--text-primary)]">{totalChapters}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1 font-medium uppercase tracking-wider">Total Ch.</div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="text-3xl font-black text-amber-400">{totalUploaded}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1 font-medium uppercase tracking-wider">Uploaded</div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="text-3xl font-black text-emerald-400">{percentage}%</div>
            <div className="text-xs text-[var(--text-muted)] mt-1 font-medium uppercase tracking-wider">Complete</div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        {totalChapters > 0 && (
          <div className="max-w-2xl mx-auto mt-10">
            <div className="h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className="h-full rounded-full progress-bar-completed transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Overall: {totalUploaded} of {totalChapters} chapters uploaded
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
