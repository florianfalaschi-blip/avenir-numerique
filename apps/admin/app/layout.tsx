import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Avenir Numérique — Admin',
  description: 'Back-office Avenir Numérique',
};

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/calculateurs/rollup', label: 'Roll-up' },
  { href: '/calculateurs/plaques', label: 'Plaques' },
  { href: '/calculateurs/flyers', label: 'Flyers' },
  { href: '/calculateurs/bobines', label: 'Bobines' },
  { href: '/calculateurs/brochures', label: 'Brochures' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <header className="border-b bg-primary text-primary-foreground">
          <div className="container mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 max-w-6xl">
            <Link href="/" className="text-lg font-semibold">
              Avenir Numérique{' '}
              <span className="text-primary-foreground/70 font-normal">— Admin</span>
            </Link>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-6xl">{children}</main>
      </body>
    </html>
  );
}
