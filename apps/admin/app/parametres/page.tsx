'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@avenir/ui';
import { CALC_SLUGS, CALC_LABELS, type CalcSlug } from '@/lib/default-params';
import { hasCustomSettings } from '@/lib/settings';

const CALC_DESCRIPTIONS: Record<CalcSlug, string> = {
  rollup: 'Bâches, structures, machine Epson, marge, dégressif, BAT.',
  plaques: 'Machines (Mutoh, Zund), finitions, marge, dégressif.',
  flyers: 'Machines (HP Indigo, Speedmaster), marges offset/numérique, finitions.',
  bobines: 'Machines, finitions, espace inter-étiquettes, rembobinage, marge.',
  brochures: 'Machines impression + façonnage, reliures, marges prorata, plieuse.',
};

const SHARED_CATALOGUES: {
  slug: string;
  storageKey: string;
  label: string;
  description: string;
  badge: string;
}[] = [
  {
    slug: 'papiers',
    storageKey: 'shared.papiers',
    label: 'Catalogue Papiers',
    description: 'Catalogue partagé utilisé par les calculateurs Flyers et Brochures.',
    badge: 'Flyers · Brochures',
  },
  {
    slug: 'materiaux',
    // Pas de clé localStorage propre — la page Matériaux édite directement
    // plaques.materiaux + bobines.materiaux. On marque "modifié" si l'un des deux l'est.
    storageKey: 'plaques+bobines',
    label: 'Catalogue Matériaux',
    description: 'Matériaux Plaques (PVC, Forex, Dibond…) et Bobines (vinyle, polyester…).',
    badge: 'Plaques · Bobines',
  },
];

export default function ParametresPage() {
  const [custom, setCustom] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    CALC_SLUGS.forEach((slug) => {
      next[slug] = hasCustomSettings(slug);
    });
    next['shared.papiers'] = hasCustomSettings('shared.papiers');
    next['plaques+bobines'] =
      hasCustomSettings('plaques') || hasCustomSettings('bobines');
    setCustom(next);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Configure les catalogues et tarifs. Les modifications sont stockées localement dans ton
          navigateur (Phase 3a). Elles seront synchronisées dans Supabase en Phase 3b.
        </p>
      </div>

      {/* === CATALOGUES PARTAGÉS === */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Catalogues partagés
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SHARED_CATALOGUES.map((sc) => {
            const isCustom = custom[sc.storageKey];
            return (
              <Link
                key={sc.slug}
                href={`/parametres/${sc.slug}`}
                className="group block"
              >
                <Card className="h-full transition group-hover:border-primary group-hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{sc.label}</CardTitle>
                      {isCustom && (
                        <span className="inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent border border-accent/30">
                          modifié
                        </span>
                      )}
                    </div>
                    <CardDescription>{sc.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                      Modifier
                      <span aria-hidden className="transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80 border border-border rounded px-2 py-0.5">
                      {sc.badge}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* === PARAMÈTRES PAR CALCULATEUR === */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Paramètres par calculateur
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CALC_SLUGS.map((slug) => {
            const isCustom = custom[slug];
            return (
              <Link key={slug} href={`/parametres/${slug}`} className="group block">
                <Card className="h-full transition group-hover:border-primary group-hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{CALC_LABELS[slug]}</CardTitle>
                      {isCustom && (
                        <span className="inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent border border-accent/30">
                          modifié
                        </span>
                      )}
                    </div>
                    <CardDescription>{CALC_DESCRIPTIONS[slug]}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                      Modifier les paramètres
                      <span aria-hidden className="transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="rounded-lg border border-dashed bg-secondary/30 p-4 text-sm text-muted-foreground max-w-3xl">
        <p>
          <strong className="text-foreground">⚠️ Stockage local (Phase 3a)</strong> — Les
          paramètres modifiés sont enregistrés dans le{' '}
          <code className="text-foreground">localStorage</code> de ce navigateur. Si tu vides le
          cache ou utilises un autre ordinateur, tu retrouves les valeurs par défaut.
        </p>
        <p className="mt-2">
          <strong className="text-foreground">🔜 Synchronisation (Phase 3b)</strong> — Une fois
          Supabase branché, les paramètres seront partagés entre tous les postes en temps réel.
        </p>
      </div>
    </div>
  );
}
