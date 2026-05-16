import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@avenir/ui';

const calculateurs = [
  {
    slug: 'rollup',
    nom: 'Roll-up',
    description: 'Bâche PVC + structure (eco/standard/premium). Le plus simple.',
  },
  {
    slug: 'plaques',
    nom: 'Plaques / Signalétique',
    description: 'PVC, Forex, Dibond, Plexi — calepinage automatique + découpe Zund.',
  },
  {
    slug: 'flyers',
    nom: 'Flyers / Affiches',
    description: 'Choix techno auto, machine la moins chère, pelliculage par face.',
  },
  {
    slug: 'bobines',
    nom: 'Bobines / Étiquettes',
    description: '4 formes, calepinage rouleau ou m², planches ou rouleau applicateur.',
  },
  {
    slug: 'brochures',
    nom: 'Brochures',
    description: 'Intérieur + couverture séparés, 4 reliures, pliage et finitions.',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calculateurs de devis</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Configure une commande, le prix HT / TTC se calcule en temps réel avec le détail des
          coûts. Les paramètres (papiers, machines, marges, etc.) seront stockés dans Supabase plus
          tard ; pour l&apos;instant ce sont des valeurs de démo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {calculateurs.map((c) => (
          <Link
            key={c.slug}
            href={`/calculateurs/${c.slug}`}
            className="group block"
          >
            <Card className="h-full transition group-hover:border-primary group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{c.nom}</CardTitle>
                <CardDescription>{c.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Ouvrir le calculateur
                  <span aria-hidden className="transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-dashed bg-secondary/30 p-4 text-sm text-muted-foreground max-w-2xl">
        <p>
          <strong className="text-foreground">Phase 1 ✅</strong> — Les 5 moteurs de calcul sont
          implémentés et testés (109 tests).
        </p>
        <p className="mt-1">
          <strong className="text-foreground">Phase 2 (en cours)</strong> — UI admin pour valider
          visuellement chaque calculateur, puis branchement Supabase pour persister les paramètres.
        </p>
      </div>
    </div>
  );
}
