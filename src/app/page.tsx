import Hero from "@/components/Hero";
import NovelCard from "@/components/NovelCard";
import { getNovels, Novel } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  let novels: Novel[] = [];

  try {
    novels = await getNovels();
  } catch {
    // DB not configured yet - show empty state
  }

  const totalChapters = novels.reduce((sum, n) => sum + (n.total_chapters || 0), 0);
  const totalUploaded = novels.reduce((sum, n) => sum + (n.uploaded_chapters || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <Hero
        novelCount={novels.length}
        totalChapters={totalChapters}
        totalUploaded={totalUploaded}
      />

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Novel Audiobooks</h2>
          <a
            href="/admin"
            className="text-sm text-zinc-500 hover:text-amber-400 transition-colors"
          >
            Manage →
          </a>
        </div>

        {novels.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl">
            <svg className="w-16 h-16 mx-auto text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-zinc-500 text-lg mb-2">No novels tracked yet</p>
            <p className="text-zinc-600 text-sm mb-6">Add your first novel audiobook to start tracking progress.</p>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Add Your First Novel
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {novels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-zinc-900 py-8 text-center text-zinc-600 text-sm">
        <p>DarkPaw Chronicles &copy; {new Date().getFullYear()} &mdash; Audiobook Progress Tracker</p>
      </footer>
    </div>
  );
}
