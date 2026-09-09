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

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-lg font-semibold mb-4">Novels</h2>

        {novels.length === 0 ? (
          <div className="text-center py-16 card">
            <p className="text-[var(--text-muted)] text-sm mb-4">No novels yet.</p>
            <a href="/admin/login" className="btn btn-primary text-sm">
              Get Started
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {novels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-[var(--border)] py-6 text-center">
        <p className="text-[var(--text-muted)] text-xs">
          DarkPaw Chronicles &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
