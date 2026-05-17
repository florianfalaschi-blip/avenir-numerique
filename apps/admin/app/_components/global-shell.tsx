'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button, cn } from '@avenir/ui';
import { useAuth } from '@/lib/auth';
import { CommandPalette } from './command-palette';

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
      { href: '/calculateurs/soustraitance', label: 'Sous-traitance' },
    ],
  },
  {
    title: 'Configuration',
    items: [{ href: '/parametres', label: 'Paramètres', icon: '⚙' }],
  },
];

/**
 * Shell global de l'app :
 * - Sur /login : layout minimal sans sidebar
 * - Sur les routes /imprimer : container A4 sans sidebar (pour PDF propre)
 * - Sur les autres routes : redirige vers /login si non auth, sinon sidebar
 *   verticale + contenu
 */
export function GlobalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isPrint = pathname.endsWith('/imprimer') || pathname.endsWith('/imprimer/');
  const isLogin = pathname === '/login' || pathname.startsWith('/login/');

  // Protection des routes : redirige vers /login si pas connecté
  useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) {
      router.replace('/login');
    }
  }, [user, loading, isLogin, router]);

  // Page login : layout minimal centré (pas de sidebar)
  if (isLogin) {
    return <main className="min-h-screen">{children}</main>;
  }

  // Pages /imprimer : layout A4 sans sidebar
  if (isPrint) {
    return (
      <main className="mx-auto max-w-[210mm] px-6 py-6 print:px-0 print:py-0 print:max-w-none">
        {children}
      </main>
    );
  }

  // Loading initial : écran neutre
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Chargement…
      </div>
    );
  }

  // Pas connecté : on n'affiche rien (le useEffect ci-dessus redirige)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Redirection vers la page de connexion…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar pathname={pathname} />
      <main className="flex-1 min-w-0 px-6 py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto w-full">
        {children}
      </main>
      <CommandPalette />
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

      {/* Search button (déclenche la palette via raccourci) */}
      <div className="px-3 pt-3">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-secondary/40 hover:bg-secondary text-xs text-muted-foreground transition-colors"
          onClick={() => {
            // Simule Ctrl+K via dispatch event
            window.dispatchEvent(
              new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
            );
          }}
          title="Rechercher (Ctrl+K)"
        >
          <span aria-hidden>🔍</span>
          <span className="flex-1 text-left">Rechercher…</span>
          <kbd className="inline-flex items-center rounded border border-border bg-background px-1 py-0.5 text-[9px] font-medium">
            Ctrl K
          </kbd>
        </button>
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

      {/* Footer : user + logout */}
      <SidebarUserFooter />
    </aside>
  );
}

function SidebarUserFooter() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  const displayName = user.email ?? 'Utilisateur';
  return (
    <div className="border-t border-border px-3 py-3 space-y-2">
      <p className="px-2 text-xs truncate" title={displayName}>
        {displayName}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => signOut()}
      >
        Se déconnecter
      </Button>
    </div>
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
