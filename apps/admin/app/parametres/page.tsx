'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@avenir/ui';
import { CALC_SLUGS, CALC_LABELS, type CalcSlug } from '@/lib/default-params';
import { hasCustomSettings } from '@/lib/settings';

const CALC_DESCRIPTIONS: Record<CalcSlug, string> = {
  rollup: 'Bâches, structures, machine Epson, marge, dégressif, BAT.',
  plaques: 'Matériaux (PVC, Forex…), machine Mutoh, découpe Zund, finitions.',
  flyers: 'Machines (HP Indigo, Speedmaster), papiers, marges offset/numérique, finitions.',
  bobines: 'Matériaux (vinyle, polyester…), machine impression, découpe Summa, finitions.',
  brochures: 'Machines impression + façonnage, reliures, papiers, marges prorata techno.',
};

export default function ParametresPage() {
  const [custom, setCustom] = useState<Record<CalcSlug, boolean>>({
    rollup: false,
    plaques: false,
    flyers: false,
    bobines: false,
    brochures: false,
  });

  useEffect(() => {
    const next: Record<CalcSlug, boolean> = {
      rollup: hasCustomSettings('rollup'),
      plaques: hasCustomSettings('plaques'),
      flyers: hasCustomSettings('flyers'),
      bobines: hasCustomSettings('bobines'),
      brochures: hasCustomSettings('brochures'),
    };
    setCustom(next);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Configure les catalogues et tarifs de chaque calculateur. Les modifications sont stockées
          localement dans ton navigateur (Phase 3a). Elles seront synchronisées dans Supabase en
          Phase 3b.
        </p>
      </div>

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

      <div className="rounded-lg border border-dashed bg-secondary/30 p-4 text-sm text-muted-foreground max-w-3xl">
        <p>
          <strong className="text-foreground">⚠️ Stockage local (Phase 3a)</strong> — Les
          paramètres modifiés sont enregistrés dans le <code className="text-foreground">localStorage</code>{' '}
          de ce navigateur. Si tu vides le cache ou utilises un autre ordinateur, tu retrouves les
          valeurs par défaut.
        </p>
        <p className="mt-2">
          <strong className="text-foreground">🔜 Synchronisation (Phase 3b)</strong> — Une fois
          Supabase branché, les paramètres seront partagés entre tous les postes en temps réel.
        </p>
      </div>
    </div>
  );
}
