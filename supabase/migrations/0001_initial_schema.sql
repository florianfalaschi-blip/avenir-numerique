-- ============================================================================
-- Avenir Numérique — Schéma initial
-- ============================================================================
-- À exécuter dans Supabase Dashboard → SQL Editor → New query
-- (copie/colle ce fichier entier puis "Run").
--
-- Architecture : pour faciliter la migration depuis localStorage et limiter
-- les jointures, on stocke les détails métier en JSONB. Les champs critiques
-- (id, numero, statut, prix, dates) sont dénormalisés pour les index et tri.
--
-- Toutes les tables ont :
--   - RLS activé (sécurité par défaut)
--   - Une policy unique "authenticated full access" : tout utilisateur connecté
--     peut lire/écrire (single-user MVP — sera affiné en multi-user)
--   - Un trigger updated_at qui se met à jour automatiquement à chaque UPDATE
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper : trigger updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 1. entreprise (1 seule ligne, config légale + bancaire affichée sur PDF)
-- ---------------------------------------------------------------------------
CREATE TABLE public.entreprise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER entreprise_updated_at
  BEFORE UPDATE ON public.entreprise
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.entreprise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access entreprise"
  ON public.entreprise FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 2. app_settings (key-value pour paramètres calc + catalogues partagés)
-- ---------------------------------------------------------------------------
-- Exemples de clés :
--   - 'rollup'             → params calculateur Roll-up
--   - 'plaques'            → params calculateur Plaques
--   - 'flyers' / 'bobines' / 'brochures'
--   - 'shared.papiers'     → catalogue partagé papiers
-- ---------------------------------------------------------------------------
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access app_settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 3. clients (carnet d'adresses + conditions + tags + documents en JSONB)
-- ---------------------------------------------------------------------------
CREATE TABLE public.clients (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access clients"
  ON public.clients FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 4. devis (avec colonnes dénormalisées pour requêtes/tri rapides)
-- ---------------------------------------------------------------------------
CREATE TABLE public.devis (
  id text PRIMARY KEY,
  numero text NOT NULL UNIQUE,
  client_id text REFERENCES public.clients(id) ON DELETE SET NULL,
  data jsonb NOT NULL,
  prix_ht numeric(12, 2) NOT NULL DEFAULT 0,
  prix_ttc numeric(12, 2) NOT NULL DEFAULT 0,
  statut text NOT NULL DEFAULT 'brouillon',
  date_creation timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX devis_statut_idx ON public.devis(statut);
CREATE INDEX devis_client_id_idx ON public.devis(client_id);
CREATE INDEX devis_date_creation_idx ON public.devis(date_creation DESC);

CREATE TRIGGER devis_updated_at
  BEFORE UPDATE ON public.devis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access devis"
  ON public.devis FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 5. commandes (workflow étapes en JSONB dans data.etapes)
-- ---------------------------------------------------------------------------
CREATE TABLE public.commandes (
  id text PRIMARY KEY,
  numero text NOT NULL UNIQUE,
  devis_id text REFERENCES public.devis(id) ON DELETE SET NULL,
  client_id text REFERENCES public.clients(id) ON DELETE SET NULL,
  data jsonb NOT NULL,
  prix_ht numeric(12, 2) NOT NULL DEFAULT 0,
  statut text NOT NULL DEFAULT 'en_preparation',
  date_creation timestamptz NOT NULL,
  date_livraison_prevue timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX commandes_statut_idx ON public.commandes(statut);
CREATE INDEX commandes_client_id_idx ON public.commandes(client_id);
CREATE INDEX commandes_devis_id_idx ON public.commandes(devis_id);

CREATE TRIGGER commandes_updated_at
  BEFORE UPDATE ON public.commandes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access commandes"
  ON public.commandes FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 6. factures (paiements en JSONB dans data.paiements)
-- ---------------------------------------------------------------------------
CREATE TABLE public.factures (
  id text PRIMARY KEY,
  numero text NOT NULL UNIQUE,
  commande_id text REFERENCES public.commandes(id) ON DELETE SET NULL,
  client_id text REFERENCES public.clients(id) ON DELETE SET NULL,
  data jsonb NOT NULL,
  montant_ht numeric(12, 2) NOT NULL DEFAULT 0,
  montant_ttc numeric(12, 2) NOT NULL DEFAULT 0,
  statut text NOT NULL DEFAULT 'brouillon',
  date_creation timestamptz NOT NULL,
  date_emission timestamptz,
  date_echeance timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX factures_statut_idx ON public.factures(statut);
CREATE INDEX factures_client_id_idx ON public.factures(client_id);
CREATE INDEX factures_commande_id_idx ON public.factures(commande_id);
CREATE INDEX factures_date_echeance_idx ON public.factures(date_echeance);

CREATE TRIGGER factures_updated_at
  BEFORE UPDATE ON public.factures
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access factures"
  ON public.factures FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- ✅ Schéma prêt. Toutes les tables ont RLS + policy "authenticated".
--    Crée maintenant un utilisateur dans Authentication → Add user → Create
--    new user (email + password). Cet utilisateur pourra se connecter à l'app.
-- ---------------------------------------------------------------------------
