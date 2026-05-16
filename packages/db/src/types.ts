/**
 * Types de la base de données Avenir Numérique.
 *
 * Architecture : pour simplifier la migration depuis localStorage, on stocke
 * la majorité des données métier (clients, devis, etc.) sous forme JSONB
 * dans une colonne `data`. Les champs critiques (id, numero, statut, prix,
 * dates) sont dénormalisés en colonnes typées pour les requêtes / index /
 * tri rapide.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      entreprise: {
        Row: {
          id: string;
          data: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          data: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          data?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      app_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          data?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      devis: {
        Row: {
          id: string;
          numero: string;
          client_id: string | null;
          data: Json;
          prix_ht: number;
          prix_ttc: number;
          statut: string;
          date_creation: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          numero: string;
          client_id?: string | null;
          data: Json;
          prix_ht: number;
          prix_ttc: number;
          statut: string;
          date_creation: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          numero?: string;
          client_id?: string | null;
          data?: Json;
          prix_ht?: number;
          prix_ttc?: number;
          statut?: string;
          date_creation?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'devis_client_id_fkey';
            columns: ['client_id'];
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
        ];
      };
      commandes: {
        Row: {
          id: string;
          numero: string;
          devis_id: string | null;
          client_id: string | null;
          data: Json;
          prix_ht: number;
          statut: string;
          date_creation: string;
          date_livraison_prevue: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          numero: string;
          devis_id?: string | null;
          client_id?: string | null;
          data: Json;
          prix_ht: number;
          statut: string;
          date_creation: string;
          date_livraison_prevue?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          numero?: string;
          devis_id?: string | null;
          client_id?: string | null;
          data?: Json;
          prix_ht?: number;
          statut?: string;
          date_creation?: string;
          date_livraison_prevue?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      factures: {
        Row: {
          id: string;
          numero: string;
          commande_id: string | null;
          client_id: string | null;
          data: Json;
          montant_ht: number;
          montant_ttc: number;
          statut: string;
          date_creation: string;
          date_emission: string | null;
          date_echeance: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          numero: string;
          commande_id?: string | null;
          client_id?: string | null;
          data: Json;
          montant_ht: number;
          montant_ttc: number;
          statut: string;
          date_creation: string;
          date_emission?: string | null;
          date_echeance?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          numero?: string;
          commande_id?: string | null;
          client_id?: string | null;
          data?: Json;
          montant_ht?: number;
          montant_ttc?: number;
          statut?: string;
          date_creation?: string;
          date_emission?: string | null;
          date_echeance?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
