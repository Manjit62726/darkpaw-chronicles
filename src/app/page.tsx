import Navbar from "@/components/Navbar";
import NovelList from "@/components/NovelList";
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
        <NovelList novels={novels} />
      </section>
    </div>
  );
}
