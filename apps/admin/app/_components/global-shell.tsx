'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/devis', label: 'Devis' },
  { href: '/commandes', label: 'Commandes' },
  { href: '/factures', label: 'Factures' },
  { href: '/clients', label: 'Clients' },
  { href: '/calculateurs/rollup', label: 'Roll-up' },
  { href: '/calculateurs/plaques', label: 'Plaques' },
  { href: '/calculateurs/flyers', label: 'Flyers' },
  { href: '/calculateurs/bobines', label: 'Bobines' },
  { href: '/calculateurs/brochures', label: 'Brochures' },
  { href: '/parametres', label: '⚙ Paramètres' },
];

/**
 * Shell global de l'app :
 * - Sur la plupart des routes : header avec navigation + container 6xl
 * - Sur les routes /imprimer : container A4 sans nav (pour PDF propre)
 */
export function GlobalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPrint = pathname.endsWith('/imprimer') || pathname.endsWith('/imprimer/');

  if (isPrint) {
    return (
      <main className="mx-auto max-w-[210mm] px-6 py-6 print:px-0 print:py-0 print:max-w-none">
        {children}
      </main>
    );
  }

  return (
    <>
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
    </>
  );
}
