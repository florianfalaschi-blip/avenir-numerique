/**
 * @avenir/core — Moteurs de calcul Avenir Numérique
 *
 * Ce package contient les 5 calculateurs TypeScript purs :
 * - Roll-up
 * - Plaques / Signalétique
 * - Flyers / Affiches
 * - Bobines / Étiquettes
 * - Brochures
 *
 * Ces modules sont partagés entre apps/admin et apps/web.
 * Aucune dépendance UI. Aucune dépendance réseau.
 * Entrée : objet de configuration + paramètres
 * Sortie : objet de résultat détaillé (coûts par poste, prix HT, prix TTC)
 */

// Calculateurs (à implémenter par le collègue)
export * from './calculateurs/rollup'
export * from './calculateurs/plaques'
export * from './calculateurs/flyers'
export * from './calculateurs/bobines'
export * from './calculateurs/brochures'

// Types partagés
export * from './types'
