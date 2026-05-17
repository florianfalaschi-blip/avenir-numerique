'use client';

/**
 * Helpers Supabase Storage.
 *
 * 2 buckets :
 * - `entreprise-logos` (public read, 5 MB max images)
 * - `client-documents` (privé via signed URL, 20 MB max pdf/img/docx)
 *
 * API :
 * - uploadFile(bucket, file, options?) : upload + retourne path + URL utile
 * - deleteFile(bucket, path) : supprime du bucket
 * - getSignedUrl(bucket, path, expiresIn?) : URL temporaire pour bucket privé
 * - getPublicUrl(bucket, path) : URL stable pour bucket public
 */

import { getSupabase } from './supabase';

export type BucketName = 'entreprise-logos' | 'client-documents';

export interface UploadResult {
  /** Chemin dans le bucket (sert à supprimer / signer plus tard). */
  path: string;
  /** URL utilisable pour afficher le fichier (publique ou signée selon bucket). */
  url: string;
  /** Nom de fichier original (info, pas utilisé pour le storage). */
  originalName: string;
  /** Taille en octets. */
  size: number;
  /** MIME type. */
  type: string;
}

/**
 * Génère un nom de fichier unique au format `<prefix>_<timestamp>_<rand>.<ext>`.
 * Préserve l'extension d'origine pour que les navigateurs reconnaissent le type.
 */
function generateFileName(originalName: string, prefix?: string): string {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'bin';
  const rand = Math.random().toString(36).slice(2, 8);
  const ts = Date.now();
  const pfx = prefix ? `${prefix}_` : '';
  return `${pfx}${ts}_${rand}.${ext}`;
}

/**
 * Upload un fichier dans un bucket. Retourne le path + une URL utilisable.
 * - Bucket public (entreprise-logos) → URL publique stable
 * - Bucket privé (client-documents) → URL signée 1h (à régénérer ensuite)
 *
 * `options.path` permet d'utiliser un nom personnalisé (utile pour upsert).
 * `options.prefix` ajoute un préfixe au nom auto-généré (ex: clientId).
 */
export async function uploadFile(
  bucket: BucketName,
  file: File,
  options: { path?: string; prefix?: string; upsert?: boolean } = {}
): Promise<UploadResult> {
  const path = options.path ?? generateFileName(file.name, options.prefix);

  const { error } = await getSupabase().storage.from(bucket).upload(path, file, {
    upsert: options.upsert ?? false,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(`Upload échoué (${bucket}/${path}) : ${error.message}`);
  }

  // Récupère URL selon le type de bucket
  let url: string;
  if (bucket === 'entreprise-logos') {
    url = getPublicUrl(bucket, path);
  } else {
    url = await getSignedUrl(bucket, path, 3600);
  }

  return {
    path,
    url,
    originalName: file.name,
    size: file.size,
    type: file.type,
  };
}

/**
 * Supprime un fichier du bucket. No-op si déjà absent.
 */
export async function deleteFile(bucket: BucketName, path: string): Promise<void> {
  const { error } = await getSupabase().storage.from(bucket).remove([path]);
  if (error) {
    console.error(`[storage] delete failed (${bucket}/${path}):`, error.message);
    throw new Error(`Suppression échouée : ${error.message}`);
  }
}

/**
 * URL publique stable d'un fichier dans un bucket public.
 * (Utilisable directement dans <img src=... /> sans auth.)
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const { data } = getSupabase().storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Génère une URL signée temporaire pour un fichier dans un bucket privé.
 * Expire après `expiresInSeconds` (défaut : 1 heure).
 *
 * Pour afficher ou télécharger un document client, appeler cette fonction
 * juste avant l'usage pour s'assurer que l'URL est encore valide.
 */
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { data, error } = await getSupabase()
    .storage.from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) {
    throw new Error(`Signed URL échouée (${bucket}/${path}) : ${error?.message}`);
  }
  return data.signedUrl;
}

/**
 * Format human-readable d'une taille de fichier en octets.
 * Ex: 1024 → "1.0 KB", 5_242_880 → "5.0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
