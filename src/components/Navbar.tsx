export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-[var(--text)] font-semibold text-[15px]">
          <span className="text-[var(--accent)]">DP</span>
          <span>Chronicles</span>
        </a>

        <a
          href="https://www.youtube.com/@DarkPawChronicles"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline text-xs px-3 py-1.5"
        >
          YouTube
        </a>
      </div>
    </nav>
  );
}
