import Link from 'next/link';
import { formatLastModified, formatLastModifiedFull } from '@/lib/settings';

/** Header partagé des pages de paramètres : breadcrumb + titre + sous-titre + date. */
export function SettingsHeader({
  title,
  subtitle,
  updatedAt,
}: {
  title: string;
  subtitle: string;
  /** ISO date de la dernière modif côté Supabase. Affichée en pill discrète. */
  updatedAt?: string | null;
}) {
  const relative = formatLastModified(updatedAt);
  const full = formatLastModifiedFull(updatedAt);
  return (
    <>
      <div className="text-sm">
        <Link href="/parametres" className="text-muted-foreground hover:text-primary">
          ← Paramètres
        </Link>
      </div>
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {relative && (
            <span
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground border border-border rounded-full px-2 py-0.5"
              title={full ?? ''}
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              Modifié {relative}
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>
      </div>
    </>
  );
}

/** Conteneur de page paramètres avec padding bottom pour la sticky bar. */
export function SettingsPageContainer({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 pb-32">{children}</div>;
}
