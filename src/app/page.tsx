import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import NovelCard from "@/components/NovelCard";
import { getNovels, Novel } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  let novels: Novel[] = [];
  let admin = "";

  try {
    novels = await getNovels();
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

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
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
