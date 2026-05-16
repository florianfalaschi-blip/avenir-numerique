'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent } from '@avenir/ui';
import { CALC_SLUGS, CALC_LABELS, type CalcSlug } from '@/lib/default-params';
import { formatLastModified, formatLastModifiedFull, useSettingsMeta } from '@/lib/settings';

const CALC_DESCRIPTIONS: Record<CalcSlug, string> = {
  rollup: 'Bâches, structures, machine Epson, marge, dégressif, BAT.',
  plaques: 'Machines (Mutoh, Zund), finitions, marge, dégressif.',
  flyers: 'Machines (HP Indigo, Speedmaster), marges offset/numérique, finitions.',
  bobines: 'Machines, finitions, espace inter-étiquettes, rembobinage, marge.',
  brochures: 'Machines impression + façonnage, reliures, marges prorata, plieuse.',
};

interface SharedCatalogue {
  slug: string;
  /** Clé(s) Supabase qui composent ce paramétrage — la date affichée est la plus récente. */
  storageKeys: string[];
  label: string;
  description: string;
  badge: string;
}

const SHARED_CATALOGUES: SharedCatalogue[] = [
  {
    slug: 'papiers',
    storageKeys: ['shared.papiers'],
    label: 'Catalogue Papiers',
    description: 'Catalogue partagé utilisé par les calculateurs Flyers et Brochures.',
    badge: 'Flyers · Brochures',
  },
  {
    slug: 'materiaux',
    storageKeys: ['plaques', 'bobines'],
    label: 'Catalogue Matériaux',
    description: 'Matériaux Plaques (PVC, Forex, Dibond…) et Bobines (vinyle, polyester…).',
    badge: 'Plaques · Bobines',
  },
  {
    slug: 'entreprise',
    storageKeys: ['config.entreprise'],
    label: 'Informations entreprise',
    description: 'Raison sociale, SIRET, TVA, IBAN, logo, mentions légales — imprimés sur les devis.',
    badge: 'PDF Devis',
  },
];

/** Toutes les clés à interroger pour récupérer les dates. */
const ALL_SLUGS: readonly string[] = [
  ...CALC_SLUGS,
  'shared.papiers',
  'config.entreprise',
];

/** Renvoie la date max parmi plusieurs clés (ou undefined si aucune). */
function maxDate(meta: Record<string, string>, keys: string[]): string | undefined {
  const dates = keys.map((k) => meta[k]).filter(Boolean) as string[];
  if (dates.length === 0) return undefined;
  return dates.reduce((a, b) => (a > b ? a : b));
}

export default function ParametresPage() {
  const { meta } = useSettingsMeta(ALL_SLUGS);

  // Précalcule les dates par carte
  const calcDates = useMemo(() => {
    const map: Record<CalcSlug, string | undefined> = {} as Record<CalcSlug, string | undefined>;
    CALC_SLUGS.forEach((slug) => {
      map[slug] = meta[slug];
    });
    return map;
  }, [meta]);

  const sharedDates = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    SHARED_CATALOGUES.forEach((sc) => {
      map[sc.slug] = maxDate(meta, sc.storageKeys);
    });
    return map;
  }, [meta]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-1.5 text-sm max-w-2xl">
          Catalogues, tarifs et marges. Synchronisés dans le cloud — modifs visibles sur tous les
          postes.
        </p>
      </div>

      {/* === CATALOGUES PARTAGÉS === */}
      <section className="space-y-2.5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
          Catalogues partagés
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SHARED_CATALOGUES.map((sc) => (
            <ParamCard
              key={sc.slug}
              href={`/parametres/${sc.slug}`}
              label={sc.label}
              description={sc.description}
              badge={sc.badge}
              updatedAt={sharedDates[sc.slug]}
            />
          ))}
        </div>
      </section>

      {/* === PARAMÈTRES PAR CALCULATEUR === */}
      <section className="space-y-2.5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
          Paramètres par calculateur
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CALC_SLUGS.map((slug) => (
            <ParamCard
              key={slug}
              href={`/parametres/${slug}`}
              label={CALC_LABELS[slug]}
              description={CALC_DESCRIPTIONS[slug]}
              updatedAt={calcDates[slug]}
              compact
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Carte de paramétrage compacte avec date de dernière modif.
 * - `compact` : version plus dense (utilisée pour les 5 calculateurs).
 */
function ParamCard({
  href,
  label,
  description,
  badge,
  updatedAt,
  compact = false,
}: {
  href: string;
  label: string;
  description: string;
  badge?: string;
  updatedAt?: string;
  compact?: boolean;
}) {
  const relativeDate = formatLastModified(updatedAt);
  const fullDate = formatLastModifiedFull(updatedAt);
  const isCustom = Boolean(updatedAt);

  return (
    <Link href={href} className="group block">
      <Card className="h-full transition group-hover:border-primary group-hover:shadow-sm">
        <CardContent className={compact ? 'p-3.5 space-y-1.5' : 'p-4 space-y-2'}>
          <div className="flex items-start justify-between gap-2">
            <h3 className={compact ? 'text-sm font-semibold leading-tight' : 'text-base font-semibold leading-tight'}>
              {label}
            </h3>
            {isCustom && (
              <span
                className="shrink-0 inline-flex items-center rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent border border-accent/30"
                title={fullDate ?? ''}
              >
                ●
              </span>
            )}
          </div>
          <p className={compact ? 'text-xs text-muted-foreground line-clamp-2' : 'text-xs text-muted-foreground'}>
            {description}
          </p>
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
              Modifier
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              {badge && (
                <span className="text-[9px] uppercase tracking-wide text-muted-foreground/70 border border-border rounded px-1.5 py-0.5">
                  {badge}
                </span>
              )}
              {relativeDate && (
                <span
                  className="text-[10px] text-muted-foreground/80 whitespace-nowrap"
                  title={fullDate ?? ''}
                >
                  {relativeDate}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
