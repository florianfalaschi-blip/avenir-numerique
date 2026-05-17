'use client';

import { useRef, useState } from 'react';
import { Button } from '@avenir/ui';
import { uploadFile, type BucketName, type UploadResult } from '@/lib/storage';

/**
 * Bouton "Choisir un fichier" qui upload immédiatement dans Supabase Storage.
 *
 * Usage :
 *   <FileUploadButton
 *     bucket="entreprise-logos"
 *     accept="image/*"
 *     prefix="logo"
 *     onUploaded={(r) => updateLogo(r.url, r.path)}
 *   />
 *
 * - Désactivé pendant l'upload (affiche "Envoi…")
 * - Affiche les erreurs sous le bouton
 * - Reset l'input après chaque upload pour permettre re-upload du même fichier
 */
export function FileUploadButton({
  bucket,
  accept,
  prefix,
  label = '📎 Choisir un fichier',
  uploadingLabel = '⏳ Envoi…',
  variant = 'outline',
  size = 'sm',
  className,
  multiple = false,
  upsert = false,
  onUploaded,
  onError,
}: {
  bucket: BucketName;
  /** Filtre MIME pour le sélecteur de fichier (ex. "image/*", "application/pdf,image/*"). */
  accept?: string;
  /** Préfixe dans le nom auto-généré (ex: clientId, "logo"). */
  prefix?: string;
  label?: string;
  uploadingLabel?: string;
  variant?: 'outline' | 'accent' | 'default' | 'ghost';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  className?: string;
  /** Si true, permet de sélectionner plusieurs fichiers d'un coup. */
  multiple?: boolean;
  /** Si true, écrase le fichier existant au même chemin (utile pour logo). */
  upsert?: boolean;
  /** Callback appelé pour chaque fichier uploadé. */
  onUploaded: (result: UploadResult) => void;
  /** Callback en cas d'erreur (sinon affichage local). */
  onError?: (error: Error) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClick = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      for (const file of files) {
        const result = await uploadFile(bucket, file, { prefix, upsert });
        onUploaded(result);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur upload';
      setErrorMsg(msg);
      if (onError) onError(err instanceof Error ? err : new Error(msg));
    } finally {
      setUploading(false);
      // Reset input pour permettre re-upload du même fichier
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <Button
        variant={variant}
        size={size}
        type="button"
        onClick={handleClick}
        disabled={uploading}
      >
        {uploading ? uploadingLabel : label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      {errorMsg && (
        <p className="mt-1.5 text-[11px] text-destructive">⚠️ {errorMsg}</p>
      )}
    </div>
  );
}
