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
  agingImpayes,
  dsoMoyen,
  AGING_LABELS,
  margeParCalculateur,
  commandesEnRetardLivraison,
  type AgingBucket,
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
      aging: agingImpayes(factures),
      dso: dsoMoyen(factures),
      margesParCalc: margeParCalculateur(factures, devis),
      cmdRetard: commandesEnRetardLivraison(commandes),
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

      {/* === Pilotage avancé : Aging + DSO + Marges + Cmd retard === */}
      {hasData && (
        <section className="space-y-3">
          <p className="label-section">Pilotage avancé</p>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* AGING IMPAYÉS */}
            <Card>
              <CardHeader>
                <div className="flex items-baseline justify-between gap-2">
                  <CardTitle className="text-base">Encours impayés par ancienneté</CardTitle>
                  {stats.dso !== null && (
                    <span
                      className="text-[11px] font-medium text-muted-foreground"
                      title="Days Sales Outstanding : nombre de jours moyens entre émission et paiement (12 derniers mois, pondéré par montant)"
                    >
                      DSO : <span className="text-foreground font-semibold">{stats.dso} j</span>
                    </span>
                  )}
                </div>
                <CardDescription className="text-xs">
                  Aging des créances clients — répartition des montants restants dus.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <AgingChart aging={stats.aging} />
              </CardContent>
            </Card>

            {/* MARGE PAR PRODUIT */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Marge moyenne par produit</CardTitle>
                <CardDescription className="text-xs">
                  Marge pondérée par CA (factures + devis acceptés). Indique quel
                  produit rapporte le plus.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {stats.margesParCalc.length === 0 ? (
                  <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Pas encore assez de données.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {stats.margesParCalc.map((m) => (
                      <li
                        key={m.calculateur}
                        className="grid grid-cols-12 items-center gap-3 px-6 py-2.5"
                      >
                        <span className="col-span-4 text-sm font-medium truncate">
                          {CALC_LABELS[m.calculateur as keyof typeof CALC_LABELS] ?? m.calculateur}
                        </span>
                        <div className="col-span-5">
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${Math.min(100, Math.max(0, m.marge_pct_moy))}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="col-span-1 text-xs font-semibold tabular text-right">
                          {m.marge_pct_moy.toFixed(1)}%
                        </span>
                        <span className="col-span-2 text-[11px] tabular text-right text-muted-foreground">
                          {fmtEur(m.ca_total_ht)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* COMMANDES EN RETARD DE LIVRAISON */}
          {stats.cmdRetard.length > 0 && (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardHeader>
                <div className="flex items-baseline justify-between gap-2">
                  <CardTitle className="text-base">
                    Commandes en retard de livraison
                    <Pill variant="destructive" size="sm" className="ml-2">
                      {stats.cmdRetard.length}
                    </Pill>
                  </CardTitle>
                  <Link
                    href="/commandes"
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Voir tout →
                  </Link>
                </div>
                <CardDescription className="text-xs">
                  Date de livraison prévue dépassée, statut ni livré ni annulé.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {stats.cmdRetard.slice(0, 5).map(({ commande, jours_retard }) => {
                    const client = getClient(commande.client_id);
                    return (
                      <li key={commande.id}>
                        <Link
                          href={`/commandes/${commande.id}`}
                          className="flex items-center gap-3 px-6 py-2.5 hover:bg-destructive/10 transition-colors"
                        >
                          <span className="text-[11px] font-mono text-muted-foreground w-24 shrink-0">
                            {commande.numero}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {client ? clientLabel(client) : '— Client supprimé'}
                            </p>
                            <p className="text-[11px] text-destructive font-medium">
                              {jours_retard} j de retard ·{' '}
                              {CALC_LABELS[commande.calculateur as keyof typeof CALC_LABELS] ??
                                commande.calculateur}
                            </p>
                          </div>
                          <span className="text-sm font-semibold tabular shrink-0 w-24 text-right text-destructive">
                            {fmtEur(commande.snapshot_prix_ht)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
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

    </div>
  );
}

// ============================================================
// AgingChart — barres horizontales par tranche d'ancienneté
// ============================================================

function AgingChart({ aging }: { aging: AgingBucket[] }) {
  const totalMontant = aging.reduce((acc, b) => acc + b.montant, 0);
  const totalCount = aging.reduce((acc, b) => acc + b.count, 0);

  if (totalMontant === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        ✓ Aucun encours impayé.
      </p>
    );
  }

  // Couleurs par tranche
  const colors: Record<string, string> = {
    a_echoir: 'bg-primary',
    '0_30': 'bg-warning',
    '30_60': 'bg-accent',
    '60_90': 'bg-destructive/70',
    plus_90: 'bg-destructive',
  };

  return (
    <div className="space-y-2.5">
      {/* Barre cumulée */}
      <div className="flex h-2.5 rounded-full overflow-hidden bg-secondary">
        {aging.map((b) => {
          const pct = (b.montant / totalMontant) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={b.tranche}
              className={`${colors[b.tranche]} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${AGING_LABELS[b.tranche]} : ${fmtEur(b.montant)} (${b.count})`}
            />
          );
        })}
      </div>

      {/* Légende détaillée */}
      <ul className="space-y-1">
        {aging.map((b) => {
          const pct = (b.montant / totalMontant) * 100;
          return (
            <li
              key={b.tranche}
              className="flex items-center gap-2.5 text-xs"
              style={{ opacity: b.count === 0 ? 0.4 : 1 }}
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${colors[b.tranche]}`}
                aria-hidden
              />
              <span className="flex-1 font-medium">{AGING_LABELS[b.tranche]}</span>
              <span className="text-muted-foreground tabular tabular-nums">
                {b.count} fact.
              </span>
              <span className="w-24 text-right font-semibold tabular">
                {fmtEur(b.montant)}
              </span>
              <span className="w-12 text-right text-[10px] text-muted-foreground tabular">
                {pct.toFixed(0)}%
              </span>
            </li>
          );
        })}
      </ul>

      {/* Total */}
      <div className="flex items-center gap-2.5 text-xs pt-1.5 border-t border-border/60">
        <span className="flex-1 font-semibold text-foreground">Total encours</span>
        <span className="text-muted-foreground">{totalCount} fact.</span>
        <span className="w-24 text-right font-bold tabular text-primary">
          {fmtEur(totalMontant)}
        </span>
        <span className="w-12" />
      </div>
    </div>
  );
}
