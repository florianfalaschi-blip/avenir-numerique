-- ============================================================================
-- Avenir Numérique — Bucket Storage pour les PDF archivés
-- ============================================================================
-- À exécuter dans Supabase Dashboard → SQL Editor → New query.
-- Idempotent : peut être ré-exécuté sans dommage.
--
-- Bucket privé `pdf-archives` :
--   - Stocke les snapshots PDF générés depuis les pages d'impression devis/
--     factures (figés à un moment donné — utiles pour archivage légal)
--   - 10 MB max par fichier
--   - Accès via signed URL uniquement (authentifié)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'pdf-archives',
    'pdf-archives',
    false,  -- privé
    10 * 1024 * 1024,  -- 10 MB max
    ARRAY['application/pdf']
  )
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "authenticated full access pdf-archives"
  ON storage.objects;
CREATE POLICY "authenticated full access pdf-archives"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'pdf-archives')
  WITH CHECK (bucket_id = 'pdf-archives');

-- ✅ Bucket prêt.
