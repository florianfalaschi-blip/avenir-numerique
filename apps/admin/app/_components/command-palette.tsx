'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClients, clientLabel } from '@/lib/clients';
import { useDevis } from '@/lib/devis';
import { useCommandes } from '@/lib/commandes';
import { useFactures } from '@/lib/factures';
import { CALC_LABELS } from '@/lib/default-params';

/**
 * Palette de commandes accessible via Ctrl+K (ou Cmd+K sur Mac).
 *
 * Recherche en temps réel dans clients / devis / commandes / factures
 * et navigue vers l'élément trouvé. Navigation clavier (↑↓ + Enter).
 *
 * Composant mounted une fois dans GlobalShell. Écoute le raccourci global.
 */

type ResultType = 'client' | 'devis' | 'commande' | 'facture';

interface SearchResult {
  type: ResultType;
  id: string;
  primary: string; // ligne 1 (gros)
  secondary?: string; // ligne 2 (petit, gris)
  href: string;
}

const ICONS: Record<ResultType, string> = {
  client: '👥',
  devis: '📄',
  commande: '📦',
  facture: '💰',
};

const TYPE_LABELS: Record<ResultType, string> = {
  client: 'Clients',
  devis: 'Devis',
  commande: 'Commandes',
  facture: 'Factures',
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { clients } = useClients();
  const { devis } = useDevis();
  const { commandes } = useCommandes();
  const { factures } = useFactures();

  // === Raccourci global Ctrl/Cmd+K + Esc pour fermer ===
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const shortcut = isMac ? e.metaKey : e.ctrlKey;
      if (shortcut && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // === Reset state à chaque ouverture ===
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      // Focus l'input juste après le mount
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // === Recherche ===
  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const out: SearchResult[] = [];

    // Helper pour matcher case-insensitive
    const matches = (...fields: (string | undefined | null)[]) =>
      fields.some((f) => f && f.toLowerCase().includes(q));

    // === Clients ===
    for (const c of clients) {
      const label = clientLabel(c);
      const contactNames = c.contacts.map((ct) => `${ct.prenom} ${ct.nom}`).join(' ');
      const siret = c.type === 'b2b' ? c.siret : undefined;
      if (matches(label, c.email, contactNames, siret)) {
        out.push({
          type: 'client',
          id: c.id,
          primary: label,
          secondary: c.email ?? (c.type === 'b2b' ? siret : undefined),
          href: `/clients/${c.id}`,
        });
      }
    }

    // === Devis ===
    for (const d of devis) {
      const client = clients.find((c) => c.id === d.client_id);
      const clientName = client ? clientLabel(client) : '';
      if (matches(d.numero, clientName, d.recap)) {
        out.push({
          type: 'devis',
          id: d.id,
          primary: d.numero,
          secondary: `${clientName} · ${CALC_LABELS[d.calculateur] ?? d.calculateur}`,
          href: `/devis/${d.id}`,
        });
      }
    }

    // === Commandes ===
    for (const cmd of commandes) {
      const client = clients.find((c) => c.id === cmd.client_id);
      const clientName = client ? clientLabel(client) : '';
      if (matches(cmd.numero, cmd.devis_numero, clientName)) {
        out.push({
          type: 'commande',
          id: cmd.id,
          primary: cmd.numero,
          secondary: `${clientName} · depuis ${cmd.devis_numero}`,
          href: `/commandes/${cmd.id}`,
        });
      }
    }

    // === Factures ===
    for (const f of factures) {
      const client = clients.find((c) => c.id === f.client_id);
      const clientName = client ? clientLabel(client) : '';
      if (matches(f.numero, f.commande_numero, f.devis_numero, clientName)) {
        out.push({
          type: 'facture',
          id: f.id,
          primary: f.numero,
          secondary: `${clientName} · cmd ${f.commande_numero}`,
          href: `/factures/${f.id}`,
        });
      }
    }

    return out.slice(0, 30); // max 30 résultats pour rester rapide
  }, [query, clients, devis, commandes, factures]);

  // Reset selection à chaque changement de query
  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Group results by type pour affichage
  const grouped = useMemo(() => {
    const g: Record<ResultType, SearchResult[]> = {
      client: [],
      devis: [],
      commande: [],
      facture: [],
    };
    for (const r of results) g[r.type].push(r);
    return g;
  }, [results]);

  // === Navigation clavier ===
  const navigate = useCallback(
    (idx: number) => {
      const r = results[idx];
      if (!r) return;
      setOpen(false);
      router.push(r.href);
    },
    [results, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      navigate(selectedIdx);
    }
  };

  // Scroll into view de l'élément sélectionné
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-result-idx="${selectedIdx}"]`
    );
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx, open]);

  if (!open) return null;

  // Indice global pour mapper grouped → selectedIdx
  let globalIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-3">
          <span aria-hidden className="text-muted-foreground">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher client, devis, commande, facture…"
            className="flex-1 h-12 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ul ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {!query.trim() ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              Tape pour rechercher dans clients, devis, commandes, factures.
              <div className="mt-2 text-[11px]">
                ↑↓ pour naviguer · Entrée pour ouvrir · Esc pour fermer
              </div>
            </li>
          ) : results.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              Aucun résultat pour « {query} »
            </li>
          ) : (
            (Object.entries(grouped) as [ResultType, SearchResult[]][]).map(
              ([type, items]) => {
                if (items.length === 0) return null;
                return (
                  <li key={type}>
                    <div className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground/80">
                      {TYPE_LABELS[type]} ({items.length})
                    </div>
                    <ul>
                      {items.map((r) => {
                        globalIdx++;
                        const idx = globalIdx;
                        const isSelected = idx === selectedIdx;
                        return (
                          <li
                            key={`${r.type}_${r.id}`}
                            data-result-idx={idx}
                            className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-primary-soft'
                                : 'hover:bg-secondary/60'
                            }`}
                            onMouseEnter={() => setSelectedIdx(idx)}
                            onClick={() => navigate(idx)}
                          >
                            <span aria-hidden className="text-base">
                              {ICONS[r.type]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {r.primary}
                              </p>
                              {r.secondary && (
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {r.secondary}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <span aria-hidden className="text-[11px] text-muted-foreground">
                                ↵
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              }
            )
          )}
        </ul>

        {/* Footer hint */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-t border-border text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="inline-flex items-center rounded border border-border bg-secondary/50 px-1 py-0.5">
              ↑↓
            </kbd>
            <span>naviguer</span>
            <kbd className="inline-flex items-center rounded border border-border bg-secondary/50 px-1 py-0.5">
              ↵
            </kbd>
            <span>ouvrir</span>
          </div>
          <div>{results.length} résultat{results.length > 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  );
}
