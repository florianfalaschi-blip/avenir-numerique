# 📚 CONTEXT — Brief de session pour Claude Code

> **À lire en début de session.** Ce document récapitule l'état complet du projet et donne le contexte nécessaire pour reprendre proprement.

---

## 🎯 Le projet en 1 paragraphe

Refonte complète d'un outil d'imprimerie monolithique (HTML/JS, ~22 000 lignes) vers un **monorepo TypeScript pro** : back-office (Next.js) + site e-commerce public (Next.js) partageant un package de **moteurs de calcul** (TypeScript pur, testés). Objectif business : passer de 1 000 à 10 000 commandes/an pour Avenir Numérique, imprimerie professionnelle française.

**Stack** : Next.js 15, TypeScript, Tailwind, shadcn/ui, Supabase (Postgres + Auth + RLS + Realtime + Edge Functions), Stripe, Resend, Sentry, Plausible, hébergement Scaleway 🇫🇷.

---

## 👤 Interlocuteur

**Florian Falaschi** — Dirigeant Avenir Numérique
- 📧 florian.falaschi@avenirnumerique.fr
- **Niveau technique** : non-développeur, en apprentissage. Comprend le code haut niveau, sait suivre des commandes terminal/Git/VS Code, ne sait pas debug seul. Préfère qu'on lui pose des questions claires plutôt que d'assumer.
- **Style de communication** : direct, pragmatique. Apprécie les options chiffrées et les explications simples.

---

## 📐 Documents de référence (à lire absolument)

| Fichier | Contenu |
|---|---|
| [`docs/SPEC_Calculateurs.md`](./docs/SPEC_Calculateurs.md) | Spécifications fonctionnelles des 5 calculateurs métier (formules, variables, cas particuliers) |
| [`docs/WORKFLOWS.md`](./docs/WORKFLOWS.md) | Parcours client e-commerce + parcours interne back-office (BAT, production, facturation) |
| [`docs/STACK_TECHNIQUE.pdf`](./docs/STACK_TECHNIQUE.pdf) | Stack technique validé + estimation coûts récurrents |

---

## 🏗️ Architecture monorepo

```
avenir-numerique/
├── apps/
│   ├── admin/      ← Back-office (Next.js, vide pour l'instant)
│   └── web/        ← Site e-commerce (Next.js, vide pour l'instant)
├── packages/
│   ├── core/       ← ✅ MOTEURS DE CALCUL (en cours)
│   ├── db/         ← Types Supabase (vide pour l'instant)
│   └── ui/         ← Composants shadcn partagés (vide pour l'instant)
├── docs/           ← Documentation métier
├── .github/        ← CI workflow GitHub Actions
├── turbo.json      ← Config Turborepo
└── package.json    ← Workspaces racine (pnpm)
```

---

## ✅ État actuel — où on en est

### Phase 0 — Préparation : **TERMINÉE** ✅
- Spécifications des 5 calculateurs validées avec Florian
- Workflows utilisateur validés
- Stack technique validé
- Dépôt GitHub privé créé

### Phase 1 — Implémentation des moteurs de calcul (`packages/core`) : **EN COURS** ⏳

**Calculateurs implémentés en TypeScript avec tests** :

| Calculateur | Fichier | Tests | Status |
|---|---|---|---|
| Calepinage (helper réutilisable) | `calculators/calepinage.ts` | 6 | ✅ |
| Roll-up | `calculators/rollup.ts` | 12 | ✅ |
| Plaques / Signalétique | `calculators/plaques.ts` | 16 | ✅ |
| Flyers / Affiches | `calculators/flyers.ts` | 17 | ✅ |
| Bobines / Étiquettes | `calculators/bobines.ts` | 18 | ✅ |
| **Brochures** | À écrire | 0 | ⏳ **PROCHAIN** |

**Total actuel : 69 tests passants, 0 failing.**

### Phase 2+ — À venir : **NON COMMENCÉ**
- Package `@avenir/db` (types Supabase, repositories)
- Package `@avenir/ui` (composants shadcn partagés)
- App `admin` (Next.js back-office complet)
- App `web` (Next.js e-commerce public)
- Edge Functions Supabase
- Tests e2e Playwright
- Déploiement Scaleway

---

## 🛠️ Setup environnement local (chez Florian)

- **OS** : Windows 10
- **Éditeur** : VS Code avec extensions ESLint, Prettier, Tailwind CSS IntelliSense, GitHub PR
- **Node.js** : 20.x
- **pnpm** : 11.1.2 (⚠️ CI utilise pnpm 9, attention à la compat lockfile)
- **Git** : configuré (Florian Falaschi / florian.falaschi@avenirnumerique.fr)
- **GitHub Desktop** : utilisé pour les commits (Florian n'utilise pas Git CLI)

### Commandes utiles

```bash
# À la racine
pnpm install              # Installer toutes les dépendances workspaces
pnpm dev                  # Lancer les apps en mode dev (Turborepo orchestre)
pnpm test                 # Lancer tous les tests
pnpm build                # Build production

# Dans packages/core
cd packages/core
pnpm test                 # Vitest une fois
pnpm test:watch           # Vitest en mode watch
pnpm test:manual          # Lance test-manuel.ts (5 scénarios réels)
pnpm type-check           # tsc --noEmit
```

---

## 📦 Package `@avenir/core` — architecture du code

### Convention commune à tous les calculateurs

Chaque calculateur est une **fonction pure** qui prend :
- Un objet `Input` (variables saisies par l'utilisateur)
- Un objet `Params` (paramètres admin : machines, papiers, marges…)

Et renvoie un objet `Result` contenant :
- Le détail des coûts intermédiaires (matière, machine, opérateur, finitions, frais fixes, BAT)
- La marge et le prix HT brut
- La remise dégressive appliquée
- Le prix HT final + TTC
- Un `recap` textuel lisible
- Un tableau `warnings[]` pour les avertissements (switch auto techno, plancher, etc.)

Chaque calculateur expose aussi sa classe d'erreur dédiée (`RollupCalcError`, `PlaquesCalcError`, etc.) avec un `code` machine-readable.

### Conventions importantes

- **Pas d'arrondi intermédiaire** : on garde la précision maximale jusqu'au prix final pour éviter les écarts. Seules les valeurs finales (`prix_ht`, `prix_ttc`) sont arrondies au centime.
- **Calepinage centralisé** : la fonction `calepiner()` dans `calculators/calepinage.ts` est réutilisable entre Plaques et Flyers (et future Brochures).
- **Validation systématique des entrées** : quantité ≥ 1, dimensions > 0, IDs référencés trouvés dans les catalogues.
- **TVA configurable** dans les `Params` (défaut 20).
- **Marge configurable** dans les `Params` (différenciée offset/numérique pour Flyers et Brochures).
- **Dégressif** : grille `[{ seuil, remise_pct }]`, on prend la remise du seuil le plus élevé atteint.
- **Plancher optionnel** `prix_plancher_ht` : si défini, le prix HT final ne descend jamais en dessous (avec warning).

### Fonctionnalités notables par calculateur

- **Roll-up** : le plus simple. Bâche au m², structure 3 niveaux (eco/standard/premium), machine Epson solvant.
- **Plaques** : calepinage automatique (sélection du meilleur format d'achat), 4 finitions types (forfait/unitaire/m²/par_œillet), découpe pleine plaque (auto) ou forme (saisie manuelle longueur en m).
- **Flyers** : le plus complexe. Choix techno auto (selon quantité vs seuil) ou manuel, **switch auto** si techno incompatible avec papier, **sélection auto de la machine la moins chère pour le client** parmi celles compatibles, calepinage, pelliculage par face (× 2 si recto-verso), finitions sous-traitables (coût fournisseur + marge spécifique).
- **Bobines** : 4 formes (rectangle/rond/ovale/forme_libre), 2 méthodes de calcul matière (calepinage rouleau OU m²), 2 conditionnements (planches plat / rouleau applicateur avec forfait rembobinage).
- **Brochures** (TODO) : Couverture + intérieur potentiellement séparés (techno/papier différents), contraintes nb_pages selon reliure, façonnage (agrafé/dos carré collé/cousu/spirale/wire-o), plieuse si nb_pages > 8.

---

## 💰 Valeurs métier importantes à connaître

⚠️ **Toutes les valeurs (prix, vitesses, taux horaires) sont actuellement des estimations**. Florian les calibrera plus tard à partir de ses vrais devis Excel.

Quand les vraies valeurs seront connues, elles seront stockées dans la table Supabase `app_settings` (clé `calc_*_settings_v1`) et synchronisées en temps réel sur tous les postes.

Machines actuellement identifiées :
- **Epson solvant** : roll-ups
- **Mutoh UV LED** : plaques
- **Zund / Summa** : découpe plaques / étiquettes
- **HP Indigo** : flyers numérique
- **Offset Speedmaster** : flyers offset (>500 ex)
- Catalogue **machines de façonnage** à définir pour brochures (agrafeuse, dos carré, plieuse)

---

## 🎨 Conventions de code à respecter

- **TypeScript strict** activé (cf. `tsconfig.json` racine)
- **Pas de `any`** ni `as unknown as ...` (sauf cas justifié documenté)
- **Pas de mutation des paramètres d'entrée** (`Input`, `Params`)
- **Erreurs métier** via classes dédiées (`*CalcError` avec `code`)
- **JSDoc** sur les fonctions publiques exportées
- **Tests Vitest** : `describe` regroupe par thème, `it` formule en français le comportement attendu
- **Prettier** configuré : 2 espaces, single quotes, trailing comma es5, 100 chars max

---

## 🚦 CI/CD

Le workflow `.github/workflows/ci.yml` tourne à chaque push sur `main` :
- ✅ Tests du package `@avenir/core` (must pass)
- 🔵 Type-check `@avenir/core` (info only, `continue-on-error: true`)
- 🔵 Lint global (info only)

Quand on ajoute un nouveau package, **mettre à jour le workflow** pour l'inclure dans la pipeline obligatoire.

---

## 📜 Historique des décisions importantes

| Décision | Raison |
|---|---|
| Monorepo Turborepo (vs 2 repos séparés) | Cohérence absolue calculs entre admin et e-com, 1 seul historique Git |
| Supabase (vs auto-hébergé Postgres) | Auth + Storage + Realtime + Edge Functions intégrés, RGPD-compliant région EU |
| Next.js 15 App Router | Standard industrie 2026, SSR/SSG pour SEO e-com |
| shadcn/ui (vs Material UI / Chakra) | Composants copiables et customisables, pas de bundle bloated |
| Scaleway 🇫🇷 (vs Vercel) | Souveraineté française demandée par Florian |
| pnpm (vs npm/yarn) | Performances + workspaces natifs |
| Vitest (vs Jest) | Plus rapide, meilleure intégration TypeScript moderne |
| Resend (vs SendGrid) | Pricing simple, RGPD-friendly |
| Plausible (vs Google Analytics) | RGPD, pas de bandeau cookie nécessaire |
| TVA configurable par calculateur | Florian peut avoir besoin de TVA spécifique selon le client |
| Marge séparée offset/numérique pour Flyers et Brochures | Demande explicite Florian |
| Switch auto techno si incompatible papier | Florian préfère un système qui décide vs erreur bloquante |
| Choix machine = la moins chère pour le client | Optimisation business explicite |

---

## ⏭️ Prochaine étape — Brochures

**Spécifications** : voir `docs/SPEC_Calculateurs.md` section 6.

**Points clés à implémenter** :
- Variables d'entrée : quantite, nb_pages, dimensions (standard/custom), reliure, papier intérieur ET papier couverture (peuvent différer), couleur intérieur (quadri/noir), couleur couverture (idem), techno_mode, finitions (sur couverture), bat
- Validation nb_pages selon contrainte de la reliure (`pages_multiple`, `pages_min`, `pages_max`)
- Catalogue reliures : agrafé (mult 4), dos carré collé (mult 2), dos carré cousu (mult 4), spirale (mult 1), wire-o (mult 1) — chacune liée à une machine de façonnage
- Catalogue machines de façonnage avec : type, vitesse_brochures_h ou vitesse_feuilles_h, taux machine, taux opérateur, coût consommables (agrafes, colle, spirale, wire-o)
- Plieuse séparée pour les cahiers > 8 pages
- Couverture compte 4 pages (calcul : nb_feuilles_interieur = (nb_pages - 4) / 2)
- Intérieur et couverture peuvent utiliser des machines DIFFÉRENTES (la moins chère pour chacun, comme Flyers)
- Pelliculage couverture par face (× 2 si RV)
- Possibilité de sous-traitance pour dos carré cousu

**Estimation** : ~1h30 de travail (similaire à Flyers en complexité)

---

## 🎬 Comment reprendre la session

1. Lire ce document `CONTEXT.md` en entier
2. Vérifier l'état actuel : `pnpm test` à la racine (doit afficher 69 tests passants)
3. Lire les 3 documents `docs/` pour le contexte métier
4. Demander à Florian quelle est sa priorité (Brochures, ou autre)
5. Travailler en mode itératif : petites modifications + tests + commit + push

---

*Document mis à jour : Mai 2026 — Phase 1 en cours (4/5 calculateurs implémentés)*
