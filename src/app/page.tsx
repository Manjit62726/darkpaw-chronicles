import Navbar from "@/components/Navbar";
import NovelCard from "@/components/NovelCard";
import { getNovels, Novel } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  let novels: Novel[] = [];

  try {
    novels = await getNovels();
  } catch {
    // DB not configured yet
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16">
        {novels.length === 0 ? (
          <div className="text-center py-16 card">
            <p className="text-[var(--text-muted)] text-sm">No novels yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {novels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
