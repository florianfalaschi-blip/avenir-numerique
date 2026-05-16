import './globals.css';
import type { Metadata } from 'next';
import { GlobalShell } from './_components/global-shell';

export const metadata: Metadata = {
  title: 'Avenir Numérique — Admin',
  description: 'Back-office Avenir Numérique',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <GlobalShell>{children}</GlobalShell>
      </body>
    </html>
  );
}
