import Image from "next/image";
import ProgressBar from "./ProgressBar";

interface Novel {
  id: number;
  title: string;
  novel_name: string;
  youtube_url: string;
  thumbnail_url: string;
  playlist_url: string;
  total_chapters: number;
  uploaded_chapters: number;
  status: string;
}

export default function NovelCard({ novel }: { novel: Novel }) {
  return (
    <div className="card overflow-hidden">
      <a
        href={novel.youtube_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-video"
      >
        {novel.thumbnail_url ? (
          <Image
            src={novel.thumbnail_url}
            alt={novel.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-[var(--bg)]">
            <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </a>

      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2">
          {novel.title}
        </h3>
        <p className="text-xs text-[var(--accent)] mb-2">{novel.novel_name}</p>

        <ProgressBar
          uploaded={novel.uploaded_chapters}
          total={novel.total_chapters}
          status={novel.status}
          size="sm"
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          {novel.playlist_url ? (
            <a
              href={novel.playlist_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[#3f3f46] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Playlist
            </a>
          ) : (
            <div />
          )}
          <a
            href={novel.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[#3f3f46] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch
          </a>
        </div>
      </div>
    </div>
  );
}
