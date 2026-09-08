import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import NovelCard from "@/components/NovelCard";
import { getNovels, getTotalStats, Novel } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  let novels: Novel[] = [];
  let stats = { novel_count: 0, total_chapters: 0, uploaded_chapters: 0 };
  let admin = "";

  try {
    [novels, stats] = await Promise.all([getNovels(), getTotalStats()]);
  } catch {
    // DB not configured yet
  }

  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (session) {
      const parsed = JSON.parse(session.value);
      admin = parsed.username || "";
    }
  } catch {
    // no session
  }

  return (
    <div className="min-h-screen">
      <Navbar admin={admin} />
      <Hero
        novelCount={Number(stats.novel_count) || 0}
        totalChapters={Number(stats.total_chapters) || 0}
        totalUploaded={Number(stats.uploaded_chapters) || 0}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Novel Audiobooks</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {novels.length} novel{novels.length !== 1 ? "s" : ""} being tracked
            </p>
          </div>
        </div>

        {novels.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-3xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              No novels tracked yet
            </h3>
            <p className="text-[var(--text-muted)] text-sm mb-8 max-w-md mx-auto">
              Start by adding your first novel audiobook through the admin dashboard.
            </p>
            <a
              href="/admin/login"
              className="inline-flex items-center gap-2 btn-primary text-black font-semibold px-8 py-3 rounded-xl"
            >
              Get Started
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {novels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-[var(--border)] py-8 text-center">
        <p className="text-[var(--text-muted)] text-sm">
          DarkPaw Chronicles &copy; {new Date().getFullYear()} &mdash; Audiobook Progress Tracker
        </p>
      </footer>
    </div>
  );
}
