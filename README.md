# 🖨️ Avenir Numérique — Plateforme e-commerce & Back-office

> Plateforme intégrée de gestion commerciale et site e-commerce pour Avenir Numérique, imprimerie professionnelle.

[![Status](https://img.shields.io/badge/Status-Phase%200%20%E2%80%94%20Planification-blue)]()
[![License](https://img.shields.io/badge/License-Propri%C3%A9taire-red)]()

---

## 🎯 Vue d'ensemble

Cette plateforme remplace progressivement l'outil monolithique actuel et apporte :

- 🏢 **Back-office complet** : 5 calculateurs métier, gestion devis, clients, production, expédition, facturation
- 🛒 **Site e-commerce B2B + B2C** : catalogue, configurateur de prix, panier, BAT en ligne, espace client
- 🔄 **Sync temps réel** entre les deux applications via Supabase
- 🇫🇷 **Souveraineté européenne** : hébergement Scaleway, données Supabase en région Frankfurt

## 📐 Stack technique

| Couche | Choix |
|---|---|
| Langage | TypeScript |
| Framework | Next.js 15 (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions) |
| Forms | React Hook Form + Zod |
| Tests | Vitest (unit) + Playwright (e2e) |
| Monorepo | Turborepo |
| Hébergement | Scaleway Containers 🇫🇷 |
| Email | Resend |
| Paiement | Stripe |
| Monitoring | Sentry |
| Analytics | Plausible |

Voir [`docs/STACK_TECHNIQUE.pdf`](./docs/STACK_TECHNIQUE.pdf) pour la version complète.

## 🏗️ Structure du monorepo

```
avenir-numerique/
├── apps/
│   ├── admin/              # Back-office (calculateurs, devis, prod, clients)
│   └── web/                # Site e-commerce public
├── packages/
│   ├── core/               # Moteurs de calcul (TS pur, testés)
│   ├── db/                 # Types Supabase générés, repositories
│   └── ui/                 # Composants UI partagés
├── docs/                   # Documentation métier
├── .github/                # CI/CD workflows
├── turbo.json              # Config Turborepo
└── package.json            # Workspaces racine
```

## 📋 Documentation métier

| Document | Contenu |
|---|---|
| [`docs/SPEC_Calculateurs.md`](./docs/SPEC_Calculateurs.md) | Spécifications des 5 calculateurs avec formules |
| [`docs/WORKFLOWS.md`](./docs/WORKFLOWS.md) | Parcours client + interne |
| [`docs/STACK_TECHNIQUE.pdf`](./docs/STACK_TECHNIQUE.pdf) | Stack technique définitif |

## 🚀 Roadmap

### ✅ Phase 0 — Préparation (FAIT)
- [x] Spécifications calculateurs
- [x] Workflows utilisateurs
- [x] Stack technique validé
- [x] Création du dépôt GitHub

### ⏳ Phase 1 — Brief & chiffrage
- [ ] Brief freelance
- [ ] Réception devis (cible : 25-50k€ HT)
- [ ] Sélection prestataire

### ⏳ Phase 2 — Fondations techniques (2-3 semaines)
- [ ] Setup monorepo Turborepo + Next.js + TypeScript
- [ ] Configuration Supabase (réutilisation projet existant)
- [ ] CI/CD GitHub Actions
- [ ] Tests sur les moteurs de calcul

### ⏳ Phase 3 — Back-office (4-6 semaines)
- [ ] Réécriture des 5 calculateurs en TypeScript
- [ ] Pages clients / devis / production / historique
- [ ] Génération PDF (devis, factures, BAT)

### ⏳ Phase 4 — Site e-commerce (4-6 semaines)
- [ ] Catalogue + configurateur
- [ ] Panier + checkout Stripe
- [ ] Espace client
- [ ] Emails transactionnels

### ⏳ Phase 5 — Ops & lancement (2-3 semaines)
- [ ] Intégration transporteurs
- [ ] Reporting / dashboards
- [ ] Tests utilisateurs
- [ ] Mise en production

## 💻 Développement local

```bash
# Installer les dépendances
pnpm install

# Lancer en mode dev
pnpm dev

# Lancer les tests
pnpm test

# Build production
pnpm build
```

## 🔐 Variables d'environnement

Voir `.env.example` pour la liste complète. Variables sensibles requises :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (back-office uniquement)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `SENTRY_DSN`

## 📞 Contact

**Florian Falaschi** — Avenir Numérique
📧 florian.falaschi@avenirnumerique.fr

---

© 2026 Avenir Numérique — Tous droits réservés. Code propriétaire.
