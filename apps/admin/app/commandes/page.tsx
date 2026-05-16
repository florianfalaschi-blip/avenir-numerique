'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  Input,
} from '@avenir/ui';
import { Select } from '../calculateurs/_shared/components';
import { fmtEur } from '../calculateurs/_shared/format';
import { useClients, clientLabel } from '@/lib/clients';
import {
  useCommandes,
  STATUT_LABELS,
  STATUT_COLORS,
  etapesProgress,
  type CommandeStatut,
} from '@/lib/commandes';
import { CALC_LABELS, CALC_SLUGS, type CalcSlug } from '@/lib/default-params';

const STATUTS: CommandeStatut[] = [
  'en_preparation',
  'bat_attente',
  'en_production',
  'finitions',
  'expedie',
  'livre',
  'annule',
];

export default function CommandesListPage() {
  const { commandes, hydrated } = useCommandes();
  const { getClient } = useClients();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<CommandeStatut | 'all'>('all');
  const [calcFilter, setCalcFilter] = useState<CalcSlug | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return commandes
      .filter((c) => (statutFilter === 'all' ? true : c.statut === statutFilter))
      .filter((c) => (calcFilter === 'all' ? true : c.calculateur === calcFilter))
      .filter((c) => {
        if (!q) return true;
        const numeroMatch = c.numero.toLowerCase().includes(q);
        const devisMatch = c.devis_numero.toLowerCase().includes(q);
        const client = getClient(c.client_id);
        const clientMatch = client
          ? clientLabel(client).toLowerCase().includes(q)
          : false;
        return numeroMatch || devisMatch || clientMatch;
      })
      .sort((a, b) => b.date_creation - a.date_creation);
  }, [commandes, search, statutFilter, calcFilter, getClient]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commandes en production</h1>
        <p className="text-muted-foreground mt-2">
          {commandes.length} commande{commandes.length !== 1 ? 's' : ''}. Les commandes
          sont créées depuis un devis accepté.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-64">
              <Input
                type="search"
                placeholder="Rechercher (n° commande, devis, client…)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statutFilter}
              onChange={(e) =>
                setStatutFilter(e.target.value as CommandeStatut | 'all')
              }
              className="w-auto"
            >
              <option value="all">Tous statuts</option>
              {STATUTS.map((s) => (
                <option key={s} value={s}>
                  {STATUT_LABELS[s]}
                </option>
              ))}
            </Select>
            <Select
              value={calcFilter}
              onChange={(e) => setCalcFilter(e.target.value as CalcSlug | 'all')}
              className="w-auto"
            >
              <option value="all">Tous produits</option>
              {CALC_SLUGS.map((s) => (
                <option key={s} value={s}>
                  {CALC_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!hydrated ? (
            <p className="px-6 py-8 text-sm text-muted-foreground">Chargement…</p>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {commandes.length === 0
                  ? 'Aucune commande encore. Convertis un devis accepté pour en créer.'
                  : 'Aucune commande ne correspond aux filtres.'}
              </p>
              {commandes.length === 0 && (
                <Link
                  href="/devis"
                  className="inline-block text-xs text-primary hover:underline"
                >
                  Aller voir les devis →
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((c) => {
                const client = getClient(c.client_id);
                const date = new Date(c.date_creation);
                const livraison = c.date_livraison_prevue
                  ? new Date(c.date_livraison_prevue)
                  : null;
                const progress = etapesProgress(c);
                return (
                  <li key={c.id}>
                    <Link
                      href={`/commandes/${c.id}`}
                      className="block px-6 py-3 hover:bg-secondary/40 transition-colors"
                    >
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <span className="col-span-2 font-mono text-xs text-muted-foreground">
                          {c.numero}
                        </span>
                        <span className="col-span-3 text-sm truncate">
                          {client ? (
                            clientLabel(client)
                          ) : (
                            <span className="text-destructive">Client supprimé</span>
                          )}
                        </span>
                        <span className="col-span-2 text-xs text-muted-foreground">
                          {CALC_LABELS[c.calculateur]} · qté {c.snapshot_quantite}
                        </span>
                        <span className="col-span-2 text-xs text-muted-foreground">
                          {date.toLocaleDateString('fr-FR')}
                          {livraison && (
                            <span className="block">
                              → livraison {livraison.toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </span>
                        <span
                          className={`col-span-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[c.statut]} justify-self-start`}
                        >
                          {STATUT_LABELS[c.statut]}
                        </span>
                        <span className="col-span-1 text-xs font-medium text-right">
                          {fmtEur(c.snapshot_prix_ht)}
                        </span>
                      </div>
                      {/* Barre de progression étapes */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              progress.pct === 100
                                ? 'bg-green-500'
                                : progress.pct > 0
                                  ? 'bg-primary'
                                  : 'bg-muted'
                            }`}
                            style={{ width: `${progress.pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0 w-16 text-right">
                          {progress.done}/{progress.total} étapes
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
