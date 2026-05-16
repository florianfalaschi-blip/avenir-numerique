'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Pill,
  type PillProps,
} from '@avenir/ui';
import { fmtEur, fmtInt } from './calculateurs/_shared/format';
import { useClients, clientLabel } from '@/lib/clients';
import {
  useDevis,
  STATUT_LABELS as DEVIS_STATUT_LABELS,
  effectivePrixHt,
  type DevisStatut,
} from '@/lib/devis';
import { useCommandes } from '@/lib/commandes';
import {
  useFactures,
  STATUT_LABELS as FACTURE_STATUT_LABELS,
  aRelancer,
  joursRetard as facJoursRetard,
} from '@/lib/factures';
import { CALC_LABELS } from '@/lib/default-params';
import { KpiTile } from './_components/kpi-tile';
import {
  caMois,
  caAnnee,
  deltaPct,
  devisEnAttente,
  devisRecents,
  facturesEnRetard,
  pipelineDevis,
  previousMonth,
  totalImpaye,
  commandesEnProduction,
  topClients,
  caSur12Mois,
  breakdownParCalculateur,
} from '@/lib/dashboard';
import { BarChart } from './_components/charts/bar-chart';
import { DonutChart } from './_components/charts/donut-chart';

const calculateurs = [
  { slug: 'rollup', nom: 'Roll-up', icon: '🎯' },
  { slug: 'plaques', nom: 'Plaques', icon: '🟦' },
  { slug: 'flyers', nom: 'Flyers', icon: '📰' },
  { slug: 'bobines', nom: 'Bobines', icon: '🏷️' },
  { slug: 'brochures', nom: 'Brochures', icon: '📖' },
];

const DEVIS_PILL: Record<DevisStatut, PillProps['variant']> = {
  brouillon: 'muted',
  envoye: 'primary',
  accepte: 'success',
  refuse: 'destructive',
  archive: 'muted',
};

const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export default function HomePage() {
  const { devis } = useDevis();
  const { commandes } = useCommandes();
  const { factures } = useFactures();
  const { clients, getClient } = useClients();

  // Calculs dashboard
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const prev = previousMonth(year, month);

  const stats = useMemo(() => {
    const caM = caMois(factures, year, month);
    const caMPrev = caMois(factures, prev.year, prev.month);
    const caY = caAnnee(factures, year);
    const delta = deltaPct(caM, caMPrev);

    return {
      caMois: caM,
      caMoisPrev: caMPrev,
      caAnnee: caY,
      delta,
      devisEnAttenteCount: devisEnAttente(devis).length,
      pipeline: pipelineDevis(devis),
      enProductionCount: commandesEnProduction(commandes).length,
      impayes: totalImpaye(factures),
      factsRetard: facturesEnRetard(factures),
      factsARelancer: factures.filter(aRelancer),
      derniersDevis: devisRecents(devis, 5),
      top: topClients(factures, devis, 5),
      ca12mois: caSur12Mois(factures, now),
      breakdown: breakdownParCalculateur(factures, devis),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factures, devis, commandes, year, month, prev.year, prev.month]);

  const hasData =
    devis.length > 0 || factures.length > 0 || commandes.length > 0 || clients.length > 0;

  return (
    <div className="space-y-8">
      {/* === HERO CA === */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">
          Bonjour Florian — voici l&apos;activité d&apos;Avenir Numérique aujourd&apos;hui.
        </p>
      </div>

      <Card className="price-gradient elevation-soft">
        <CardContent className="pt-6 pb-5">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] items-end">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] opacity-85 font-semibold">
                Chiffre d&apos;affaires — {MONTHS_FR[month]} {year}
              </p>
              <p className="text-4xl md:text-5xl font-bold tabular tracking-tight mt-1">
                {fmtEur(stats.caMois)}
                <span className="text-base font-normal opacity-80 ml-2">HT</span>
              </p>
              {stats.delta !== null && stats.caMoisPrev > 0 && (
                <p className="text-sm mt-2 opacity-90">
                  {stats.delta >= 0 ? '↑' : '↓'}{' '}
                  <span className="font-semibold">
                    {Math.abs(stats.delta)} %
                  </span>{' '}
                  vs {MONTHS_FR[prev.month]} ({fmtEur(stats.caMoisPrev)})
                </p>
              )}
            </div>
            <div className="md:text-right space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.08em] opacity-80 font-semibold">
                  CA cumulé {year}
                </p>
                <p className="text-2xl font-bold tabular">{fmtEur(stats.caAnnee)}</p>
              </div>
              <Link href="/devis/nouveau">
                <Button
                  variant="default"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  + Nouveau devis
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === KPIs business === */}
      <section className="space-y-3">
        <p className="label-section">Pilotage</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            label="Devis en attente"
            value={fmtInt(stats.devisEnAttenteCount)}
            accent="warning"
            emphasis={stats.devisEnAttenteCount > 0}
            sub={
              stats.pipeline > 0
                ? `Pipeline : ${fmtEur(stats.pipeline)} HT`
                : undefined
            }
          />
          <KpiTile
            label="Production en cours"
            value={fmtInt(stats.enProductionCount)}
            accent="primary"
            sub={
              stats.enProductionCount > 0
                ? `${stats.enProductionCount} commande${stats.enProductionCount > 1 ? 's' : ''} à suivre`
                : 'rien en production'
            }
          />
          <KpiTile
            label="Factures impayées"
            value={fmtEur(stats.impayes)}
            accent="accent"
            sub={
              stats.factsARelancer.length > 0
                ? `${stats.factsARelancer.length} à relancer 📣 · ${stats.factsRetard.length} en retard`
                : stats.factsRetard.length > 0
                  ? `dont ${stats.factsRetard.length} en retard ⚠`
                  : 'à jour'
            }
          />
          <KpiTile
            label="Clients"
            value={fmtInt(clients.length)}
            accent="muted"
            sub={`${clients.filter((c) => c.tags.includes('vip')).length} VIP`}
          />
        </div>
      </section>

      {/* === Devis récents + Factures en retard === */}
      {hasData && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Devis récents */}
          <Card>
            <CardHeader>
              <div className="flex items-baseline justify-between gap-2">
                <CardTitle className="text-base">Devis récents</CardTitle>
                <Link
                  href="/devis"
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Voir tout →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {stats.derniersDevis.length === 0 ? (
                <p className="px-6 py-8 text-sm text-muted-foreground text-center">
                  Aucun devis encore.
                  <Link
                    href="/devis/nouveau"
                    className="block mt-2 text-primary hover:underline text-xs"
                  >
                    Créer le premier →
                  </Link>
                </p>
              ) : (
                <ul className="divide-y">
                  {stats.derniersDevis.map((d) => {
                    const client = getClient(d.client_id);
                    const date = new Date(d.date_creation);
                    return (
                      <li key={d.id}>
                        <Link
                          href={`/devis/${d.id}`}
                          className="flex items-center gap-3 px-6 py-2.5 hover:bg-primary-soft transition-colors"
                        >
                          <span className="text-[11px] text-muted-foreground font-mono w-16 shrink-0">
                            {date.toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {client ? clientLabel(client) : '— Client supprimé'}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {d.numero} · {CALC_LABELS[d.calculateur]}
                            </p>
                          </div>
                          <Pill variant={DEVIS_PILL[d.statut]} size="sm">
                            {DEVIS_STATUT_LABELS[d.statut]}
                          </Pill>
                          <span className="text-sm font-semibold tabular shrink-0 w-20 text-right">
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

          {/* Factures en retard */}
          <Card
            className={
              stats.factsRetard.length > 0
                ? 'border-destructive/40 bg-destructive/5'
                : ''
            }
          >
            <CardHeader>
              <div className="flex items-baseline justify-between gap-2">
                <CardTitle className="text-base">
                  Factures en retard
                  {stats.factsRetard.length > 0 && (
                    <Pill variant="destructive" size="sm" className="ml-2">
                      {stats.factsRetard.length}
                    </Pill>
                  )}
                </CardTitle>
                <Link
                  href="/factures"
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Voir tout →
                </Link>
              </div>
              <CardDescription className="text-xs">
                Factures dont l&apos;échéance est dépassée et qui ne sont pas réglées.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {stats.factsRetard.length === 0 ? (
                <p className="px-6 py-8 text-sm text-muted-foreground text-center">
                  ✓ Aucune facture en retard. Tout est à jour.
                </p>
              ) : (
                <ul className="divide-y">
                  {stats.factsRetard.slice(0, 5).map((f) => {
                    const client = getClient(f.client_id);
                    const retard = facJoursRetard(f);
                    const needsRelance = aRelancer(f);
                    return (
                      <li key={f.id}>
                        <Link
                          href={`/factures/${f.id}`}
                          className="flex items-center gap-3 px-6 py-2.5 hover:bg-destructive/10 transition-colors"
                        >
                          <span className="text-[11px] font-mono text-muted-foreground w-20 shrink-0">
                            {f.numero}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate flex items-center gap-1.5">
                              {client ? clientLabel(client) : '— Client supprimé'}
                              {needsRelance && (
                                <span
                                  className="inline-flex items-center rounded-full bg-warning/20 text-warning border border-warning/40 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                                  title="Pas de relance récente"
                                >
                                  📣 Relancer
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-destructive font-medium">
                              {retard} j de retard ·{' '}
                              {FACTURE_STATUT_LABELS[f.statut]}
                            </p>
                          </div>
                          <span className="text-sm font-semibold tabular text-destructive shrink-0 w-20 text-right">
                            {fmtEur(f.montant_ttc)}
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
      )}

      {/* === Graphes === */}
      {hasData && (
        <section className="space-y-3">
          <p className="label-section">Statistiques</p>
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* CA mensuel 12 mois */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">CA mensuel — 12 derniers mois</CardTitle>
                <CardDescription className="text-xs">
                  HT, basé sur les factures émises.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <BarChart
                  data={stats.ca12mois.map((m) => ({
                    label: m.label,
                    value: m.value,
                  }))}
                  ariaLabel="CA mensuel des 12 derniers mois"
                />
              </CardContent>
            </Card>

            {/* Répartition par calculateur */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Répartition par produit</CardTitle>
                <CardDescription className="text-xs">
                  Factures + devis acceptés.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <DonutChart
                  data={stats.breakdown.map((b) => ({
                    label: CALC_LABELS[b.calculateur as keyof typeof CALC_LABELS] ?? b.calculateur,
                    value: b.value,
                  }))}
                  centerLabel="Total"
                  centerValue={fmtEur(
                    stats.breakdown.reduce((acc, b) => acc + b.value, 0)
                  )}
                  ariaLabel="Répartition par calculateur"
                />
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* === Top clients === */}
      {stats.top.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between gap-2">
              <CardTitle className="text-base">Top clients</CardTitle>
              <Link
                href="/clients"
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Voir tout →
              </Link>
            </div>
            <CardDescription className="text-xs">
              CA cumulé (factures émises + devis acceptés non encore facturés).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {stats.top.map(({ client_id, total, count }, i) => {
                const client = getClient(client_id);
                return (
                  <li key={client_id}>
                    <Link
                      href={client ? `/clients/${client_id}` : '#'}
                      className="flex items-center gap-3 px-6 py-2.5 hover:bg-primary-soft transition-colors"
                    >
                      <span className="text-xs font-semibold text-primary w-6 shrink-0">
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {client ? clientLabel(client) : '— Client supprimé'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {count} ligne{count > 1 ? 's' : ''} de facturation/devis accepté
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular shrink-0 text-primary">
                        {fmtEur(total)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* === Calculateurs (mode test) === */}
      <section className="space-y-3">
        <div>
          <p className="label-section">Calculateurs — mode test</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Joue avec les calculateurs sans créer de devis. Utilise « Nouveau devis » pour
            enregistrer un calcul à un client.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {calculateurs.map((c) => (
            <Link key={c.slug} href={`/calculateurs/${c.slug}`} className="group block">
              <Card className="h-full elevation-soft elevation-hover group-hover:border-primary">
                <CardContent className="pt-5 pb-4 text-center">
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <p className="font-semibold text-sm">{c.nom}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* === Footer info === */}
      <div className="rounded-lg border border-dashed bg-card p-4 text-xs text-muted-foreground max-w-3xl">
        <p>
          <strong className="text-foreground">⚠ Stockage local</strong> — Données dans ce
          navigateur uniquement. Phase 3b à venir : Supabase pour partage multi-postes.
        </p>
      </div>
    </div>
  );
}
