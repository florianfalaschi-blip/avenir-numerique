'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field, Select } from '../../calculateurs/_shared/components';
import {
  DELAIS_PAIEMENT,
  MODES_PAIEMENT,
  emptyClientB2B,
  emptyClientB2C,
  type Client,
  type ClientType,
  type DelaiPaiement,
  type ModePaiement,
} from '@/lib/clients';
import { ContactsEditor } from './contacts-editor';
import { TagsEditor } from './tags-editor';
import { DocumentsEditor } from './documents-editor';
import { AdressesEditor } from './adresses-editor';

/**
 * Formulaire client complet, partagé entre /clients/nouveau et
 * /clients/[id] (mode édition).
 *
 * Controlled component : reçoit `value` et `onChange`. Le caller
 * gère le bouton Save.
 */
export function ClientForm({
  value,
  onChange,
  showTypeToggle = true,
}: {
  value: Client;
  onChange: (next: Client) => void;
  /** Si true, affiche le switch B2C/B2B (création). Faux en édition (le type ne change pas). */
  showTypeToggle?: boolean;
}) {
  const c = value;
  const set = <K extends keyof Client>(key: K, val: Client[K]) =>
    onChange({ ...c, [key]: val } as Client);

  const switchType = (t: ClientType) => {
    if (t === c.type) return;
    // Reset to empty client of new type but keep id + timestamps + common fields
    const fresh = t === 'b2c' ? emptyClientB2C() : emptyClientB2B();
    onChange({
      ...fresh,
      id: c.id,
      created_at: c.created_at,
      email: c.email,
      telephone: c.telephone,
      adresses: c.adresses,
      contacts: c.contacts,
      tags: c.tags,
      documents: c.documents,
      notes: c.notes,
      delai_paiement: c.delai_paiement,
      delai_paiement_autre: c.delai_paiement_autre,
      mode_paiement_prefere: c.mode_paiement_prefere,
      remise_habituelle_pct: c.remise_habituelle_pct,
      commercial_assigne: c.commercial_assigne,
      reference_interne: c.reference_interne,
      date_premier_contact: c.date_premier_contact,
      compte_comptable: c.compte_comptable,
    } as Client);
  };

  return (
    <div className="space-y-6">
      {showTypeToggle && (
        <Card>
          <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
            <CardTitle className="text-sm">Type de client</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-2.5 pt-0">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="h-7 px-2 text-xs"
                variant={c.type === 'b2c' ? 'default' : 'outline'}
                onClick={() => switchType('b2c')}
              >
                B2C — Particulier
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-7 px-2 text-xs"
                variant={c.type === 'b2b' ? 'default' : 'outline'}
                onClick={() => switchType('b2b')}
              >
                B2B — Entreprise
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* === IDENTITÉ === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <CardTitle className="text-sm">Identité</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2.5 pt-0 space-y-2.5 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
          {c.type === 'b2c' ? (
            <div className="grid gap-2.5 md:grid-cols-2">
              <Field label="Prénom">
                <Input
                  value={c.prenom}
                  onChange={(e) => set('prenom' as keyof Client, e.target.value as Client[keyof Client])}
                />
              </Field>
              <Field label="Nom">
                <Input
                  value={c.nom}
                  onChange={(e) => set('nom' as keyof Client, e.target.value as Client[keyof Client])}
                />
              </Field>
            </div>
          ) : (
            <>
              <Field label="Raison sociale">
                <Input
                  value={c.raison_sociale}
                  onChange={(e) =>
                    set('raison_sociale' as keyof Client, e.target.value as Client[keyof Client])
                  }
                />
              </Field>
              <div className="grid gap-2.5 md:grid-cols-2">
                <Field label="SIRET" hint="14 chiffres (optionnel)">
                  <Input
                    value={c.siret ?? ''}
                    placeholder="123 456 789 00012"
                    onChange={(e) =>
                      set('siret' as keyof Client, (e.target.value || undefined) as Client[keyof Client])
                    }
                  />
                </Field>
                <Field label="TVA intracommunautaire" hint="Optionnel">
                  <Input
                    value={c.tva_intra ?? ''}
                    placeholder="FR12345678901"
                    onChange={(e) =>
                      set('tva_intra' as keyof Client, (e.target.value || undefined) as Client[keyof Client])
                    }
                  />
                </Field>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* === COORDONNÉES GÉNÉRALES === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <CardTitle className="text-sm">Coordonnées générales</CardTitle>
          <CardDescription className="text-[11px]">
            Email et téléphone principaux du client (le standard de l&apos;entreprise par
            exemple). Les contacts individuels sont gérés ci-dessous.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-2.5 pt-0">
          <div className="grid gap-2.5 md:grid-cols-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
            <Field label="Email">
              <Input
                type="email"
                required
                value={c.email}
                onChange={(e) => onChange({ ...c, email: e.target.value })}
              />
            </Field>
            <Field label="Téléphone">
              <Input
                type="tel"
                value={c.telephone ?? ''}
                onChange={(e) =>
                  onChange({ ...c, telephone: e.target.value || undefined })
                }
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* === CONTACTS === */}
      <ContactsEditor
        value={c.contacts}
        onChange={(contacts) => onChange({ ...c, contacts })}
        hint={
          c.type === 'b2c'
            ? "Pour un client particulier, les contacts additionnels sont optionnels."
            : 'Ajoute autant de contacts que nécessaire : achats, comptabilité, production…'
        }
      />

      {/* === CARNET D'ADRESSES === */}
      <AdressesEditor
        value={c.adresses}
        onChange={(adresses) => onChange({ ...c, adresses })}
      />

      {/* === CONDITIONS COMMERCIALES === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <CardTitle className="text-sm">Conditions commerciales</CardTitle>
          <CardDescription className="text-[11px]">
            Modalités de paiement et remise habituelle (utilisée par défaut sur les nouveaux
            devis).
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-2.5 pt-0 space-y-2.5">
          <div className="grid gap-2.5 md:grid-cols-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
            <Field label="Délai de paiement">
              <Select
                value={c.delai_paiement ?? ''}
                onChange={(e) =>
                  onChange({
                    ...c,
                    delai_paiement: (e.target.value as DelaiPaiement) || undefined,
                  })
                }
              >
                <option value="">— non spécifié —</option>
                {DELAIS_PAIEMENT.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Mode de paiement préféré">
              <Select
                value={c.mode_paiement_prefere ?? ''}
                onChange={(e) =>
                  onChange({
                    ...c,
                    mode_paiement_prefere:
                      (e.target.value as ModePaiement) || undefined,
                  })
                }
              >
                <option value="">— non spécifié —</option>
                {MODES_PAIEMENT.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </Field>
            {c.delai_paiement === 'autre' && (
              <Field label="Préciser le délai" className="md:col-span-2">
                <Input
                  value={c.delai_paiement_autre ?? ''}
                  placeholder="ex. 90 jours fin de mois le 10"
                  onChange={(e) =>
                    onChange({
                      ...c,
                      delai_paiement_autre: e.target.value || undefined,
                    })
                  }
                />
              </Field>
            )}
            <Field
              label="Remise habituelle (%)"
              hint="Appliquée par défaut aux devis créés pour ce client"
            >
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={c.remise_habituelle_pct ?? ''}
                placeholder="0"
                onChange={(e) =>
                  onChange({
                    ...c,
                    remise_habituelle_pct:
                      e.target.value === '' ? undefined : Number(e.target.value) || 0,
                  })
                }
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* === SUIVI COMMERCIAL === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <CardTitle className="text-sm">Suivi commercial</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2.5 pt-0 space-y-2.5">
          <div className="grid gap-2.5 md:grid-cols-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
            <Field label="Commercial assigné" hint="Nom du commercial référent">
              <Input
                value={c.commercial_assigne ?? ''}
                placeholder="ex. Maxime D."
                onChange={(e) =>
                  onChange({
                    ...c,
                    commercial_assigne: e.target.value || undefined,
                  })
                }
              />
            </Field>
            <Field
              label="Référence interne"
              hint="Code ERP, numéro compta…"
            >
              <Input
                value={c.reference_interne ?? ''}
                placeholder="ex. CLI-2026-042"
                onChange={(e) =>
                  onChange({
                    ...c,
                    reference_interne: e.target.value || undefined,
                  })
                }
              />
            </Field>
            <Field label="Date du premier contact">
              <Input
                type="date"
                value={
                  c.date_premier_contact
                    ? new Date(c.date_premier_contact).toISOString().slice(0, 10)
                    : ''
                }
                onChange={(e) => {
                  const raw = e.target.value;
                  onChange({
                    ...c,
                    date_premier_contact: raw === '' ? undefined : new Date(raw).getTime(),
                  });
                }}
              />
            </Field>
            <Field
              label="Compte comptable"
              hint="Pour exports Pennylane / Sage"
            >
              <Input
                value={c.compte_comptable ?? ''}
                placeholder="ex. 411000-DURAND"
                onChange={(e) =>
                  onChange({
                    ...c,
                    compte_comptable: e.target.value || undefined,
                  })
                }
              />
            </Field>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80 leading-none">Tags</label>
            <TagsEditor value={c.tags} onChange={(tags) => onChange({ ...c, tags })} />
          </div>
        </CardContent>
      </Card>

      {/* === DOCUMENTS === */}
      <DocumentsEditor
        clientId={c.id}
        value={c.documents}
        onChange={(documents) => onChange({ ...c, documents })}
      />

      {/* === NOTES === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <CardTitle className="text-sm">Notes internes</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2.5 pt-0">
          <textarea
            className="flex w-full min-h-16 rounded-md border border-input bg-background px-2 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={c.notes ?? ''}
            placeholder="Spécificités, préférences, historique commercial…"
            onChange={(e) => onChange({ ...c, notes: e.target.value || undefined })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
