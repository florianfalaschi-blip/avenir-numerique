import type { SoustraitanceParams } from '@avenir/core';

/**
 * Paramètres par défaut du calculateur Sous-traitance.
 *
 * Catalogue importé du calculateur_imprimerie_40.html — 35 fournisseurs
 * historiques d'Avenir Numérique (snapshot du 2026-05-17).
 *
 * Marge par défaut : 30 % (valeur legacy).
 */
export const defaultSoustraitanceParams: SoustraitanceParams = {
  fournisseurs: [
    { id: 'rps', nom: 'RPS' },
    { id: 'sipap', nom: 'SIPAP' },
    { id: 'lgi', nom: 'LGI' },
    { id: 'silium', nom: 'SILIUM' },
    { id: 'letter_press_paris', nom: 'LETTER PRESS PARIS' },
    { id: 'leader_print', nom: 'LEADER PRINT', notes: 'Anciennement Agence de Fab' },
    { id: 'plastitou', nom: 'PLASTITOU' },
    { id: 'brp', nom: 'BRP' },
    { id: 'jappel', nom: 'JAPPEL' },
    { id: 'abaqueplast', nom: 'ABAQUEPLAST' },
    { id: 'ouest_enseigne', nom: 'OUEST ENSEIGNE' },
    { id: 'agap', nom: 'AGAP' },
    { id: 'luxenvel', nom: 'LUXENVEL' },
    { id: 'exaprint', nom: 'EXAPRINT' },
    { id: 'dagobert', nom: 'DAGOBERT' },
    { id: '123_magnet', nom: '123 MAGNET' },
    { id: 'atelier_cassandre', nom: 'ATELIER CASSANDRE' },
    { id: 'creapose', nom: 'CREAPOSE' },
    { id: 'forme_cb', nom: 'FORME CB' },
    { id: 'tnl_routage', nom: 'TNL ROUTAGE' },
    { id: 'atelier_gambetta', nom: 'ATELIER GAMBETTA' },
    { id: 'l_imprime', nom: "L'IMPRIME" },
    { id: 'aci', nom: 'ACI' },
    { id: 'jf_impression', nom: 'JF IMPRESSION' },
    { id: 'mordacq', nom: 'MORDACQ' },
    { id: 'prenant', nom: 'PRENANT' },
    { id: 'rdsl', nom: 'RDSL' },
    { id: 'bfi_enveloppes', nom: 'BFI ENVELOPPES' },
    { id: 'roto_armor', nom: 'ROTO ARMOR' },
    { id: 'print_europe', nom: 'PRINT EUROPE' },
    { id: 'bignon_sa', nom: 'BIGNON SA' },
    { id: 'ets_jacques', nom: 'ETS JACQUES' },
    { id: 'adm', nom: 'ADM' },
    { id: 'empreinte_oceane', nom: 'EMPREINTE OCEANE' },
    { id: 'atelier_duplan', nom: 'ATELIER DUPLAN' },
  ],
  default_marge_pct: 30,
  frais_fixes_ht: 15,
  bat_prix_ht: 20,
  tva_pct: 20,
  degressif: [
    { seuil_achat_ht: 500, remise_pct: 2 },
    { seuil_achat_ht: 2000, remise_pct: 5 },
    { seuil_achat_ht: 10000, remise_pct: 8 },
  ],
};
