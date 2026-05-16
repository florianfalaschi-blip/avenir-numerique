'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, Input, Pill, type PillProps } from '@avenir/ui';
import { Select } from '../calculateurs/_shared/components';
import { fmtEur, fmtInt } from '../calculateurs/_shared/format';
import { useClients, clientLabel } from '@/lib/clients';
import {
  useDevis,
  STATUT_LABELS,
  effectivePrixHt,
  type DevisStatut,
} from '@/lib/devis';
import { CALC_LABELS, CALC_SLUGS, type CalcSlug } from '@/lib/default-params';
import { KpiTile } from '../_components/kpi-tile';

const STATUTS: DevisStatut[] = ['brouillon', 'envoye', 'accepte', 'refuse', 'archive'];

const STATUT_PILL_VARIANT: Record<DevisStatut, PillProps['variant']> = {
  brouillon: 'muted',
  envoye: 'primary',
  accepte: 'success',
  refuse: 'destructive',
  archive: 'muted',
};

export default function DevisListPage() {
  const { devis, hydrated } = useDevis();
  const { getClient } = useClients();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<DevisStatut | 'all'>('all');
  const [calcFilter, setCalcFilter] = useState<CalcSlug | 'all'>('all');

  // === KPIs globaux ===
  const stats = useMemo(() => {
    const enAttente = devis.filter((d) => d.statut === 'envoye').length;
    const acceptes = devis.filter((d) => d.statut === 'accepte');
    const refuses = devis.filter((d) => d.statut === 'refuse').length;
    const totalAccept = acceptes.reduce((acc, d) => acc + effectivePrixHt(d), 0);
    const repondus = acceptes.length + refuses;
    const tauxAcceptation = repondus > 0 ? Math.round((acceptes.length / repondus) * 100) : 0;
    return {
      total: devis.length,
      enAttente,
      acceptesCount: acceptes.length,
      refuses,
      totalAccept,
      tauxAcceptation,
    };
  }, [devis]);

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
      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Devis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.total} devis enregistré{stats.total !== 1 ? 's' : ''} ·{' '}
            {fmtEur(stats.totalAccept)} acceptés.
          </p>
        </div>
        <Link href="/devis/nouveau">
          <Button variant="accent">+ Nouveau devis</Button>
        </Link>
      </div>

      {/* KPIs */}
      {devis.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <KpiTile label="Total devis" value={fmtInt(stats.total)} accent="primary" />
          <KpiTile
            label="En attente"
            value={fmtInt(stats.enAttente)}
            accent="warning"
            emphasis={stats.enAttente > 0}
            sub={stats.enAttente > 0 ? 'à relancer' : 'aucun en attente'}
          />
          <KpiTile
            label="Acceptés"
            value={fmtInt(stats.acceptesCount)}
            accent="success"
            sub={fmtEur(stats.totalAccept)}
          />
          <KpiTile
            label="Refusés"
            value={fmtInt(stats.refuses)}
            accent="destructive"
          />
          <KpiTile
            label="Taux d'acceptation"
            value={`${stats.tauxAcceptation} %`}
            accent="primary"
            sub={`sur ${stats.acceptesCount + stats.refuses} décidés`}
          />
        </div>
      )}

      {/* Filters + Table */}
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
                  ? 'Aucun devis encore enregistré.'
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
            <>
              {/* Header de tableau */}
              <div className="grid grid-cols-12 gap-3 px-6 py-2.5 border-b bg-secondary/40 text-[10px] uppercase tracking-[0.06em] font-semibold text-muted-foreground">
                <span className="col-span-2">Numéro</span>
                <span className="col-span-3">Client</span>
                <span className="col-span-2">Produit · qté</span>
                <span className="col-span-2">Date</span>
                <span className="col-span-2">Statut</span>
                <span className="col-span-1 text-right">Total HT</span>
              </div>
              <ul className="divide-y">
                {filtered.map((d) => {
                  const client = getClient(d.client_id);
                  const date = new Date(d.date_creation);
                  return (
                    <li key={d.id}>
                      <Link
                        href={`/devis/${d.id}`}
                        className="grid grid-cols-12 gap-3 items-center px-6 py-3 hover:bg-primary-soft transition-colors"
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
                        <span className="col-span-2 justify-self-start">
                          <Pill variant={STATUT_PILL_VARIANT[d.statut]}>
                            {STATUT_LABELS[d.statut]}
                          </Pill>
                        </span>
                        <span className="col-span-1 text-sm font-semibold tabular text-right">
                          {fmtEur(effectivePrixHt(d))}
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
