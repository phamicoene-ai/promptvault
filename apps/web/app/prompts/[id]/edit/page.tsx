'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import { getToken, getUser } from '../../../../lib/auth';

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  userId?: string | null;
  votes: number;
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EditPromptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

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

        // Vérifie qu'on est le owner
        const user = getUser();
        if (!user || data.userId !== user.id) {
          setError('Vous ne pouvez modifier que vos propres prompts.');
          return;
        }

        setPrompt(data);
        setTitle(data.title);
        setContent(data.content);
        setTagsInput((data.tags || []).join(', '));
      } catch (e) {
        setError('Prompt introuvable');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      alert('Connecte-toi pour modifier ce prompt ! 🔐');
      return;
    }

    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch(`${API}/api/prompts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur update');
      }

      router.push(`/prompts/${id}`);
    } catch (e: any) {
      alert(e.message || 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <Link
            href={`/prompts/${id}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-6 text-sm"
          >
            ← Retour
          </Link>

          {loading && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 animate-pulse">
              <div className="h-8 bg-slate-800 rounded w-1/2 mb-6" />
              <div className="h-32 bg-slate-800 rounded mb-6" />
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🚫</div>
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <Link
                href="/"
                className="inline-block text-blue-400 hover:text-blue-300"
              >
                Retour à l'accueil
              </Link>
            </div>
          )}

          {prompt && !loading && !error && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
              <h1 className="text-2xl font-bold mb-6">
                ✏️ Modifier le prompt
              </h1>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Code Review Expert"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Contenu *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Ex: Tu es un développeur senior..."
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Tags (séparés par virgule)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="code, review, dev"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Link
                    href={`/prompts/${id}`}
                    className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
                  >
                    Annuler
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium transition"
                  >
                    {saving ? 'Enregistrement...' : '💾 Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </>
  );
}