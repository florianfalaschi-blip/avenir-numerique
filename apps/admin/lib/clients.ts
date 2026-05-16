'use client';

import { useSettings } from './settings';

// ============================================================
// TYPES
// ============================================================

export type ClientType = 'b2c' | 'b2b';

export interface Adresse {
  ligne1: string;
  ligne2?: string;
  cp: string;
  ville: string;
  pays?: string;
}

/**
 * Contact rattaché à un client (souvent multiple pour les B2B :
 * directeur achats, comptabilité, contact production, etc.).
 */
export interface Contact {
  id: string;
  prenom: string;
  nom: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  mobile?: string;
  notes?: string;
  /** Si true, c'est le contact principal du client (un seul par client). */
  est_principal?: boolean;
}

/** Délai de paiement standard. */
export type DelaiPaiement =
  | 'comptant'
  | '30j'
  | '30j_fin_mois'
  | '45j'
  | '45j_fin_mois'
  | '60j'
  | '60j_fin_mois'
  | 'autre';

export const DELAIS_PAIEMENT: { value: DelaiPaiement; label: string }[] = [
  { value: 'comptant', label: 'Comptant (à la commande)' },
  { value: '30j', label: '30 jours date de facture' },
  { value: '30j_fin_mois', label: '30 jours fin de mois' },
  { value: '45j', label: '45 jours date de facture' },
  { value: '45j_fin_mois', label: '45 jours fin de mois' },
  { value: '60j', label: '60 jours date de facture' },
  { value: '60j_fin_mois', label: '60 jours fin de mois' },
  { value: 'autre', label: 'Autre (préciser)' },
];

/** Mode de paiement préféré. */
export type ModePaiement = 'cb' | 'virement' | 'prelevement' | 'cheque' | 'paypal' | 'especes';

export const MODES_PAIEMENT: { value: ModePaiement; label: string }[] = [
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'cb', label: 'Carte bancaire' },
  { value: 'prelevement', label: 'Prélèvement SEPA' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'especes', label: 'Espèces' },
];

/**
 * Document attaché à un client (RIB, KBIS, attestation TVA, etc.).
 * Phase 3a : on stocke un nom + URL externe (Drive, Dropbox) ou
 * juste une note de référence. Phase 3b (Supabase) : upload réel via
 * Supabase Storage.
 */
export interface ClientDocument {
  id: string;
  nom: string;
  /** Type libre (ex. 'RIB', 'KBIS', 'Attestation TVA'…). */
  type?: string;
  /** URL externe vers le document (Drive/Dropbox/etc.). */
  url?: string;
  /** Si pas d'URL, juste une note (ex. "Reçu par mail le 15/05"). */
  notes?: string;
  ajoute_le: number;
}

export interface ClientBase {
  id: string;
  type: ClientType;
  email: string;
  telephone?: string;
  adresse_facturation?: Adresse;
  adresses_livraison: Adresse[];

  /** Contacts associés (souvent multiple pour les B2B). */
  contacts: Contact[];

  // === Conditions commerciales ===
  delai_paiement?: DelaiPaiement;
  /** Texte libre si delai_paiement = 'autre'. */
  delai_paiement_autre?: string;
  mode_paiement_prefere?: ModePaiement;
  /** Remise habituelle à appliquer aux devis de ce client (%). */
  remise_habituelle_pct?: number;

  // === Suivi commercial ===
  commercial_assigne?: string;
  /** Référence client interne (numéro ERP / code compta…). */
  reference_interne?: string;
  /** Tags libres pour filtrage rapide (ex. 'VIP', 'partenaire', 'prospect'…). */
  tags: string[];
  /** Timestamp Unix ms — date du premier contact / création de la relation. */
  date_premier_contact?: number;
  /** Compte comptable (pour exports Pennylane / Sage). */
  compte_comptable?: string;

  documents: ClientDocument[];

  notes?: string;
  created_at: number;
  updated_at: number;
}

export interface ClientB2C extends ClientBase {
  type: 'b2c';
  prenom: string;
  nom: string;
}

export interface ClientB2B extends ClientBase {
  type: 'b2b';
  raison_sociale: string;
  siret?: string;
  tva_intra?: string;
}

export type Client = ClientB2C | ClientB2B;

// ============================================================
// HELPERS
// ============================================================

export function clientLabel(c: Client): string {
  if (c.type === 'b2c') {
    return `${c.prenom} ${c.nom}`.trim() || c.email;
  }
  return c.raison_sociale.trim() || c.email;
}

export function clientTypeBadge(type: ClientType): { label: string; className: string } {
  return type === 'b2c'
    ? { label: 'B2C', className: 'bg-secondary text-secondary-foreground' }
    : { label: 'B2B', className: 'bg-primary/10 text-primary border border-primary/30' };
}

/** Renvoie le label utilisateur d'un délai de paiement. */
export function delaiPaiementLabel(d?: DelaiPaiement, autreText?: string): string {
  if (!d) return '—';
  if (d === 'autre') return autreText || 'Autre';
  return DELAIS_PAIEMENT.find((dp) => dp.value === d)?.label ?? d;
}

/** Renvoie le label utilisateur d'un mode de paiement. */
export function modePaiementLabel(m?: ModePaiement): string {
  if (!m) return '—';
  return MODES_PAIEMENT.find((mp) => mp.value === m)?.label ?? m;
}

/** Renvoie le contact principal (ou le premier, ou undefined). */
export function principalContact(c: Client): Contact | undefined {
  if (c.contacts.length === 0) return undefined;
  return c.contacts.find((co) => co.est_principal) ?? c.contacts[0];
}

/** Génère un nouvel ID. */
export function newClientId(): string {
  return `client_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export function newContactId(): string {
  return `contact_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export function newDocumentId(): string {
  return `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/** Construit un client vide B2C. */
export function emptyClientB2C(): ClientB2C {
  const now = Date.now();
  return {
    id: newClientId(),
    type: 'b2c',
    prenom: '',
    nom: '',
    email: '',
    adresses_livraison: [],
    contacts: [],
    tags: [],
    documents: [],
    created_at: now,
    updated_at: now,
  };
}

/** Construit un client vide B2B. */
export function emptyClientB2B(): ClientB2B {
  const now = Date.now();
  return {
    id: newClientId(),
    type: 'b2b',
    raison_sociale: '',
    email: '',
    adresses_livraison: [],
    contacts: [],
    tags: [],
    documents: [],
    created_at: now,
    updated_at: now,
  };
}

/** Construit un Contact vide. */
export function emptyContact(): Contact {
  return {
    id: newContactId(),
    prenom: '',
    nom: '',
  };
}

// ============================================================
// HOOK
// ============================================================

export function useClients() {
  const { value, update, reset, hydrated } = useSettings<Client[]>('data.clients', []);

  const addClient = (client: Client) => {
    update([...value, { ...client, updated_at: Date.now() }]);
  };

  const updateClient = (id: string, changes: Partial<Client>) => {
    update(
      value.map((c) =>
        c.id === id ? ({ ...c, ...changes, updated_at: Date.now() } as Client) : c
      )
    );
  };

  const deleteClient = (id: string) => {
    update(value.filter((c) => c.id !== id));
  };

  const getClient = (id: string): Client | undefined => value.find((c) => c.id === id);

  return {
    clients: value,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    resetAll: reset,
    hydrated,
  };
}
