'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field } from '../../calculateurs/_shared/components';
import { fmtModifiedAt } from '../../calculateurs/_shared/format';
import { newDocumentId, type ClientDocument } from '@/lib/clients';
import {
  deleteFile,
  formatFileSize,
  getSignedUrl,
  type UploadResult,
} from '@/lib/storage';
import { FileUploadButton } from '@/app/_components/file-upload-button';

export function DocumentsEditor({
  clientId,
  value,
  onChange,
}: {
  /** ID du client (sert de préfixe au nom de fichier dans Storage). */
  clientId: string;
  value: ClientDocument[];
  onChange: (next: ClientDocument[]) => void;
}) {
  const update = (i: number, changes: Partial<ClientDocument>) => {
    const next = [...value];
    next[i] = { ...next[i]!, ...changes };
    onChange(next);
  };

  const add = () =>
    onChange([
      ...value,
      {
        id: newDocumentId(),
        nom: '',
        ajoute_le: Date.now(),
      },
    ]);

  const addFromUpload = (r: UploadResult) =>
    onChange([
      ...value,
      {
        id: newDocumentId(),
        nom: r.originalName.replace(/\.[^/.]+$/, ''), // sans extension
        url: r.url,
        storage_path: r.path,
        filename: r.originalName,
        size: r.size,
        mime: r.type,
        ajoute_le: Date.now(),
      },
    ]);

  const remove = async (i: number) => {
    const doc = value[i];
    if (!doc) return;
    if (doc.storage_path) {
      if (
        !confirm(
          `Supprimer définitivement le fichier "${doc.filename ?? doc.nom}" ? Action irréversible.`
        )
      )
        return;
      try {
        await deleteFile('client-documents', doc.storage_path);
      } catch (e) {
        console.warn('[doc] delete file failed (might already be gone):', e);
      }
    }
    onChange(value.filter((_, j) => j !== i));
  };

  return (
    <Card>
      <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm">Documents ({value.length})</CardTitle>
          <div className="flex gap-1.5">
            <FileUploadButton
              bucket="client-documents"
              accept="application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              prefix={`client_${clientId}`}
              label="📎 Uploader"
              variant="accent"
              onUploaded={addFromUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={add}
            >
              + Référence
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2.5 pt-0 space-y-2.5">
        {value.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Aucun document. Tu peux <strong>uploader un fichier</strong> (PDF, image,
            Word) ou ajouter une <strong>référence</strong> (URL Drive, note).
          </p>
        )}
        {value.map((doc, i) => (
          <DocumentRow key={doc.id} doc={doc} index={i} onUpdate={update} onRemove={remove} />
        ))}
        <p className="text-[10px] text-muted-foreground/80 pt-1">
          🔒 Les fichiers uploadés sont stockés en privé (bucket Supabase). Les URL
          de téléchargement sont signées et expirent après 1h pour la sécurité.
        </p>
      </CardContent>
    </Card>
  );
}

function DocumentRow({
  doc,
  index,
  onUpdate,
  onRemove,
}: {
  doc: ClientDocument;
  index: number;
  onUpdate: (i: number, changes: Partial<ClientDocument>) => void;
  onRemove: (i: number) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const isUploaded = !!doc.storage_path;

  const handleDownload = async () => {
    if (!doc.storage_path) {
      if (doc.url) window.open(doc.url, '_blank', 'noopener');
      return;
    }
    setDownloading(true);
    try {
      const url = await getSignedUrl('client-documents', doc.storage_path, 600);
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur signed URL');
    } finally {
      setDownloading(false);
    }
  };

  // Label du bouton : intitulé saisi par l'utilisateur. Fallback sur filename
  // (sans extension) ou "Télécharger" si tout est vide.
  const downloadLabel =
    doc.nom?.trim() ||
    doc.filename?.replace(/\.[^/.]+$/, '') ||
    'Télécharger';

  return (
    <div className="rounded-md border bg-secondary/20 p-2 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Bouton principal — son label EST l'intitulé du document */}
        {isUploaded || doc.url ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-medium max-w-[60%] flex-1 min-w-0 justify-start"
            onClick={handleDownload}
            disabled={downloading}
            title={`Télécharger ${downloadLabel}`}
          >
            <span aria-hidden className="mr-1.5">
              {downloading ? '⏳' : '📎'}
            </span>
            <span className="truncate">{downloadLabel}</span>
            <span aria-hidden className="ml-auto pl-2 text-muted-foreground">↓</span>
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground italic">
            (référence sans fichier)
          </span>
        )}
        <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-muted-foreground">
          {doc.size !== undefined && <span>{formatFileSize(doc.size)}</span>}
          <span title={`Ajouté ${fmtModifiedAt(doc.ajoute_le)}`}>·</span>
          <span>{fmtModifiedAt(doc.ajoute_le)}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(index)}
            title="Supprimer"
            aria-label="Supprimer"
          >
            ✕
          </Button>
        </div>
      </div>
      <div className="grid gap-2.5 md:grid-cols-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
        <Field label="Nom du document" hint="Sert de libellé au bouton de téléchargement">
          <Input
            value={doc.nom}
            placeholder="ex. RIB Crédit Mutuel, KBIS 2026…"
            onChange={(e) => onUpdate(index, { nom: e.target.value })}
          />
        </Field>
        <Field label="Type" hint="Catégorie libre">
          <Input
            value={doc.type ?? ''}
            placeholder="ex. RIB, KBIS, contrat…"
            onChange={(e) => onUpdate(index, { type: e.target.value || undefined })}
          />
        </Field>
        {!isUploaded && (
          <Field
            label="URL externe"
            hint="Drive, Dropbox, etc. (laisse vide si tu uploades plutôt)"
            className="md:col-span-2"
          >
            <Input
              type="url"
              value={doc.url ?? ''}
              placeholder="https://…"
              onChange={(e) => onUpdate(index, { url: e.target.value || undefined })}
            />
          </Field>
        )}
        <Field
          label="Notes"
          hint="Précisions ou contexte"
          className="md:col-span-2"
        >
          <Input
            value={doc.notes ?? ''}
            placeholder="ex. Document à renouveler en mars 2027"
            onChange={(e) => onUpdate(index, { notes: e.target.value || undefined })}
          />
        </Field>
      </div>
    </div>
  );
}
