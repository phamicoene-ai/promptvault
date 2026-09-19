'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUser, logout, type User } from '../../lib/auth';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = '/';
  };

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

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition"
          >
            Explore
          </Link>

          {mounted && user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300 hidden sm:inline">
                👤 {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-red-400 transition"
              >
                Logout
              </button>
            </div>
          ) : mounted ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm text-slate-400 hover:text-white transition px-3 py-1.5"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition"
              >
                Register
              </Link>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}