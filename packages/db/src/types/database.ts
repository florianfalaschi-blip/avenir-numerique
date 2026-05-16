/**
 * Types Supabase — Avenir Numérique
 *
 * Ce fichier sera régénéré automatiquement par :
 *   npm run generate-types (dans packages/db)
 *
 * Il contient les types TypeScript correspondant au schéma PostgreSQL.
 * Ne pas modifier manuellement — sera écrasé à chaque regénération.
 *
 * Architecture multi-tenant :
 *   - tenant_id  → identifie la MARQUE (ex: avenir-numerique, imprim-eco)
 *   - entity_id  → identifie l'ENTITÉ JURIDIQUE (Entité A, Entité B)
 *   - RLS Supabase filtre automatiquement par tenant_id selon l'utilisateur connecté
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =============================================
// TYPES PRINCIPAUX (à compléter après init Supabase)
// =============================================

export interface Database {
  public: {
    Tables: {
      // --- MULTI-TENANT ---
      tenants: {
        Row: {
          id: string
          slug: string
          nom: string
          domaine: string
          entity_id: string
          logo_url: string | null
          couleur_primaire: string
          couleur_secondaire: string
          actif: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }

      entities: {
        Row: {
          id: string
          raison_sociale: string
          siret: string
          tva_intra: string | null
          adresse: string
          code_postal: string
          ville: string
          prefixe_facture: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['entities']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['entities']['Insert']>
      }

      // --- UTILISATEURS ---
      profiles: {
        Row: {
          id: string           // = auth.users.id
          tenant_id: string | null  // null = utilisateur interne Avenir
          role: 'admin' | 'commercial' | 'operateur_prod' | 'faconneur' | 'expedition' | 'compta' | 'client_b2c' | 'client_b2b'
          nom: string
          prenom: string
          email: string
          actif: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }

      // --- CLIENTS ---
      clients: {
        Row: {
          id: string
          tenant_id: string
          profile_id: string
          type: 'b2c' | 'b2b'
          raison_sociale: string | null
          siret: string | null
          tva_intra: string | null
          statut_validation: 'pending' | 'active' | 'rejected'
          remise_specifique_pct: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }

      // --- COMMANDES ---
      commandes: {
        Row: {
          id: string
          tenant_id: string
          entity_id: string
          client_id: string
          numero: string
          statut: 'attente_paiement' | 'fichiers_attente' | 'bat_attente' | 'bat_valide' | 'en_production' | 'expedie' | 'livre' | 'annule'
          montant_ht: number
          montant_tva: number
          montant_ttc: number
          mode_paiement: 'cb' | 'virement' | 'paypal' | 'cheque' | '30j_fin_mois'
          statut_paiement: 'en_attente' | 'recu' | 'rembourse'
          workflow_etapes: Json    // JSONB — étapes personnalisées par type produit
          options: Json            // BAT, livraison neutre, fractionnement...
          date_livraison_estimee: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['commandes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['commandes']['Insert']>
      }

      // --- DEVIS ---
      devis: {
        Row: {
          id: string
          tenant_id: string
          entity_id: string
          client_id: string | null
          commercial_id: string
          numero: string
          statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire'
          famille_calculateur: 'rollup' | 'plaques' | 'flyers' | 'bobines' | 'brochures' | 'sur_mesure'
          configuration: Json      // Input calculateur
          resultat_calcul: Json    // Output calculateur (snapshot)
          montant_ht: number
          montant_ttc: number
          valable_jusqu_au: string | null
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['devis']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['devis']['Insert']>
      }

      // --- PRODUCTION ---
      machines: {
        Row: {
          id: string
          nom: string
          type: 'impression' | 'decoupe' | 'faconnage' | 'finition'
          taux_horaire_ht: number
          specifications: Json
          actif: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['machines']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['machines']['Insert']>
      }

      papiers: {
        Row: {
          id: string
          nom: string
          grammage: number
          compatible_techno: ('offset' | 'numerique')[]
          formats: Json
          actif: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['papiers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['papiers']['Insert']>
      }

      finitions: {
        Row: {
          id: string
          nom: string
          applicable_to: ('rollup' | 'plaques' | 'flyers' | 'bobines' | 'brochures')[]
          type: 'forfait' | 'unitaire' | 'm2' | 'par_oeillet' | 'par_face'
          prix_ht: number
          sous_traite: boolean
          sous_traitant_id: string | null
          actif: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['finitions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['finitions']['Insert']>
      }

      // Les autres tables seront ajoutées au fur et à mesure des migrations
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      statut_commande: 'attente_paiement' | 'fichiers_attente' | 'bat_attente' | 'bat_valide' | 'en_production' | 'expedie' | 'livre' | 'annule'
      role_utilisateur: 'admin' | 'commercial' | 'operateur_prod' | 'faconneur' | 'expedition' | 'compta' | 'client_b2c' | 'client_b2b'
    }
  }
}
