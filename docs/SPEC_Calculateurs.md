# 📐 Spécifications fonctionnelles — Calculateurs Avenir Numérique

> **Document de référence métier** — Mai 2026  
> Préparé pour la refonte technique du back-office et du site e-commerce  
> Source : entretiens itératifs avec Florian Falaschi (CEO, Avenir Numérique)

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Calculateur Roll-up](#2-calculateur-roll-up)
3. [Calculateur Plaques / Signalétique](#3-calculateur-plaques--signalétique)
4. [Calculateur Flyers / Affiches](#4-calculateur-flyers--affiches)
5. [Calculateur Bobines / Étiquettes](#5-calculateur-bobines--étiquettes)
6. [Calculateur Brochures](#6-calculateur-brochures)
7. [Invariants transversaux](#7-invariants-transversaux)

---

## 1. Vue d'ensemble

L'outil propose **5 calculateurs** correspondant aux 5 grandes familles de produits. Tous partagent une logique commune :

```
Coût matière + Coût impression + Coût opérateur + Coût façonnage + Coût finitions
+ Frais fixes + (BAT optionnel)
= COÛT DE REVIENT

× (1 + marge%) → PRIX HT BRUT
× (1 - remise dégressif%) → PRIX HT FINAL
× (1 + TVA%) → PRIX TTC
```

### Éléments transversaux (catalogues partagés Supabase)

- **Catalogue papiers** : utilisé par Flyers, Affiches, Brochures (avec flag `compatible_techno`)
- **Catalogue machines** : extensible, paramétrable par admin
- **Catalogue finitions** : partagé (pelliculage, vernis, dorure...) avec possibilité d'ajout manuel par devis
- **Catalogue sous-traitants** : pour finitions non réalisables en interne
- **TVA configurable** par calculateur (défaut 20%)
- **Marges paramétrables** par calculateur (et par techno offset/numérique pour flyers et brochures)
- **Dégressif quantité** : seuils + remises configurables par admin

---

## 2. Calculateur Roll-up

### Variables d'entrée

| Code | Champ | Type | Notes |
|---|---|---|---|
| `quantite` | Quantité | int | Dégressif possible à partir de 3 |
| `largeur_cm` | Largeur (cm) | int | Configurable (défaut 85) |
| `hauteur_cm` | Hauteur (cm) | int | Configurable (défaut 200) |
| `bache_id` | Matière bâche | enum | PVC 440g par défaut, extensible |
| `structure_id` | Niveau structure | enum | Eco / Standard / Premium |
| `bat` | Option BAT | bool | Si oui, frais BAT ajoutés |

### Paramètres admin

- Catalogue bâches avec prix au m² HT
- Catalogue structures (3 niveaux) avec prix unitaires HT
- Machine **Epson** (solvant/éco-solvant) : vitesse m²/h + taux horaire (modifiables)
- Frais fixes par commande (modifiable par devis)
- Prix BAT
- Marge % et TVA %
- Grille dégressif (seuils + remises)

### Formule de calcul

```
surface_m² = (largeur_cm × hauteur_cm) / 10 000

cout_bache_unitaire = surface_m² × bache.prix_m²_HT
cout_machine_unitaire = (surface_m² / machine.vitesse_m²_h) × machine.taux_horaire_HT
cout_structure_unitaire = structure.prix_unitaire_HT

cout_unitaire = cout_bache + cout_machine + cout_structure
cout_total = (cout_unitaire × quantite) + frais_fixes + (bat ? bat_prix : 0)

prix_HT_brut = cout_total × (1 + marge%/100)
remise = degressif.find(s => quantite >= s.seuil)?.remise_pct ?? 0
prix_HT = prix_HT_brut × (1 - remise/100)
prix_TTC = prix_HT × (1 + tva%/100)
```

### Cas particuliers

- ✅ Sac de transport + scratchs **inclus** (rien à facturer)
- ✅ Quadri recto seul uniquement
- ✅ Pas de finitions payantes
- ✅ Le client fournit son fichier (pas de création graphique)

---

## 3. Calculateur Plaques / Signalétique

### Variables d'entrée

| Code | Champ | Type | Notes |
|---|---|---|---|
| `quantite` | Quantité | int | |
| `dimension_mode` | Mode dimensions | enum | `standard` ou `custom` |
| `largeur_cm`, `hauteur_cm` | Dimensions custom | int | |
| `taille_standard` | Taille standard | enum | A4, A3, A2, A1, A0 |
| `materiau_id` | Matériau | enum | PVC, Forex, Dibond, Plexi, Carton plume... |
| `decoupe_mode` | Type découpe | enum | `pleine_plaque` ou `forme` (Zund) |
| `finitions[]` | Finitions | array | Œillets, supports, vernis, lamination |
| `bat` | Option BAT | bool | |

### Paramètres admin

- Catalogue matériaux avec **formats d'achat brut** (plusieurs possibles par matériau) et prix unitaires
- Formats standards A4 à A0 (dimensions normalisées)
- Machine impression **Mutoh UV LED** : vitesse + taux horaire
- Machine découpe **Zund** : prix au mètre linéaire + vitesse + taux horaire + forfait minimum
- Catalogue finitions avec types (forfait, unitaire, m², par_œillet)
- Frais fixes, BAT, marge, TVA, dégressif

### Formule de calcul (résumé)

**Calepinage automatique** :
- Pour chaque format d'achat du matériau, calcule nb de poses possibles (avec rotation 90° testée)
- Garde le format avec le **meilleur ratio prix / pose**

**Découpe** :
- `pleine_plaque` : périmètre = `2 × (largeur + hauteur)`
- `forme` : longueur de découpe **saisie manuellement** (impossible à calculer sans le fichier)
- Coût découpe = `metres × prix_metre_lineaire` (avec plancher si défini)

### Cas particuliers

- ⚠️ **Découpe forme** : la longueur de découpe doit être saisie ou estimée par forfait taille
- ⚠️ Chutes du calepinage non facturées séparément (intégrées dans coût matière brute)

---

## 4. Calculateur Flyers / Affiches

### Variables d'entrée

| Code | Champ | Type | Notes |
|---|---|---|---|
| `quantite` | Quantité | int | |
| `dimension_mode` | Mode | enum | `standard` ou `custom` |
| `largeur_mm`, `hauteur_mm` | Dims custom | int | **Bridé au format machine max** |
| `taille_standard` | Taille std | enum | A6, A5, A4, A3, DL, carte de visite |
| `papier_id` | Papier | enum | Catalogue partagé |
| `recto_verso` | RV | enum | `recto` ou `rv` |
| `techno_mode` | Techno | enum | `auto`, `offset`, `numerique` |
| `finitions[]` | Finitions | array | Catalogue + ajout manuel |
| `bat` | Option BAT | bool | |

### Paramètres admin

- **Catalogue machines** extensible avec techno, format max, vitesse, taux horaire, coût calage, % gâches, taux horaire opérateur
- **Seuil offset/numérique** configurable (ex. >500 ex = offset par défaut)
- **Catalogue papiers** partagé avec plusieurs formats d'achat + flag `compatible_techno`
- Formats standards (A6 à A3, DL, CV)
- Catalogue finitions avec sous-traitance possible (catalogue sous-traitants)
- **Marge offset** et **marge numérique** distinctes
- Frais fixes, BAT, TVA, dégressif

### Formule de calcul (résumé)

```
1. Choix techno : auto (selon quantite vs seuil) ou override manuel
2. Switch auto si techno incompatible avec papier sélectionné
3. Choix machine : la moins chère pour le client (PV final minimum)
4. Calepinage auto avec rotation 90°
5. Application gâches selon machine
6. Coûts :
   - Numérique : papier + (durée × taux_machine) + (durée × taux_opérateur)
   - Offset : papier + cout_calage + (durée × taux_machine) + (durée × taux_opérateur)
7. Pelliculage par face → × 2 si recto-verso
8. Sous-traitance : coût fournisseur + marge spécifique
9. Total revient × (1 + marge_techno%) × (1 - remise%) × (1 + TVA%)
```

### Cas particuliers

- ✅ **Switch auto** si techno choisie incompatible avec papier
- ✅ **Choix machine auto = la moins chère pour le client** (PV final)
- ✅ **Recto-verso offset = 1 seul calage** par défaut (configurable par machine)
- ✅ **Pelliculage facturé par face** (× 2 si RV)
- ✅ **Bridage format custom** au format machine max
- ✅ **Sous-traitance** : flag `sous_traite: true` + coût fournisseur + marge

---

## 5. Calculateur Bobines / Étiquettes

### Variables d'entrée

| Code | Champ | Type | Notes |
|---|---|---|---|
| `quantite_etiquettes` | Quantité | int | |
| `forme` | Forme | enum | `rectangle`, `rond`, `ovale`, `forme_libre` |
| `largeur_mm`, `hauteur_mm` | Dims | int | Selon forme |
| `diametre_mm` | Diamètre | int | Si rond |
| `materiau_id` | Matériau | enum | Vinyle, polypro, papier adhésif, polyester... |
| `conditionnement` | Livraison | enum | `planches_plat` ou `rouleau_applicateur` |
| `decoupe_mode` | Type découpe | enum | `forme_simple` ou `forme_libre` |
| `finitions[]` | Finitions | array | Vernis, lamination, dorure... |
| `bat` | Option BAT | bool | |

### Paramètres admin

- **Catalogue matériaux** avec rouleaux disponibles (largeur × longueur × prix) ET/OU prix au mètre linéaire
- Méthode de calcul : `calepinage`, `m2`, ou `auto`
- Machine impression **solvant/éco-solvant** : vitesse + taux + gâches
- Machine découpe **Zund / Summa** : vitesse + taux + forfait cliquage (modifiable)
- Catalogue finitions (vernis, lamination, dorure, effet 3D sous-traité)
- Espace entre étiquettes configurable (défaut 3mm)
- Frais fixes, BAT, marge, TVA, dégressif

### Formule de calcul (résumé)

**Surface unitaire selon forme** :
- Rectangle : `L × H`
- Rond : `π × r²`
- Ovale : `π × (L/2) × (H/2)` (approximation)
- Forme libre : saisie manuelle

**Calcul matière** :
- Si **calepinage** : nb d'étiquettes par largeur rouleau × longueur nécessaire → nb rouleaux ou mètres linéaires
- Si **m²** : surface totale × prix m² × (1 + gâches%)

**Découpe** :
- Périmètre unitaire × quantité = mètres totaux à découper
- Coût = durée découpe × taux horaire + frais cliquage

**Conditionnement** :
- Planches à plat : inclus
- Rouleau applicateur : forfait rembobinage

### Cas particuliers

- ✅ **Calcul auto matière** entre calepinage et m² selon configuration matériau
- ✅ **Forme libre** : surface + périmètre saisis manuellement
- ✅ **Forfait cliquage Zund/Summa** ajustable par devis
- ⚠️ Si commande > capacité rouleau → afficher info / alerte

---

## 6. Calculateur Brochures

### Variables d'entrée

| Code | Champ | Type | Notes |
|---|---|---|---|
| `quantite` | Quantité brochures | int | |
| `nb_pages` | Nombre de pages | int | **Contraint selon reliure** |
| `dimension_mode` | Mode | enum | `standard` ou `custom` |
| `taille_standard` | Taille std | enum | A6, A5, A4 + portrait/paysage/carré |
| `largeur_mm`, `hauteur_mm` | Dims custom | int | Bridé format machine |
| `reliure_id` | Type reliure | enum | agrafé, dos carré collé, dos carré cousu, spirale, wire-o |
| `papier_interieur_id` | Papier intérieur | enum | Catalogue commun |
| `papier_couverture_id` | Papier couverture | enum | Peut être identique ou plus épais |
| `couleur_interieur` | Couleurs | enum | `quadri` ou `noir` |
| `couleur_couverture` | Couleurs | enum | `quadri` ou `noir` |
| `techno_mode` | Techno | enum | `auto`, `offset`, `numerique` |
| `finitions[]` | Finitions | array | Sur couverture principalement |
| `bat` | Option BAT | bool | |

### Paramètres admin

- **Catalogue reliures** : multiple de pages, min/max, machine associée, consommables
- **Catalogue machines façonnage** : agrafeuse, dos carré, plieuse, spirale, wire-o
- Réutilise **catalogue papiers** et **catalogue machines impression**
- Seuil offset/numérique
- Catalogue finitions
- **Frais fixes spécifiques brochure** (plus chers que flyers)
- **Marge offset** et **marge numérique** distinctes
- BAT, TVA, dégressif

### Formule de calcul (résumé)

```
1. Validation nb_pages : doit être multiple de reliure.pages_multiple
   et entre pages_min et pages_max
2. Séparation impression :
   - INTÉRIEUR : nb_feuilles = (nb_pages - 4) / 2
   - COUVERTURE : 1 feuille (4 pages RV)
3. Choix techno + machine (la moins chère, comme flyers)
   → peut être DIFFÉRENT entre intérieur et couverture
4. Coût impression intérieur (quadri ou noir, RV)
5. Coût impression couverture (quadri ou noir, RV)
6. Coût façonnage = durée × taux machine + opérateur + consommables
7. Coût pliage si > 8 pages
8. Coût finitions (sur couverture, pelliculage par face)
9. Total revient + frais fixes + BAT × (1 + marge%) × (1 - remise%) × (1 + TVA%)
```

### Cas particuliers

- ✅ **Couverture & intérieur peuvent avoir techno/papier différents**
- ✅ **Pelliculage par face** sur la couverture (× 2 si RV)
- ⚠️ **Dos carré cousu** : peut nécessiter sous-traitance
- ⚠️ **Plieuse** nécessaire si feuilles > A3
- ⚠️ Couverture compte 4 pages incluses dans le total

---

## 7. Invariants transversaux

### Sécurité / cohérence

1. **Toutes les valeurs admin (prix, vitesses, taux) sont modifiables** par utilisateur ayant la permission `edit_settings`
2. **Le rôle admin** peut modifier les marges, taux, dégressifs ; les commerciaux ne peuvent pas
3. **Aucun prix de vente final ne peut être inférieur** à un plancher configurable (à définir par calculateur)
4. **Si un paramètre obligatoire manque** (ex. vitesse machine non configurée) → afficher alerte ⚠️ et bloquer le calcul ou utiliser une valeur de défaut configurable

### Catalogues partagés (table Supabase)

- `papiers` : utilisé par Flyers, Brochures (avec flag `compatible_techno`)
- `machines_impression` : Flyers, Brochures
- `machines_faconnage` : Brochures
- `materiaux_plaques` : Plaques
- `materiaux_bobines` : Bobines
- `structures_rollup` : Roll-up
- `finitions` : tous (avec champ `applicable_to: ['flyers', 'brochures', 'plaques', ...]`)
- `sous_traitants` : tous

### Logs et traçabilité

Chaque calcul doit produire **un récapitulatif détaillé** lisible (déjà présent dans l'outil actuel) :
- Liste des coûts par poste
- Marge appliquée
- Remise dégressif appliquée
- TVA appliquée
- Source de chaque valeur (paramètres globaux ou override devis)

### Architecture cible recommandée

- **Module pur** par calculateur (TypeScript) : prend en entrée un objet de configuration + paramètres, renvoie un objet de résultat. Aucune dépendance UI.
- **Tests unitaires** : pour chaque calculateur, au minimum 20-30 cas issus de vrais devis validés Excel.
- **API contract** : Edge Function Supabase qui expose les calculateurs en HTTPS pour le site e-commerce.

---

## 📌 Points laissés à compléter (valeurs réelles à renseigner ultérieurement)

| Catégorie | Élément | Status |
|---|---|---|
| Roll-up | Prix m² bâche PVC 440g | À renseigner |
| Roll-up | Prix unitaires structures Eco / Standard / Premium | À renseigner |
| Roll-up | Vitesse Epson (m²/h) et taux horaire | À renseigner |
| Plaques | Prix par format d'achat pour chaque matériau | À renseigner |
| Plaques | Vitesse Mutoh UV LED + taux horaire | À renseigner |
| Plaques | Vitesse Zund + taux horaire + prix mètre linéaire | À renseigner |
| Flyers | Noms et caractéristiques des 2-3 machines | À renseigner |
| Flyers | Forfait calage offset | À renseigner |
| Flyers | Vitesses machines en feuilles/h | À renseigner |
| Flyers | Pourcentage gâches par machine | À renseigner |
| Flyers | Marges spécifiques offset / numérique | À renseigner |
| Flyers | Seuil offset (qté minimum) | À renseigner |
| Bobines | Prix par rouleau et par matériau | À renseigner |
| Bobines | Vitesse machine + taux horaire | À renseigner |
| Bobines | Vitesse Zund/Summa + taux + forfait cliquage | À renseigner |
| Brochures | Noms et caractéristiques machines façonnage | À renseigner |
| Brochures | Consommables (agrafes, colle, spirale, wire-o) | À renseigner |
| Brochures | Vitesses plieuse + taux | À renseigner |
| Brochures | Frais fixes spécifiques brochure | À renseigner |
| Tous | Catalogue finitions avec tarifs | À renseigner |
| Tous | Catalogue sous-traitants + tarifs négociés | À renseigner |
| Tous | Marges, BAT, dégressifs configurés | À renseigner |

---

*Fin du document — Spécifications version 1.0 — Mai 2026*
