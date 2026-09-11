@echo off
chcp 65001 >nul
cd /d C:\Users\HP\promptvault

echo [1/3] app/page.tsx (liste)...
(
echo 'use client';
echo.
echo import { useEffect, useState } from 'react';
echo.
echo interface Prompt {
echo   id: string;
echo   title: string;
echo   content: string;
echo   tags: string[];
echo   author: string;
echo   votes: number;
echo   createdAt: string;
echo }
echo.
echo const API = 'http://localhost:3001';
echo.
echo export default function Home^(^) {
echo   const ^[prompts, setPrompts^] = useState^<Prompt[]^>^([]^);
echo   const ^[loading, setLoading^] = useState^(true^);
echo   const ^[error, setError^] = useState^(''^);
echo.
echo   const load = async ^(^) =^> {
echo     try {
echo       setLoading^(true^);
echo       const res = await fetch^(`\${API}/api/prompts`^);
echo       const data = await res.json^(^);
echo       setPrompts^(data.prompts || []^);
echo     } catch ^(e^) {
echo       setError^('Impossible de charger les prompts'^);
echo     } finally {
echo       setLoading^(false^);
echo     }
echo   };
echo.
echo   useEffect^(^(^) =^> { load^(^); }, []^);
echo.
echo   return ^(
echo     ^<main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white p-8"^>
echo       ^<div className="max-w-4xl mx-auto"^>
echo         ^<h1 className="text-4xl font-bold mb-2"^>🔐 PromptVault^</h1^>
echo         ^<p className="text-slate-400 mb-8"^>The open-source GitHub for AI prompts^</p^>
echo.
echo         ^{loading ^&^& ^<p^>Chargement...^</p^>^}
echo         ^{error ^&^& ^<p className="text-red-400"^>{error}^</p^>^}
echo.
echo         ^<div className="space-y-4"^>
echo           ^{prompts.map^(^(p^) =^> ^(
echo             ^<div key={p.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-slate-500 transition"^>
echo               ^<h2 className="text-xl font-semibold mb-2"^>{p.title}^</h2^>
echo               ^<p className="text-slate-300 mb-3"^>{p.content}^</p^>
echo               ^<div className="flex items-center justify-between text-sm"^>
echo                 ^<div className="flex gap-2"^>
echo                   ^{p.tags.map^(^(t^) =^> ^<span key={t} className="bg-slate-700 px-2 py-1 rounded"^>#{t}^</span^>^)^}
echo                 ^</div^>
echo                 ^<div className="flex items-center gap-4 text-slate-400"^>
echo                   ^<span^>👤 {p.author}^</span^>
echo                   ^<span^>⭐ {p.votes}^</span^>
echo                 ^</div^>
echo               ^</div^>
echo             ^</div^>
echo           ^)^)^}
echo         ^</div^>
echo       ^</div^>
echo     ^</main^>
echo   ^);
echo }
) > apps\web\app\page.tsx

echo [2/3] layout.tsx...
(
echo import type { Metadata } from 'next';
echo import './globals.css';
echo.
echo export const metadata: Metadata = {
echo   title: 'PromptVault',
echo   description: 'The open-source GitHub for AI prompts',
echo };
echo.
echo export default function RootLayout^({ children }: { children: React.ReactNode }^) {
echo   return ^(
echo     ^<html lang="fr"^>
echo       ^<body^>{children}^</body^>
echo     ^</html^>
echo   ^);
echo }
) > apps\web\app\layout.tsx

echo [3/3] .env.local...
(
echo NEXT_PUBLIC_API_URL=http://localhost:3001
) > apps\web\.env.local

echo.
echo ✅ Interface web creee !
pause