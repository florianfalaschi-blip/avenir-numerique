'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field } from '../../calculateurs/_shared/components';
import { emptyContact, type Contact } from '@/lib/clients';

export function ContactsEditor({
  value,
  onChange,
  hint,
}: {
  value: Contact[];
  onChange: (next: Contact[]) => void;
  hint?: React.ReactNode;
}) {
  const update = (i: number, changes: Partial<Contact>) => {
    const next = [...value];
    next[i] = { ...next[i]!, ...changes };
    onChange(next);
  };

  const setPrincipal = (i: number) => {
    onChange(value.map((c, j) => ({ ...c, est_principal: j === i })));
  };

  const add = () => onChange([...value, emptyContact()]);
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-xl">Contacts ({value.length})</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={add}>
            + Ajouter un contact
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {value.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucun contact. Pour un client B2B, ajoute le directeur achats, la
            comptabilité, etc. Tu peux marquer un contact comme principal.
          </p>
        )}
        {value.map((c, i) => (
          <div key={c.id} className="rounded-md border bg-secondary/20 p-3 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="contact-principal"
                  checked={!!c.est_principal}
                  onChange={() => setPrincipal(i)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                <span
                  className={
                    c.est_principal ? 'font-medium text-primary' : 'text-muted-foreground'
                  }
                >
                  {c.est_principal ? '★ Contact principal' : 'Définir comme principal'}
                </span>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => remove(i)}
              >
                ✕ Supprimer
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Prénom">
                <Input
                  value={c.prenom}
                  onChange={(e) => update(i, { prenom: e.target.value })}
                />
              </Field>
              <Field label="Nom">
                <Input
                  value={c.nom}
                  onChange={(e) => update(i, { nom: e.target.value })}
                />
              </Field>
              <Field label="Fonction" hint="ex. Directeur achats, Comptabilité…" className="md:col-span-2">
                <Input
                  value={c.fonction ?? ''}
                  onChange={(e) => update(i, { fonction: e.target.value || undefined })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={c.email ?? ''}
                  onChange={(e) => update(i, { email: e.target.value || undefined })}
                />
              </Field>
              <Field label="Téléphone fixe">
                <Input
                  type="tel"
                  value={c.telephone ?? ''}
                  onChange={(e) =>
                    update(i, { telephone: e.target.value || undefined })
                  }
                />
              </Field>
              <Field label="Mobile" className="md:col-span-2">
                <Input
                  type="tel"
                  value={c.mobile ?? ''}
                  onChange={(e) => update(i, { mobile: e.target.value || undefined })}
                />
              </Field>
              <Field label="Notes" className="md:col-span-2">
                <Input
                  value={c.notes ?? ''}
                  placeholder="ex. Préfère qu'on l'appelle le matin"
                  onChange={(e) => update(i, { notes: e.target.value || undefined })}
                />
              </Field>
            </div>
          </div>
        ))}
        {hint && (
          <p className="text-xs text-muted-foreground pt-1">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
