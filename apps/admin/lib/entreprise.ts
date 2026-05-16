'use client';

import { useSettings } from './settings';

/**
 * Informations légales et de contact de l'entreprise (Avenir Numérique),
 * imprimées en en-tête / pied de page des devis et factures.
 *
 * Stockées en `avenir.config.entreprise.v1` (préfixe `config.` parallèle
 * à `data.` et `calc.` — voir lib/settings.ts).
 */
export interface EntrepriseConfig {
  raison_sociale: string;
  /** Forme juridique (SARL, SAS, EI…). */
  forme_juridique?: string;
  /** Capital social pour les sociétés. */
  capital_social?: string;
  /** Adresse postale complète. */
  adresse_ligne1?: string;
  adresse_ligne2?: string;
  adresse_cp?: string;
  adresse_ville?: string;
  adresse_pays?: string;
  email?: string;
  telephone?: string;
  /** Site web (sans http://). */
  site_web?: string;
  /** SIRET 14 chiffres. */
  siret?: string;
  /** Numéro RCS (ex. "Paris B 123 456 789"). */
  rcs?: string;
  /** Code APE / NAF. */
  ape?: string;
  /** TVA intracommunautaire (ex. "FR12345678901"). */
  tva_intra?: string;
  /** IBAN bancaire pour paiements par virement. */
  iban?: string;
  /** BIC associé à l'IBAN. */
  bic?: string;
  /** Banque (nom de l'établissement). */
  banque?: string;
  /** Mention bas de page (validité devis, escompte, pénalités…). */
  mentions_devis?: string;
  /** URL du logo (image affichée en en-tête du PDF). */
  logo_url?: string;
}

export const defaultEntreprise: EntrepriseConfig = {
  raison_sociale: 'AVENIR NUMÉRIQUE',
  forme_juridique: 'SARL',
  adresse_ligne1: '12 rue de l\'Imprimerie',
  adresse_cp: '75000',
  adresse_ville: 'Paris',
  adresse_pays: 'France',
  email: 'contact@avenirnumerique.fr',
  telephone: '+33 1 23 45 67 89',
  site_web: 'avenirnumerique.fr',
  siret: '000 000 000 00000',
  tva_intra: 'FR00000000000',
  mentions_devis:
    'Devis valable 30 jours à compter de la date d\'émission. ' +
    'Conditions générales de vente disponibles sur demande. ' +
    'Tout retard de paiement entraîne l\'application de pénalités au taux légal en vigueur.',
};

/** Hook lecture/écriture de la config entreprise. */
export function useEntreprise() {
  return useSettings('config.entreprise', defaultEntreprise);
}

/** Formate l'adresse de l'entreprise sur une seule ligne. */
export function formatEntrepriseAdresse(e: EntrepriseConfig): string {
  const parts = [
    e.adresse_ligne1,
    e.adresse_ligne2,
    `${e.adresse_cp ?? ''} ${e.adresse_ville ?? ''}`.trim(),
    e.adresse_pays,
  ].filter((p) => p && p.trim().length > 0);
  return parts.join(', ');
}
