import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import { getNovel } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const novel = await getNovel(parseInt(id));

  if (!novel) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-6 inline-block">
          &larr; Back
        </Link>

        {/* Thumbnail */}
        {novel.thumbnail_url && (
          <div className="w-full aspect-video rounded-xl overflow-hidden mb-6">
            <Image
              src={novel.thumbnail_url}
              alt={novel.title}
              width={1280}
              height={720}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold mb-1">{novel.title}</h1>
        <p className="text-sm text-[var(--accent)] mb-4">{novel.novel_name}</p>

        {/* Progress */}
        <div className="card p-4 mb-6">
          <ProgressBar
            uploaded={novel.uploaded_chapters}
            total={novel.total_chapters}
            status={novel.status}
            size="md"
          />
        </div>

        {/* Notes */}
        {novel.notes && (
          <div className="card p-4 mb-6">
            <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Notes</h2>
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{novel.notes}</p>
          </div>
        )}

        {/* Links */}
        <div className="flex gap-3">
          <a
            href={novel.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch on YouTube
          </a>
          {novel.playlist_url && (
            <a
              href={novel.playlist_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Playlist
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
