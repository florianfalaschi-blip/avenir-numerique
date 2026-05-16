import * as React from 'react';
import Link from 'next/link';
import { Label, cn } from '@avenir/ui';
import { fmtEur } from './format';

/** Champ de formulaire avec label aligné en haut. */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Ligne label/valeur pour le bloc résultat. */
export function Row({
  label,
  value,
  bold,
  big,
}: {
  label: string;
  value: string;
  bold?: boolean;
  big?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex justify-between gap-3',
        bold && 'font-semibold',
        big && 'text-base'
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? 'text-foreground' : ''}>{value}</span>
    </div>
  );
}

/** Helper pratique : Row monétaire (formate automatiquement en euros). */
export function MoneyRow(props: { label: string; value: number; bold?: boolean; big?: boolean }) {
  return <Row {...props} value={fmtEur(props.value)} />;
}

/** Lien de retour vers la grille des calculateurs. */
export function BackLink() {
  return (
    <div className="text-sm">
      <Link href="/" className="text-muted-foreground hover:text-primary">
        ← Calculateurs
      </Link>
    </div>
  );
}

/** Bloc d'en-tête de page calculateur. */
export function CalcHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-2">{subtitle}</p>
    </div>
  );
}

/** Bloc de mise en avant du prix final (dégradé bleu marine type legacy). */
export function PriceHighlight({
  prixHt,
  prixTtc,
  tvaPct,
}: {
  prixHt: number;
  prixTtc: number;
  tvaPct: number;
}) {
  return (
    <div className="rounded-xl price-gradient p-5 space-y-2">
      <div>
        <p className="text-[10px] uppercase tracking-[0.08em] font-semibold opacity-85">
          Prix HT final
        </p>
        <p className="text-3xl font-bold tracking-tight tabular mt-0.5">
          {fmtEur(prixHt)}
        </p>
      </div>
      <div className="pt-3 mt-3 border-t border-white/20 flex justify-between items-baseline gap-3 text-sm">
        <span className="opacity-85">TTC (TVA {tvaPct} %)</span>
        <span className="font-semibold tabular">{fmtEur(prixTtc)}</span>
      </div>
    </div>
  );
}

/** Liste des warnings métier. */
export function Warnings({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-md border border-warning bg-warning/10 p-3 space-y-1">
      {items.map((w, i) => (
        <p key={i} className="text-xs text-foreground">
          ⚠️ {w}
        </p>
      ))}
    </div>
  );
}

/** Select stylisé cohérent avec les Input shadcn. */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

/** Checkbox stylisée alignée verticalement avec un Input. */
export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 h-10 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-input accent-primary"
      />
      <span className="text-sm text-muted-foreground">{label}</span>
    </label>
  );
}

/**
 * Wrapper layout 2 colonnes pour formulaire/résultat.
 * Form prend l'espace flex, résultat = sidebar fixée à 360px (plus compact
 * qu'un 50/50 — laisse plus de place à la saisie).
 */
export function TwoColumns({
  form,
  result,
}: {
  form: React.ReactNode;
  result: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">{form}</div>
      <div className="lg:sticky lg:top-6 lg:self-start">{result}</div>
    </div>
  );
}

/**
 * Badge affichant si les paramètres sont customisés (différents des defaults).
 * Cliquable, redirige vers la page d'édition du calculateur.
 */
export function SettingsBadge({ slug, isCustom }: { slug: string; isCustom: boolean }) {
  return (
    <Link
      href={`/parametres/${slug}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
        isCustom
          ? 'bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25'
          : 'bg-secondary text-muted-foreground border border-border hover:bg-secondary/80'
      )}
    >
      <span aria-hidden>⚙</span>
      {isCustom ? 'Paramètres modifiés' : 'Paramètres par défaut'}
    </Link>
  );
}

/** Petite section dans le bloc résultat (titre + lignes). */
export function ResultSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1 text-sm">
      {title && <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">{title}</div>}
      {children}
    </div>
  );
}
