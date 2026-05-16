'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field } from '../../calculateurs/_shared/components';
import { fmtModifiedAt } from '../../calculateurs/_shared/format';
import { newDocumentId, type ClientDocument } from '@/lib/clients';

export function DocumentsEditor({
  value,
  onChange,
}: {
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

  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));

  return (
    <Card>
      <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm">Documents ({value.length})</CardTitle>
          <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[11px]" onClick={add}>
            + Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2.5 pt-0 space-y-2.5">
        {value.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Aucun document. Tu peux référencer un RIB, KBIS, attestation TVA, etc.
            soit via une URL externe (Drive, Dropbox), soit avec une simple note
            (« reçu par mail le X »).
          </p>
        )}
        {value.map((doc, i) => (
          <div key={doc.id} className="rounded-md border bg-secondary/20 p-2 space-y-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p className="text-[11px] text-muted-foreground">
                Ajouté : {fmtModifiedAt(doc.ajoute_le)}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                onClick={() => remove(i)}
              >
                ✕ Supprimer
              </Button>
            </div>
            <div className="grid gap-2.5 md:grid-cols-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
              <Field label="Nom du document">
                <Input
                  value={doc.nom}
                  placeholder="ex. RIB, KBIS, Attestation TVA…"
                  onChange={(e) => update(i, { nom: e.target.value })}
                />
              </Field>
              <Field label="Type" hint="Catégorie libre">
                <Input
                  value={doc.type ?? ''}
                  placeholder="ex. RIB, KBIS, contrat…"
                  onChange={(e) => update(i, { type: e.target.value || undefined })}
                />
              </Field>
              <Field
                label="URL externe"
                hint="Drive, Dropbox, ou lien interne (optionnel)"
                className="md:col-span-2"
              >
                <Input
                  type="url"
                  value={doc.url ?? ''}
                  placeholder="https://…"
                  onChange={(e) => update(i, { url: e.target.value || undefined })}
                />
              </Field>
              <Field
                label="Notes"
                hint="Si pas d'URL, juste une note explicative"
                className="md:col-span-2"
              >
                <Input
                  value={doc.notes ?? ''}
                  placeholder="ex. Reçu par mail le 15/05"
                  onChange={(e) => update(i, { notes: e.target.value || undefined })}
                />
              </Field>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-1">
          💡 Phase 3b (Supabase) : upload réel des fichiers via Storage. Pour
          l&apos;instant, on stocke des références.
        </p>
      </CardContent>
    </Card>
  );
}
