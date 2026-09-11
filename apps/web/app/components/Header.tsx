import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">
            🔐
          </span>
          <span className="text-xl font-bold text-white group-hover:text-blue-400 transition">
            PromptVault
          </span>
        </Link>

        <Link
          href="/"
          className="text-sm text-slate-400 hover:text-white transition"
        >
          Explore
        </Link>
      </div>
    </header>
  );
}