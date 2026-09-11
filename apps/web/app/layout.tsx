import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PromptVault — The open-source GitHub for AI prompts',
  description:
    'Store, version, share, and discover the best AI prompts for ChatGPT, Claude, and Gemini.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased bg-slate-950 text-white">
        {children}
      </body>
    </html>
  );
}