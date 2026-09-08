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
  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5">
      <a
        href={novel.youtube_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
          {novel.thumbnail_url ? (
            <Image
              src={novel.thumbnail_url}
              alt={novel.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-zinc-800 to-zinc-900">
              <svg className="w-12 h-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">
              {novel.title}
            </h3>
          </div>
        </div>
      </a>

      <div className="p-5">
        <p className="text-amber-400/80 text-sm font-medium mb-1">
          Novel: {novel.novel_name}
        </p>

        <div className="mt-4">
          <ProgressBar
            uploaded={novel.uploaded_chapters}
            total={novel.total_chapters}
            status={novel.status}
          />
        </div>

        <a
          href={novel.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors"
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
