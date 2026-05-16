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

export interface ClientBase {
  id: string;
  type: ClientType;
  email: string;
  telephone?: string;
  adresse_facturation?: Adresse;
  adresses_livraison: Adresse[];
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
  contact_prenom?: string;
  contact_nom?: string;
}

export type Client = ClientB2C | ClientB2B;

// ============================================================
// HELPERS
// ============================================================

/** Nom affichable du client (nom complet B2C ou raison sociale B2B). */
export function clientLabel(c: Client): string {
  if (c.type === 'b2c') {
    return `${c.prenom} ${c.nom}`.trim() || c.email;
  }
  const main = c.raison_sociale.trim() || c.email;
  const contact =
    c.contact_prenom || c.contact_nom
      ? ` — ${(c.contact_prenom ?? '').trim()} ${(c.contact_nom ?? '').trim()}`.replace(
          /\s+/g,
          ' '
        )
      : '';
  return `${main}${contact}`;
}

/** Badge type (B2C / B2B) avec couleur. */
export function clientTypeBadge(type: ClientType): { label: string; className: string } {
  return type === 'b2c'
    ? { label: 'B2C', className: 'bg-secondary text-secondary-foreground' }
    : { label: 'B2B', className: 'bg-primary/10 text-primary border border-primary/30' };
}

/** Génère un nouvel ID client unique. */
export function newClientId(): string {
  return `client_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
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
    created_at: now,
    updated_at: now,
  };
}

// ============================================================
// HOOK
// ============================================================

/** Hook collections clients : lecture + CRUD. */
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
