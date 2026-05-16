'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@avenir/ui';

interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

/**
 * Structure de la sidebar — design aligné sur le calculateur legacy :
 * sections avec titres uppercase, liens à gauche, sub-items pour les
 * calculateurs (groupe séparé).
 */
const navGroups: NavGroup[] = [
  {
    items: [{ href: '/', label: 'Accueil', icon: '⌂' }],
  },
  {
    title: 'Cycle commercial',
    items: [
      { href: '/devis', label: 'Devis', icon: '📄' },
      { href: '/commandes', label: 'Commandes', icon: '📦' },
      { href: '/factures', label: 'Factures', icon: '💰' },
      { href: '/clients', label: 'Clients', icon: '👥' },
    ],
  },
  {
    title: 'Calculateurs',
    items: [
      { href: '/calculateurs/rollup', label: 'Roll-up' },
      { href: '/calculateurs/plaques', label: 'Plaques' },
      { href: '/calculateurs/flyers', label: 'Flyers' },
      { href: '/calculateurs/bobines', label: 'Bobines' },
      { href: '/calculateurs/brochures', label: 'Brochures' },
    ],
  },
  {
    title: 'Configuration',
    items: [{ href: '/parametres', label: 'Paramètres', icon: '⚙' }],
  },
];

/**
 * Shell global de l'app :
 * - Sur la plupart des routes : sidebar verticale fixe 240px + contenu à droite
 * - Sur les routes /imprimer : container A4 sans sidebar (pour PDF propre)
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
    <div className="flex min-h-screen">
      <Sidebar pathname={pathname} />
      <main className="flex-1 min-w-0 px-6 py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="sticky top-0 hidden lg:flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-border">
        <Link href="/" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Avenir Numérique — Impression & Signalétique sur-mesure"
            className="max-w-full h-auto w-full"
          />
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-2 text-center font-medium">
            Back-office
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {navGroups.map((group, gi) => (
          <div key={gi} className="space-y-0.5">
            {group.title && (
              <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground/80">
                {group.title}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3 text-[10px] text-muted-foreground">
        <p>Phase 3a · localStorage</p>
      </div>
    </aside>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  // Active si exact OU si c'est un parent (ex. /devis/123 active /devis)
  const isActive =
    pathname === item.href ||
    (item.href !== '/' && pathname.startsWith(item.href + '/')) ||
    (item.href !== '/' && pathname.startsWith(item.href + '?'));

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors',
        isActive
          ? 'bg-primary-soft text-primary'
          : 'text-foreground hover:bg-secondary'
      )}
    >
      {item.icon && (
        <span aria-hidden className="text-base leading-none w-4 text-center">
          {item.icon}
        </span>
      )}
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

/** Header mobile (visible uniquement < lg) — TODO si besoin */
