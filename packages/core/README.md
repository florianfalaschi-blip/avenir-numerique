# @avenir/core

> Moteurs de calcul métier (TypeScript pur, sans dépendance UI).

## Périmètre

Ce package contient les **5 calculateurs métier** sous forme de fonctions pures, testées :

- `calcRollup(input, params)` → Roll-up
- `calcPlaques(input, params)` → Plaques / Signalétique
- `calcFlyers(input, params)` → Flyers / Affiches
- `calcBobines(input, params)` → Bobines / Étiquettes
- `calcBrochures(input, params)` → Brochures

Chaque fonction prend en entrée :
- Un objet `input` (variables saisies par l'utilisateur)
- Un objet `params` (paramètres admin : machines, papiers, marges, etc.)

Et renvoie :
- Un objet `result` (coûts détaillés + prix HT + prix TTC + récapitulatif)

## Tests

Tests unitaires avec **Vitest** :
- Au minimum 20-30 cas par calculateur
- Cas calibrés sur de **vrais devis validés Excel**
- Comparaison **au centime près**

```bash
pnpm test
```

## API

Exemple d'usage :

```typescript
import { calcRollup } from '@avenir/core';

const result = calcRollup({
  quantite: 5,
  largeur_cm: 85,
  hauteur_cm: 200,
  bache_id: 'pvc_440g',
  structure_id: 'standard',
  bat: false
}, params);

console.log(result.prix_ht);  // ex. 152.40
console.log(result.recap);    // détail textuel
```

## Spécifications

Voir [`docs/SPEC_Calculateurs.md`](../../docs/SPEC_Calculateurs.md) à la racine du monorepo.
