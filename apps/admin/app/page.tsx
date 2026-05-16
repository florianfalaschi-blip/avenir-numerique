import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@avenir/ui';

const calculateurs = [
  {
    slug: 'rollup',
    nom: 'Roll-up',
    description: 'Bâche PVC + structure (eco/standard/premium).',
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
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Back-office Avenir Numérique</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Génère des devis, gère ta base clients, et configure les paramètres tarifaires de chaque
          calculateur métier.
        </p>
      </div>

      {/* === FLUX PRINCIPAL : DEVIS / CLIENTS === */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Flux principal
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/devis/nouveau" className="group block">
            <Card className="h-full transition group-hover:border-accent group-hover:shadow-md border-accent/40 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg">+ Nouveau devis</CardTitle>
                <CardDescription>
                  Sélectionne un client, choisis un produit, le devis se sauvegarde en 1 clic.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                  Démarrer
                  <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/devis" className="group block">
            <Card className="h-full transition group-hover:border-primary group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Tous les devis</CardTitle>
                <CardDescription>
                  Historique filtrable par statut (brouillon, envoyé, accepté…) et par produit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Voir la liste
                  <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/commandes" className="group block">
            <Card className="h-full transition group-hover:border-primary group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Commandes en production</CardTitle>
                <CardDescription>
                  Suivi du workflow d&apos;une commande : étapes, statut, livraison.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Suivre la production
                  <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/factures" className="group block">
            <Card className="h-full transition group-hover:border-primary group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Factures</CardTitle>
                <CardDescription>
                  Émission, suivi des paiements, échéances et relances.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Gérer la facturation
                  <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/clients" className="group block">
            <Card className="h-full transition group-hover:border-primary group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Clients</CardTitle>
                <CardDescription>
                  Carnet d&apos;adresses B2C / B2B, historique de devis par client.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Gérer la base
                  <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/parametres" className="group block">
            <Card className="h-full transition group-hover:border-primary group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">⚙ Paramètres</CardTitle>
                <CardDescription>
                  Catalogues papiers, matériaux, machines, marges et dégressifs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Configurer
                  <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* === CALCULATEURS === */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Calculateurs (mode test)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Joue avec les calculateurs sans créer de devis. Utilise « + Nouveau devis » pour
            enregistrer un calcul à un client.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {calculateurs.map((c) => (
            <Link key={c.slug} href={`/calculateurs/${c.slug}`} className="group block">
              <Card className="h-full transition group-hover:border-primary group-hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{c.nom}</CardTitle>
                  <CardDescription>{c.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Ouvrir le calculateur
                    <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="rounded-lg border border-dashed bg-secondary/30 p-4 text-sm text-muted-foreground max-w-3xl">
        <p>
          <strong className="text-foreground">⚠️ Stockage local (Phase 3a)</strong> — Clients,
          devis et paramètres sont stockés dans ton navigateur. Phase 3b à venir : Supabase pour
          partager entre tous les postes.
        </p>
      </div>
    </div>
  );
}
