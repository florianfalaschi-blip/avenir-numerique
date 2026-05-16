import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Pill } from '@avenir/ui';

const calculateurs = [
  {
    slug: 'rollup',
    nom: 'Roll-up',
    icon: '🎯',
    description: 'Bâche PVC + structure (eco/standard/premium)',
  },
  {
    slug: 'plaques',
    nom: 'Plaques',
    icon: '🟦',
    description: 'PVC, Forex, Dibond, Plexi — calepinage + Zund',
  },
  {
    slug: 'flyers',
    nom: 'Flyers',
    icon: '📰',
    description: 'Offset/numérique auto, pelliculage par face',
  },
  {
    slug: 'bobines',
    nom: 'Bobines',
    icon: '🏷️',
    description: 'Étiquettes adhésives, 4 formes',
  },
  {
    slug: 'brochures',
    nom: 'Brochures',
    icon: '📖',
    description: 'Intérieur + couverture séparés, 4 reliures',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Génère des devis, suis la production, gère les paiements.
          </p>
        </div>
        <Pill variant="accent" size="lg">
          ⚡ Phase 3a — stockage local
        </Pill>
      </div>

      {/* Flux principal — cartes d'action */}
      <section className="space-y-3">
        <p className="label-section">Flux principal</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            href="/devis/nouveau"
            title="Nouveau devis"
            description="Sélectionne un client, choisis un produit"
            icon="📝"
            accent
          />
          <ActionCard
            href="/devis"
            title="Tous les devis"
            description="Historique filtrable par statut"
            icon="📄"
          />
          <ActionCard
            href="/commandes"
            title="Production"
            description="Suivi du workflow d'étapes"
            icon="📦"
          />
          <ActionCard
            href="/factures"
            title="Facturation"
            description="Émission, paiements, échéances"
            icon="💰"
          />
        </div>
      </section>

      {/* Calculateurs en mode test */}
      <section className="space-y-3">
        <div>
          <p className="label-section">Calculateurs (mode test)</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Joue avec les calculateurs sans créer de devis.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {calculateurs.map((c) => (
            <Link key={c.slug} href={`/calculateurs/${c.slug}`} className="group block">
              <Card className="h-full elevation-soft elevation-hover group-hover:border-primary">
                <CardContent className="pt-5 pb-4 text-center">
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <p className="font-semibold text-sm">{c.nom}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    {c.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer info */}
      <div className="rounded-lg border border-dashed bg-card p-4 text-xs text-muted-foreground max-w-3xl">
        <p>
          <strong className="text-foreground">⚠ Stockage local</strong> — Clients, devis,
          commandes, factures et paramètres sont stockés dans ce navigateur. Phase 3b à
          venir : Supabase pour partager entre tous les postes.
        </p>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon,
  accent = false,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
  accent?: boolean;
}) {
  return (
    <Link href={href} className="group block">
      <Card
        className={
          'h-full elevation-soft elevation-hover ' +
          (accent
            ? 'border-accent/40 bg-accent-soft group-hover:border-accent'
            : 'group-hover:border-primary')
        }
      >
        <CardHeader className="pb-3">
          <div className="text-2xl mb-1">{icon}</div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <span
            className={
              'inline-flex items-center gap-1 text-[11px] font-semibold ' +
              (accent ? 'text-accent' : 'text-primary')
            }
          >
            Démarrer
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
