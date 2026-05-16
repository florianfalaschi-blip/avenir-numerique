# Avenir Numérique — Plateforme e-commerce d'imprimerie

Monorepo Turborepo — Site e-commerce multi-marques + Back-office

## Structure

```
avenir-numerique/
├── apps/
│   ├── admin/          ← Back-office (port 3001)
│   └── web/            ← Site e-commerce public (port 3000)
├── packages/
│   ├── core/           ← Moteurs de calcul TypeScript (5 calculateurs)
│   ├── db/             ← Types Supabase + migrations SQL
│   └── ui/             ← Composants shadcn/ui partagés
├── .github/workflows/  ← CI GitHub Actions
├── turbo.json
└── package.json
```

## Stack technique

| Couche | Choix |
|--------|-------|
| Backend / BDD | Supabase (PostgreSQL) |
| Langage | TypeScript strict |
| Framework front | Next.js 15 (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| Formulaires | React Hook Form + Zod |
| Tests | Vitest + Playwright |
| Hébergement | Scaleway |
| Emails | Resend |
| Paiement | Stripe |
| Monitoring | Sentry |
| Analytics | Plausible |

## Installation

```bash
# Cloner le repo
git clone https://github.com/florianfalaschi-blip/avenir-numerique.git
cd avenir-numerique

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example apps/admin/.env.local
cp .env.example apps/web/.env.local
# Puis remplir les valeurs dans chaque .env.local
```

## Développement

```bash
# Lancer toutes les apps en parallèle
npm run dev

# Admin uniquement (port 3001)
cd apps/admin && npm run dev

# Site web uniquement (port 3000)
cd apps/web && npm run dev
```

## Base de données

```bash
# Initialiser Supabase en local
cd packages/db
npx supabase init
npx supabase start
npx supabase db push  # Applique les migrations

# Regénérer les types TypeScript depuis le schéma
npm run generate-types
```

## Tests

```bash
# Tests unitaires (tous)
npm run test

# Tests unitaires en watch
cd packages/core && npm run test:watch

# Tests e2e
cd apps/web && npm run test:e2e
```

## Architecture multi-tenant

Chaque commande / client / devis porte :
- `tenant_id` → la **marque** (ex: avenir-numerique, imprim-eco)
- `entity_id` → l'**entité juridique** (Entité A, Entité B)

La RLS Supabase assure l'isolation stricte : un client de la marque A ne peut jamais accéder aux données de la marque B.

## Modules à développer

Voir la feuille de route dans les specs :
- `SPEC_Calculateurs_Avenir_Numerique.md`
- `SPEC_WORKFLOWS_Avenir_Numerique.md`
- `SPEC_STACK_TECHNIQUE_Avenir_Numerique.pdf`
- `CDC_Site_e-commerce.docx`
