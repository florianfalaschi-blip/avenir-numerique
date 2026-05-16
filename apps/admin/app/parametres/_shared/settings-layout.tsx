import Link from 'next/link';

/** Header partagé des pages de paramètres : breadcrumb + titre + sous-titre. */
export function SettingsHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <>
      <div className="text-sm">
        <Link href="/parametres" className="text-muted-foreground hover:text-primary">
          ← Paramètres
        </Link>
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
      </div>
    </>
  );
}

/** Conteneur de page paramètres avec padding bottom pour la sticky bar. */
export function SettingsPageContainer({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 pb-32">{children}</div>;
}
