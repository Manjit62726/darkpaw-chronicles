import Image from "next/image";
import ProgressBar from "./ProgressBar";

interface Novel {
  id: number;
  title: string;
  novel_name: string;
  youtube_url: string;
  thumbnail_url: string;
  total_chapters: number;
  uploaded_chapters: number;
  status: string;
}

export default function NovelCard({ novel }: { novel: Novel }) {
  const percentage = novel.total_chapters > 0
    ? Math.round((novel.uploaded_chapters / novel.total_chapters) * 100)
    : 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300">
      {/* Thumbnail */}
      <a
        href={novel.youtube_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-video overflow-hidden"
      >
        {novel.thumbnail_url ? (
          <Image
            src={novel.thumbnail_url}
            alt={novel.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-card)]">
            <svg className="w-14 h-14 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/40">
            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-base leading-tight drop-shadow-lg line-clamp-2">
            {novel.title}
          </h3>
        </div>

        {/* Percentage badge */}
        <div className="absolute top-3 right-3">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md ${
            percentage === 100
              ? "bg-emerald-500/90 text-white"
              : "bg-black/60 text-white border border-white/10"
          }`}>
            {percentage}%
          </div>
        </div>
      </a>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <p className="text-sm text-amber-400/80 font-medium truncate">
            {novel.novel_name}
          </p>
        </div>

        <ProgressBar
          uploaded={novel.uploaded_chapters}
          total={novel.total_chapters}
          status={novel.status}
        />

        <a
          href={novel.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white text-sm font-semibold rounded-xl border border-red-600/20 hover:border-red-600 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
            <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          Watch on YouTube
        </a>
      </div>
    </div>
  );
}
