'use client';

import { Card, CardContent, cn } from '@avenir/ui';

/**
 * Tile statistique style "calculateur legacy" — affichée en haut des
 * pages de liste (devis, commandes, factures).
 *
 * Pattern :
 * - Label uppercase 10px muted
 * - Value en gros (20-24px) bold
 * - Border-left coloré pour différencier les KPIs (optionnel)
 * - Hover subtil
 */
const ACCENT_CLASSES = {
  primary: 'border-l-4 border-l-primary',
  accent: 'border-l-4 border-l-accent',
  success: 'border-l-4 border-l-green-500',
  warning: 'border-l-4 border-l-amber-500',
  destructive: 'border-l-4 border-l-destructive',
  muted: 'border-l-4 border-l-muted-foreground/40',
  none: '',
} as const;

export type KpiTileAccent = keyof typeof ACCENT_CLASSES;

export function KpiTile({
  label,
  value,
  sub,
  accent = 'none',
  emphasis = false,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string | React.ReactNode;
  accent?: KpiTileAccent;
  /** Mise en avant : fond légèrement coloré + valeur en couleur primaire. */
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        'elevation-soft',
        ACCENT_CLASSES[accent],
        emphasis && accent === 'destructive' && 'bg-destructive/5',
        emphasis && accent === 'warning' && 'bg-warning/5',
        emphasis && accent === 'success' && 'bg-success/5',
        className
      )}
    >
      <CardContent className="pt-5 pb-4 space-y-1">
        <p className="text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            'text-2xl font-bold tabular leading-tight',
            emphasis && accent === 'destructive' && 'text-destructive',
            emphasis && accent === 'warning' && 'text-warning',
            emphasis && accent === 'success' && 'text-green-700'
          )}
        >
          {value}
        </p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
