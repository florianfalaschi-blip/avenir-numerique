'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, Input } from '@avenir/ui';
import { Select } from '../calculateurs/_shared/components';
import { fmtEur } from '../calculateurs/_shared/format';
import { useClients, clientLabel } from '@/lib/clients';
import {
  useFactures,
  STATUT_LABELS,
  STATUT_COLORS,
  montantPaye,
  montantRestant,
  type FactureStatut,
} from '@/lib/factures';
import { CALC_LABELS, CALC_SLUGS, type CalcSlug } from '@/lib/default-params';

const STATUTS: FactureStatut[] = [
  'brouillon',
  'emise',
  'partiellement_payee',
  'payee',
  'impayee',
  'avoir',
];

export default function FacturesListPage() {
  const { factures, hydrated } = useFactures();
  const { getClient } = useClients();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<FactureStatut | 'all'>('all');
  const [calcFilter, setCalcFilter] = useState<CalcSlug | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return factures
      .filter((f) => (statutFilter === 'all' ? true : f.statut === statutFilter))
      .filter((f) => (calcFilter === 'all' ? true : f.calculateur === calcFilter))
      .filter((f) => {
        if (!q) return true;
        const matches = [f.numero, f.commande_numero, f.devis_numero ?? ''];
        const client = getClient(f.client_id);
        const clientLabelStr = client ? clientLabel(client) : '';
        return (
          matches.some((m) => m.toLowerCase().includes(q)) ||
          clientLabelStr.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.date_creation - a.date_creation);
  }, [factures, search, statutFilter, calcFilter, getClient]);

  // Stats globales
  const totalFacture = factures.reduce((acc, f) => acc + f.montant_ttc, 0);
  const totalPaye = factures.reduce((acc, f) => acc + montantPaye(f), 0);
  const totalRestant = totalFacture - totalPaye;
  const enRetard = factures.filter(
    (f) =>
      f.date_echeance &&
      Date.now() > f.date_echeance &&
      !['payee', 'avoir', 'brouillon'].includes(f.statut)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
        <p className="text-muted-foreground mt-2">
          {factures.length} facture{factures.length !== 1 ? 's' : ''}. Émises depuis une
          commande livrée.
        </p>
      </div>

      {/* Stats globales */}
      {factures.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total facturé TTC
              </p>
              <p className="text-2xl font-bold">{fmtEur(totalFacture)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total encaissé
              </p>
              <p className="text-2xl font-bold text-green-700">{fmtEur(totalPaye)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Restant dû
              </p>
              <p className="text-2xl font-bold text-accent">{fmtEur(totalRestant)}</p>
            </CardContent>
          </Card>
          <Card
            className={enRetard.length > 0 ? 'border-destructive/40 bg-destructive/5' : ''}
          >
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                En retard
              </p>
              <p
                className={`text-2xl font-bold ${enRetard.length > 0 ? 'text-destructive' : ''}`}
              >
                {enRetard.length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-64">
              <Input
                type="search"
                placeholder="Rechercher (n° facture, commande, client…)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value as FactureStatut | 'all')}
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
                {factures.length === 0
                  ? 'Aucune facture encore. Génère-en une depuis une commande livrée.'
                  : 'Aucune facture ne correspond aux filtres.'}
              </p>
              {factures.length === 0 && (
                <Link
                  href="/commandes"
                  className="inline-block text-xs text-primary hover:underline"
                >
                  Aller voir les commandes →
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((f) => {
                const client = getClient(f.client_id);
                const date = new Date(f.date_creation);
                const echeance = f.date_echeance ? new Date(f.date_echeance) : null;
                const enRetardLocal =
                  echeance &&
                  Date.now() > echeance.getTime() &&
                  !['payee', 'avoir', 'brouillon'].includes(f.statut);
                const restant = montantRestant(f);

                return (
                  <li key={f.id}>
                    <Link
                      href={`/factures/${f.id}`}
                      className="grid grid-cols-12 gap-3 items-center px-6 py-3 hover:bg-secondary/40 transition-colors"
                    >
                      <span className="col-span-2 font-mono text-xs text-muted-foreground">
                        {f.numero}
                      </span>
                      <span className="col-span-3 text-sm truncate">
                        {client ? (
                          clientLabel(client)
                        ) : (
                          <span className="text-destructive">Client supprimé</span>
                        )}
                      </span>
                      <span className="col-span-2 text-xs text-muted-foreground">
                        {CALC_LABELS[f.calculateur]}
                        <br />
                        cmd {f.commande_numero}
                      </span>
                      <span className="col-span-2 text-xs text-muted-foreground">
                        Émise : {date.toLocaleDateString('fr-FR')}
                        {echeance && (
                          <span
                            className={`block ${enRetardLocal ? 'text-destructive font-medium' : ''}`}
                          >
                            Échéance : {echeance.toLocaleDateString('fr-FR')}
                            {enRetardLocal && ' ⚠'}
                          </span>
                        )}
                      </span>
                      <span
                        className={`col-span-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[f.statut]} justify-self-start`}
                      >
                        {STATUT_LABELS[f.statut]}
                      </span>
                      <span className="col-span-1 text-right">
                        <span className="block text-sm font-medium">
                          {fmtEur(f.montant_ttc)}
                        </span>
                        {restant > 0.01 && (
                          <span className="block text-[10px] text-accent">
                            {fmtEur(restant)} dû
                          </span>
                        )}
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
