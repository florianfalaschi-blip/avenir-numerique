'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, Input, Pill, type PillProps } from '@avenir/ui';
import { Select } from '../calculateurs/_shared/components';
import { fmtEur, fmtInt } from '../calculateurs/_shared/format';
import { useClients, clientLabel } from '@/lib/clients';
import {
  useCommandes,
  STATUT_LABELS,
  etapesProgress,
  type CommandeStatut,
} from '@/lib/commandes';
import { CALC_LABELS, CALC_SLUGS, type CalcSlug } from '@/lib/default-params';
import { KpiTile } from '../_components/kpi-tile';

const STATUTS: CommandeStatut[] = [
  'en_preparation',
  'bat_attente',
  'en_production',
  'finitions',
  'expedie',
  'livre',
  'annule',
];

const STATUT_PILL_VARIANT: Record<CommandeStatut, PillProps['variant']> = {
  en_preparation: 'muted',
  bat_attente: 'warning',
  en_production: 'primary',
  finitions: 'primary',
  expedie: 'accent',
  livre: 'success',
  annule: 'destructive',
};

const IN_PRODUCTION_STATUTS: CommandeStatut[] = [
  'en_preparation',
  'bat_attente',
  'en_production',
  'finitions',
];

export default function CommandesListPage() {
  const { commandes, hydrated } = useCommandes();
  const { getClient } = useClients();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<CommandeStatut | 'all'>('all');
  const [calcFilter, setCalcFilter] = useState<CalcSlug | 'all'>('all');

  const stats = useMemo(() => {
    const enProd = commandes.filter((c) =>
      IN_PRODUCTION_STATUTS.includes(c.statut)
    ).length;
    const batAttente = commandes.filter((c) => c.statut === 'bat_attente').length;
    const expediees = commandes.filter((c) => c.statut === 'expedie').length;
    const livrees = commandes.filter((c) => c.statut === 'livre').length;
    const enRetard = commandes.filter(
      (c) =>
        c.date_livraison_prevue &&
        Date.now() > c.date_livraison_prevue &&
        !['livre', 'annule'].includes(c.statut)
    ).length;
    return {
      total: commandes.length,
      enProd,
      batAttente,
      expediees,
      livrees,
      enRetard,
    };
  }, [commandes]);

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
        <h1 className="text-2xl font-semibold tracking-tight">Commandes en production</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {stats.total} commande{stats.total !== 1 ? 's' : ''}. Créées depuis un devis accepté.
        </p>
      </div>

      {/* KPIs */}
      {commandes.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <KpiTile label="En production" value={fmtInt(stats.enProd)} accent="primary" />
          <KpiTile
            label="En attente BAT"
            value={fmtInt(stats.batAttente)}
            accent="warning"
            emphasis={stats.batAttente > 0}
          />
          <KpiTile label="Expédiées" value={fmtInt(stats.expediees)} accent="accent" />
          <KpiTile label="Livrées" value={fmtInt(stats.livrees)} accent="success" />
          <KpiTile
            label="En retard"
            value={fmtInt(stats.enRetard)}
            accent="destructive"
            emphasis={stats.enRetard > 0}
            sub={stats.enRetard > 0 ? 'à traiter' : 'tout est OK'}
          />
        </div>
      )}

      <Card>
        <CardHeader className="px-3 pt-2.5 pb-2.5 space-y-0">
          <div className="flex flex-wrap gap-2 items-end [&_input]:h-9 [&_input]:text-sm [&_select]:h-9 [&_select]:text-sm">
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
            <>
              <div className="grid grid-cols-12 gap-3 px-6 py-2 border-b bg-secondary/40 text-[10px] uppercase tracking-wide font-medium text-muted-foreground/80">
                <span className="col-span-2">Numéro</span>
                <span className="col-span-3">Client</span>
                <span className="col-span-2">Produit · qté</span>
                <span className="col-span-2">Dates</span>
                <span className="col-span-2">Statut</span>
                <span className="col-span-1 text-right">Total HT</span>
              </div>
              <ul className="divide-y">
                {filtered.map((c) => {
                  const client = getClient(c.client_id);
                  const date = new Date(c.date_creation);
                  const livraison = c.date_livraison_prevue
                    ? new Date(c.date_livraison_prevue)
                    : null;
                  const enRetard =
                    livraison &&
                    Date.now() > livraison.getTime() &&
                    !['livre', 'annule'].includes(c.statut);
                  const progress = etapesProgress(c);
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/commandes/${c.id}`}
                        className="block px-6 py-3 hover:bg-primary-soft transition-colors"
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
                              <span
                                className={`block ${enRetard ? 'text-destructive font-medium' : ''}`}
                              >
                                → {livraison.toLocaleDateString('fr-FR')}
                                {enRetard && ' ⚠'}
                              </span>
                            )}
                          </span>
                          <span className="col-span-2 justify-self-start">
                            <Pill variant={STATUT_PILL_VARIANT[c.statut]}>
                              {STATUT_LABELS[c.statut]}
                            </Pill>
                          </span>
                          <span className="col-span-1 text-sm font-semibold tabular text-right">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
