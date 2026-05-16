-- =====================================================
-- Migration 001 — Socle multi-tenant Avenir Numérique
-- =====================================================
-- Exécuter dans Supabase Studio > SQL Editor
-- ou via : supabase db push

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENTITÉS JURIDIQUES
-- =====================================================
CREATE TABLE entities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raison_sociale TEXT NOT NULL,
  siret       VARCHAR(14) NOT NULL UNIQUE,
  tva_intra   VARCHAR(20),
  adresse     TEXT NOT NULL,
  code_postal VARCHAR(5) NOT NULL,
  ville       TEXT NOT NULL,
  prefixe_facture VARCHAR(10) NOT NULL, -- ex: 'AN', 'EN'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TENANTS (MARQUES)
-- =====================================================
CREATE TABLE tenants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                VARCHAR(100) NOT NULL UNIQUE, -- ex: 'avenir-numerique'
  nom                 TEXT NOT NULL,
  domaine             TEXT NOT NULL,                -- ex: 'imprim-eco.fr'
  entity_id           UUID NOT NULL REFERENCES entities(id),
  logo_url            TEXT,
  couleur_primaire    VARCHAR(7) NOT NULL DEFAULT '#000000',
  couleur_secondaire  VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  actif               BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- PROFILS UTILISATEURS (extension de auth.users)
-- =====================================================
CREATE TYPE role_utilisateur AS ENUM (
  'admin', 'commercial', 'operateur_prod', 'faconneur',
  'expedition', 'compta', 'client_b2c', 'client_b2b'
);

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   UUID REFERENCES tenants(id),  -- NULL = utilisateur interne Avenir
  role        role_utilisateur NOT NULL DEFAULT 'client_b2c',
  nom         TEXT NOT NULL,
  prenom      TEXT NOT NULL,
  email       TEXT NOT NULL,
  actif       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- CLIENTS
-- =====================================================
CREATE TABLE clients (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id),
  profile_id              UUID NOT NULL REFERENCES profiles(id),
  type                    VARCHAR(3) NOT NULL CHECK (type IN ('b2c', 'b2b')),
  raison_sociale          TEXT,
  siret                   VARCHAR(14),
  tva_intra               VARCHAR(20),
  statut_validation       VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (statut_validation IN ('pending', 'active', 'rejected')),
  remise_specifique_pct   DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- STATUTS DE COMMANDE
-- =====================================================
CREATE TYPE statut_commande AS ENUM (
  'attente_paiement',
  'fichiers_attente',
  'bat_attente',
  'bat_valide',
  'en_production',
  'expedie',
  'livre',
  'annule'
);

-- =====================================================
-- COMMANDES
-- =====================================================
CREATE TABLE commandes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id),
  entity_id               UUID NOT NULL REFERENCES entities(id),
  client_id               UUID NOT NULL REFERENCES clients(id),
  numero                  TEXT NOT NULL,           -- Numéro formaté par entité
  statut                  statut_commande NOT NULL DEFAULT 'attente_paiement',
  montant_ht              DECIMAL(10,2) NOT NULL,
  montant_tva             DECIMAL(10,2) NOT NULL,
  montant_ttc             DECIMAL(10,2) NOT NULL,
  mode_paiement           VARCHAR(20) NOT NULL
                            CHECK (mode_paiement IN ('cb', 'virement', 'paypal', 'cheque', '30j_fin_mois')),
  statut_paiement         VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                            CHECK (statut_paiement IN ('en_attente', 'recu', 'rembourse')),
  workflow_etapes         JSONB NOT NULL DEFAULT '[]',  -- Étapes dynamiques par produit
  options                 JSONB NOT NULL DEFAULT '{}',  -- BAT, livraison neutre...
  date_livraison_estimee  DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- DEVIS
-- =====================================================
CREATE TABLE devis (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id),
  entity_id             UUID NOT NULL REFERENCES entities(id),
  client_id             UUID REFERENCES clients(id),
  commercial_id         UUID NOT NULL REFERENCES profiles(id),
  numero                TEXT NOT NULL,
  statut                VARCHAR(20) NOT NULL DEFAULT 'brouillon'
                          CHECK (statut IN ('brouillon', 'envoye', 'accepte', 'refuse', 'expire')),
  famille_calculateur   VARCHAR(20) NOT NULL
                          CHECK (famille_calculateur IN ('rollup', 'plaques', 'flyers', 'bobines', 'brochures', 'sur_mesure')),
  configuration         JSONB NOT NULL DEFAULT '{}',   -- Input calculateur
  resultat_calcul       JSONB NOT NULL DEFAULT '{}',   -- Snapshot output calculateur
  montant_ht            DECIMAL(10,2) NOT NULL,
  montant_ttc           DECIMAL(10,2) NOT NULL,
  valable_jusqu_au      DATE,
  pdf_url               TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- PRODUCTION — BDD Machines
-- =====================================================
CREATE TABLE machines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom           TEXT NOT NULL,
  type          VARCHAR(20) NOT NULL
                  CHECK (type IN ('impression', 'decoupe', 'faconnage', 'finition')),
  taux_horaire_ht DECIMAL(8,2) NOT NULL,
  specifications  JSONB NOT NULL DEFAULT '{}',  -- Vitesse, format max, gâches...
  actif         BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- PRODUCTION — BDD Papiers
-- =====================================================
CREATE TABLE papiers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom               TEXT NOT NULL,
  grammage          INTEGER NOT NULL,
  compatible_techno TEXT[] NOT NULL DEFAULT '{}', -- ['offset', 'numerique']
  formats           JSONB NOT NULL DEFAULT '[]',  -- [{largeur_mm, hauteur_mm, prixHT}]
  actif             BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- PRODUCTION — BDD Finitions
-- =====================================================
CREATE TABLE finitions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom             TEXT NOT NULL,
  applicable_to   TEXT[] NOT NULL DEFAULT '{}', -- familles de produits
  type            VARCHAR(20) NOT NULL
                    CHECK (type IN ('forfait', 'unitaire', 'm2', 'par_oeillet', 'par_face')),
  prix_ht         DECIMAL(8,2) NOT NULL,
  sous_traite     BOOLEAN NOT NULL DEFAULT false,
  sous_traitant_id UUID,
  actif           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEX
-- =====================================================
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_commandes_tenant ON commandes(tenant_id);
CREATE INDEX idx_commandes_statut ON commandes(statut);
CREATE INDEX idx_devis_tenant ON devis(tenant_id);
CREATE INDEX idx_devis_statut ON devis(statut);
CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Les clients ne voient que les données de leur tenant
CREATE POLICY "clients_tenant_isolation" ON clients
  FOR ALL USING (
    tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "commandes_tenant_isolation" ON commandes
  FOR ALL USING (
    tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR
    -- Les utilisateurs internes (tenant_id NULL) voient tout
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND tenant_id IS NULL)
  );

CREATE POLICY "devis_tenant_isolation" ON devis
  FOR ALL USING (
    tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND tenant_id IS NULL)
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER commandes_updated_at
  BEFORE UPDATE ON commandes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER devis_updated_at
  BEFORE UPDATE ON devis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
