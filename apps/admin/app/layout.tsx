import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GlobalShell } from './_components/global-shell';
import { AuthProvider } from '@/lib/auth';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Avenir Numérique — Admin',
  description: 'Back-office Avenir Numérique',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <GlobalShell>{children}</GlobalShell>
        </AuthProvider>
      </body>
    </html>
  );
}
