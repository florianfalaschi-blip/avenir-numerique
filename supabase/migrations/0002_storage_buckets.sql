-- ============================================================================
-- Avenir Numérique — Buckets Supabase Storage
-- ============================================================================
-- À exécuter dans Supabase Dashboard → SQL Editor → New query.
-- Idempotent — peut être ré-exécuté sans dommage.
--
-- 2 buckets créés :
--   1. entreprise-logos  → public (lecture libre — logos affichés dans PDF)
--   2. client-documents  → privé (RIB / KBIS / attestations TVA)
--
-- Politique RLS : tout utilisateur authentifié peut tout faire (single-user MVP,
-- cohérent avec les autres tables). Les liens publics du bucket logos restent
-- accessibles sans auth pour permettre l'affichage dans les PDF imprimés.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Création des buckets (idempotent via ON CONFLICT)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'entreprise-logos',
    'entreprise-logos',
    true,  -- public read
    5 * 1024 * 1024,  -- 5 MB max
    ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
  ),
  (
    'client-documents',
    'client-documents',
    false,  -- accès via signed URL uniquement
    20 * 1024 * 1024,  -- 20 MB max (PDFs RIB/KBIS peuvent être lourds)
    ARRAY[
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
  )
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 2. RLS policies sur storage.objects
-- ---------------------------------------------------------------------------

-- ENTREPRISE LOGOS : authentifié peut tout faire (read/write/delete)
DROP POLICY IF EXISTS "authenticated full access entreprise-logos"
  ON storage.objects;
CREATE POLICY "authenticated full access entreprise-logos"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'entreprise-logos')
  WITH CHECK (bucket_id = 'entreprise-logos');

-- ENTREPRISE LOGOS : lecture publique (pour affichage PDF / sans auth)
DROP POLICY IF EXISTS "public read entreprise-logos"
  ON storage.objects;
CREATE POLICY "public read entreprise-logos"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'entreprise-logos');

-- CLIENT DOCUMENTS : authentifié seulement (privé)
DROP POLICY IF EXISTS "authenticated full access client-documents"
  ON storage.objects;
CREATE POLICY "authenticated full access client-documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'client-documents')
  WITH CHECK (bucket_id = 'client-documents');

-- ---------------------------------------------------------------------------
-- ✅ Storage prêt.
--    - entreprise-logos : 5 MB / image (png/jpg/svg/webp), public read
--    - client-documents : 20 MB / fichier (pdf/image/docx), authentifié only
-- ---------------------------------------------------------------------------
