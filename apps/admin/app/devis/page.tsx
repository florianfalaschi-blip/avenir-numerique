'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
} from '@avenir/ui';
import { Select } from '../calculateurs/_shared/components';
import { fmtEur } from '../calculateurs/_shared/format';
import { useClients, clientLabel } from '@/lib/clients';
import {
  useDevis,
  STATUT_LABELS,
  STATUT_COLORS,
  effectivePrixHt,
  type DevisStatut,
} from '@/lib/devis';
import { CALC_LABELS, CALC_SLUGS, type CalcSlug } from '@/lib/default-params';

const STATUTS: DevisStatut[] = ['brouillon', 'envoye', 'accepte', 'refuse', 'archive'];

export default function DevisListPage() {
  const { devis, hydrated } = useDevis();
  const { getClient } = useClients();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<DevisStatut | 'all'>('all');
  const [calcFilter, setCalcFilter] = useState<CalcSlug | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return devis
      .filter((d) => (statutFilter === 'all' ? true : d.statut === statutFilter))
      .filter((d) => (calcFilter === 'all' ? true : d.calculateur === calcFilter))
      .filter((d) => {
        if (!q) return true;
        const numeroMatch = d.numero.toLowerCase().includes(q);
        const client = getClient(d.client_id);
        const clientMatch = client ? clientLabel(client).toLowerCase().includes(q) : false;
        return numeroMatch || clientMatch;
      })
      .sort((a, b) => b.date_creation - a.date_creation);
  }, [devis, search, statutFilter, calcFilter, getClient]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devis</h1>
          <p className="text-muted-foreground mt-2">
            {devis.length} devis enregistré{devis.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <Link href="/devis/nouveau">
          <Button variant="accent">+ Nouveau devis</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-64">
              <Input
                type="search"
                placeholder="Rechercher (n° de devis, client…)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statutFilter}
              onChange={(e) =>
                setStatutFilter(e.target.value as DevisStatut | 'all')
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
                {devis.length === 0
                  ? "Aucun devis encore enregistré."
                  : 'Aucun devis ne correspond aux filtres.'}
              </p>
              {devis.length === 0 && (
                <Link href="/devis/nouveau">
                  <Button variant="outline" size="sm">
                    Créer le premier devis
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((d) => {
                const client = getClient(d.client_id);
                const date = new Date(d.date_creation);
                return (
                  <li key={d.id}>
                    <Link
                      href={`/devis/${d.id}`}
                      className="grid grid-cols-12 gap-3 items-center px-6 py-3 hover:bg-secondary/40 transition-colors"
                    >
                      <span className="col-span-2 font-mono text-xs text-muted-foreground">
                        {d.numero}
                      </span>
                      <span className="col-span-3 text-sm truncate">
                        {client ? clientLabel(client) : (
                          <span className="text-destructive">Client supprimé</span>
                        )}
                      </span>
                      <span className="col-span-2 text-xs text-muted-foreground">
                        {CALC_LABELS[d.calculateur]} · qté {d.quantite}
                      </span>
                      <span className="col-span-2 text-xs text-muted-foreground">
                        {date.toLocaleDateString('fr-FR')}
                      </span>
                      <span
                        className={`col-span-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[d.statut]} justify-self-start`}
                      >
                        {STATUT_LABELS[d.statut]}
                      </span>
                      <span className="col-span-1 text-sm font-medium text-right">
                        {fmtEur(effectivePrixHt(d))}
                      </span>
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
