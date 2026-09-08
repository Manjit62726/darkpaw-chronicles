interface HeroProps {
  novelCount: number;
  totalChapters: number;
  totalUploaded: number;
}

export default function Hero({ novelCount, totalChapters, totalUploaded }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full" />

      <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-amber-400 text-sm font-medium">Audiobook Progress Tracker</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-4">
          DarkPaw{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Chronicles
          </span>
        </h1>

        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
          Track the progress of every novel audiobook. See how many chapters are available
          on reading sites versus what&apos;s been uploaded to YouTube.
        </p>

        <div className="flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-white">{novelCount}</span>
            <span className="text-zinc-500 mt-1">Novels Tracked</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-white">{totalChapters}</span>
            <span className="text-zinc-500 mt-1">Total Chapters</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-amber-400">{totalUploaded}</span>
            <span className="text-zinc-500 mt-1">Videos Uploaded</span>
          </div>
        </div>
      </div>
    </section>
  );
}
