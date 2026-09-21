'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import { getToken } from '../../../lib/auth';

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  votes: number;
  hasVoted?: boolean;
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PromptDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const res = await fetch(`${API}/api/prompts/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setPrompt(data);
      } catch (e) {
        setError('Prompt not found');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleVote = async () => {
    if (!prompt) return;

    const token = getToken();
    if (!token) {
      alert('Connecte-toi pour voter ! 🔐');
      return;
    }

    setVoting(true);
    try {
      const res = await fetch(`${API}/api/prompts/${prompt.id}/vote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Vote failed');
      const data = await res.json();
      setPrompt({
        ...prompt,
        votes: data.votes,
        hasVoted: data.hasVoted,
      });
    } catch (e) {
      alert('Erreur lors du vote');
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!prompt) return;
    const confirmed = confirm(`Delete "${prompt.title}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/prompts/${prompt.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Delete failed');
      router.push('/');
    } catch (e) {
      alert('Error deleting');
      setDeleting(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-6 text-sm"
          >
            ← Back to prompts
          </Link>

          {loading && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 animate-pulse">
              <div className="h-8 bg-slate-800 rounded w-1/2 mb-6" />
              <div className="h-32 bg-slate-800 rounded mb-6" />
              <div className="h-4 bg-slate-800 rounded w-1/3" />
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">😕</div>
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <Link
                href="/"
                className="inline-block text-blue-400 hover:text-blue-300"
              >
                Go back home
              </Link>
            </div>
          )}

          {prompt && !loading && (
            <article className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 animate-in fade-in duration-300">
              <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                {prompt.title}
              </h1>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 mb-6">
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {prompt.content}
                </p>
              </div>

              {prompt.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {prompt.tags.map((t) => (
                    <span
                      key={t}
                      className="bg-slate-800 text-slate-300 text-sm px-3 py-1 rounded-md border border-slate-700"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-4 border-t border-slate-800 pt-6">
                <div className="flex items-center gap-6 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span>👤</span>
                    <span>{prompt.author}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span>📅</span>
                    <span>
                      {new Date(prompt.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleVote}
                    disabled={voting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition disabled:opacity-50 font-medium ${
                      prompt.hasVoted
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 hover:bg-yellow-500/30'
                        : 'bg-slate-800/60 border-slate-700 hover:bg-yellow-500/20 hover:border-yellow-500 hover:text-yellow-400'
                    }`}
                    title={
                      prompt.hasVoted ? 'Retirer mon vote' : 'Voter pour ce prompt'
                    }
                  >
                    <span>{prompt.hasVoted ? '⭐' : '☆'}</span>
                    <span>{prompt.votes}</span>
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition disabled:opacity-50 font-medium"
                  >
                    {deleting ? '⏳ Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            </article>
          )}
        </div>
      </main>
    </>
  );
}