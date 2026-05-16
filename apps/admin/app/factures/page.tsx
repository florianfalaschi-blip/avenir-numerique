'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, Input, Pill, type PillProps } from '@avenir/ui';
import { Select } from '../calculateurs/_shared/components';
import { fmtEur, fmtInt } from '../calculateurs/_shared/format';
import { useClients, clientLabel } from '@/lib/clients';
import {
  useFactures,
  STATUT_LABELS,
  montantPaye,
  montantRestant,
  aRelancer,
  type FactureStatut,
} from '@/lib/factures';
import { CALC_LABELS, CALC_SLUGS, type CalcSlug } from '@/lib/default-params';
import { KpiTile } from '../_components/kpi-tile';

const STATUTS: FactureStatut[] = [
  'brouillon',
  'emise',
  'partiellement_payee',
  'payee',
  'impayee',
  'avoir',
];

const STATUT_PILL_VARIANT: Record<FactureStatut, PillProps['variant']> = {
  brouillon: 'muted',
  emise: 'primary',
  partiellement_payee: 'warning',
  payee: 'success',
  impayee: 'destructive',
  avoir: 'accent',
};

export default function FacturesListPage() {
  const { factures, hydrated } = useFactures();
  const { getClient } = useClients();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<FactureStatut | 'all'>('all');
  const [calcFilter, setCalcFilter] = useState<CalcSlug | 'all'>('all');
  const [aRelancerOnly, setARelancerOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return factures
      .filter((f) => (statutFilter === 'all' ? true : f.statut === statutFilter))
      .filter((f) => (calcFilter === 'all' ? true : f.calculateur === calcFilter))
      .filter((f) => (aRelancerOnly ? aRelancer(f) : true))
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
  }, [factures, search, statutFilter, calcFilter, aRelancerOnly, getClient]);

  const aRelancerCount = useMemo(() => factures.filter(aRelancer).length, [factures]);

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
        <h1 className="text-2xl font-semibold tracking-tight">Factures</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {factures.length} facture{factures.length !== 1 ? 's' : ''} émise{factures.length !== 1 ? 's' : ''} depuis une commande livrée.
        </p>
      </div>

      {/* Stats globales */}
      {factures.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            label="Total facturé TTC"
            value={fmtEur(totalFacture)}
            accent="primary"
          />
          <KpiTile
            label="Encaissé"
            value={fmtEur(totalPaye)}
            accent="success"
            emphasis
          />
          <KpiTile
            label="Restant dû"
            value={fmtEur(totalRestant)}
            accent="accent"
          />
          <KpiTile
            label="En retard"
            value={fmtInt(enRetard.length)}
            accent="destructive"
            emphasis={enRetard.length > 0}
            sub={enRetard.length > 0 ? 'factures à relancer' : 'aucune en retard'}
          />
        </div>
      )}

      <Card>
        <CardHeader className="px-3 pt-2.5 pb-2.5 space-y-0">
          <div className="flex flex-wrap gap-2 items-end [&_input]:h-9 [&_input]:text-sm [&_select]:h-9 [&_select]:text-sm">
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
            <label
              className={`inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border cursor-pointer transition-colors ${
                aRelancerOnly
                  ? 'bg-warning/15 border-warning/40 text-warning'
                  : 'bg-background border-input hover:bg-secondary'
              }`}
              title="N'afficher que les factures à relancer (pas de relance récente)"
            >
              <input
                type="checkbox"
                checked={aRelancerOnly}
                onChange={(e) => setARelancerOnly(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-input accent-warning"
              />
              📣 À relancer ({aRelancerCount})
            </label>
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
            <>
              <div className="grid grid-cols-12 gap-3 px-6 py-2 border-b bg-secondary/40 text-[10px] uppercase tracking-wide font-medium text-muted-foreground/80">
                <span className="col-span-2">Numéro</span>
                <span className="col-span-3">Client</span>
                <span className="col-span-2">Produit · cmd</span>
                <span className="col-span-2">Dates</span>
                <span className="col-span-2">Statut</span>
                <span className="col-span-1 text-right">TTC</span>
              </div>
              <ul className="divide-y">
                {filtered.map((f) => {
                  const client = getClient(f.client_id);
                  const date = new Date(f.date_creation);
                  const echeance = f.date_echeance ? new Date(f.date_echeance) : null;
                  const enRetardLocal =
                    echeance &&
                    Date.now() > echeance.getTime() &&
                    !['payee', 'avoir', 'brouillon'].includes(f.statut);
                  const needsRelance = aRelancer(f);
                  const restant = montantRestant(f);

                  return (
                    <li key={f.id}>
                      <Link
                        href={`/factures/${f.id}`}
                        className="grid grid-cols-12 gap-3 items-center px-6 py-3 hover:bg-primary-soft transition-colors"
                      >
                        <span className="col-span-2 font-mono text-xs text-muted-foreground">
                          {f.numero}
                        </span>
                        <span className="col-span-3 text-sm truncate flex items-center gap-1.5">
                          {client ? (
                            <span className="truncate">{clientLabel(client)}</span>
                          ) : (
                            <span className="text-destructive">Client supprimé</span>
                          )}
                          {needsRelance && (
                            <span
                              className="shrink-0 inline-flex items-center rounded-full bg-warning/20 text-warning border border-warning/40 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                              title="Pas de relance récente"
                            >
                              📣
                            </span>
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
                        <span className="col-span-2 justify-self-start">
                          <Pill variant={STATUT_PILL_VARIANT[f.statut]}>
                            {STATUT_LABELS[f.statut]}
                          </Pill>
                        </span>
                        <span className="col-span-1 text-right">
                          <span className="block text-sm font-semibold tabular">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
