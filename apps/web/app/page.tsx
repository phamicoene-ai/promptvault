'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  votes: number;
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [author, setAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/prompts`);
      const data = await res.json();
      setPrompts(data.prompts || []);
    } catch (e) {
      setError('Impossible de charger les prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch(`${API}/api/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags,
          author: author.trim() || 'anonymous',
        }),
      });

      if (!res.ok) throw new Error('Erreur creation');

      setTitle('');
      setContent('');
      setTagsInput('');
      setAuthor('');
      setShowForm(false);

      await load();
    } catch (e) {
      alert('Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  // ⭐ VOTE
  const handleVote = async (id: string) => {
    setVotingId(id);
    try {
      const res = await fetch(`${API}/api/prompts/${id}/vote`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Erreur vote');

      const data = await res.json();

      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, votes: data.votes } : p)),
      );
    } catch (e) {
      alert('Erreur lors du vote');
    } finally {
      setVotingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">🔐 PromptVault</h1>
            <p className="text-slate-400">The open-source GitHub for AI prompts</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
          >
            {showForm ? '✕ Annuler' : '+ New Prompt'}
          </button>
        </div>

        {/* FORMULAIRE */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8 space-y-4"
          >
            <h2 className="text-xl font-semibold mb-4">Créer un nouveau prompt</h2>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Titre *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Code Review Expert"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Contenu *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ex: Tu es un développeur senior..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Tags (séparés par virgule)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="code, review, dev"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Auteur</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ton nom"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium transition"
            >
              {submitting ? 'Création...' : '✦ Créer le prompt'}
            </button>
          </form>
        )}

        {/* LISTE */}
        {loading && <p className="text-slate-400">Chargement...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && prompts.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg mb-2">Aucun prompt pour l'instant</p>
            <p className="text-sm">Clique sur "+ New Prompt" pour créer le premier !</p>
          </div>
        )}

        <div className="space-y-4">
          {prompts.map((p) => (
            <div
              key={p.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-slate-500 transition"
            >
              {/* TITRE CLIQUABLE → page détail */}
              <Link
                href={`/prompts/${p.id}`}
                className="block text-xl font-semibold mb-2 hover:text-blue-400 transition"
              >
                {p.title}
              </Link>

              <p className="text-slate-300 mb-3 whitespace-pre-wrap">{p.content}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex gap-2 flex-wrap">
                  {p.tags.map((t) => (
                    <span key={t} className="bg-slate-700 px-2 py-1 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>👤 {p.author}</span>

                  {/* BOUTON VOTE ⭐ */}
                  <button
                    onClick={() => handleVote(p.id)}
                    disabled={votingId === p.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                      votingId === p.id
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 cursor-wait'
                        : 'bg-slate-700/50 border-slate-600 hover:bg-yellow-500/20 hover:border-yellow-500 hover:text-yellow-400'
                    }`}
                    title="Voter pour ce prompt"
                  >
                    <span>⭐</span>
                    <span className="font-semibold">{p.votes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}