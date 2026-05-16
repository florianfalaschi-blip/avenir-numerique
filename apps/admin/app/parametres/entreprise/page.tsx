'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field } from '../../calculateurs/_shared/components';
import { defaultEntreprise } from '@/lib/entreprise';
import {
  ActionBar,
  SettingsHeader,
  SettingsPageContainer,
  useSettingsDraft,
} from '../_shared';

export default function ParametresEntreprisePage() {
  const { draft, patch, save, cancel, reset, dirty, savedAt, isCustom } = useSettingsDraft(
    'config.entreprise',
    defaultEntreprise,
    {
      resetConfirmMessage: 'Réinitialiser les informations entreprise aux valeurs par défaut ?',
    }
  );

  return (
    <SettingsPageContainer>
      <SettingsHeader
        title="Informations entreprise"
        subtitle="Coordonnées légales et bancaires affichées dans l'en-tête et le pied de page des devis et factures."
      />

      {/* === IDENTITÉ LÉGALE === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Identité légale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Raison sociale" className="md:col-span-2">
              <Input
                value={draft.raison_sociale}
                onChange={(e) => patch((d) => ({ ...d, raison_sociale: e.target.value }))}
              />
            </Field>
            <Field label="Forme juridique" hint="ex. SARL, SAS, EI">
              <Input
                value={draft.forme_juridique ?? ''}
                onChange={(e) =>
                  patch((d) => ({ ...d, forme_juridique: e.target.value || undefined }))
                }
              />
            </Field>
            <Field label="Capital social" hint="ex. 10 000 €">
              <Input
                value={draft.capital_social ?? ''}
                onChange={(e) =>
                  patch((d) => ({ ...d, capital_social: e.target.value || undefined }))
                }
              />
            </Field>
            <Field label="SIRET">
              <Input
                value={draft.siret ?? ''}
                placeholder="123 456 789 00012"
                onChange={(e) => patch((d) => ({ ...d, siret: e.target.value || undefined }))}
              />
            </Field>
            <Field label="RCS" hint="ex. Paris B 123 456 789">
              <Input
                value={draft.rcs ?? ''}
                onChange={(e) => patch((d) => ({ ...d, rcs: e.target.value || undefined }))}
              />
            </Field>
            <Field label="Code APE / NAF">
              <Input
                value={draft.ape ?? ''}
                placeholder="1812Z"
                onChange={(e) => patch((d) => ({ ...d, ape: e.target.value || undefined }))}
              />
            </Field>
            <Field label="TVA intracommunautaire">
              <Input
                value={draft.tva_intra ?? ''}
                placeholder="FR12345678901"
                onChange={(e) =>
                  patch((d) => ({ ...d, tva_intra: e.target.value || undefined }))
                }
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* === ADRESSE === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Adresse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Ligne 1">
            <Input
              value={draft.adresse_ligne1 ?? ''}
              onChange={(e) =>
                patch((d) => ({ ...d, adresse_ligne1: e.target.value || undefined }))
              }
            />
          </Field>
          <Field label="Ligne 2" hint="Optionnel">
            <Input
              value={draft.adresse_ligne2 ?? ''}
              onChange={(e) =>
                patch((d) => ({ ...d, adresse_ligne2: e.target.value || undefined }))
              }
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="CP">
              <Input
                value={draft.adresse_cp ?? ''}
                onChange={(e) =>
                  patch((d) => ({ ...d, adresse_cp: e.target.value || undefined }))
                }
              />
            </Field>
            <Field label="Ville" className="md:col-span-2">
              <Input
                value={draft.adresse_ville ?? ''}
                onChange={(e) =>
                  patch((d) => ({ ...d, adresse_ville: e.target.value || undefined }))
                }
              />
            </Field>
          </div>
          <Field label="Pays">
            <Input
              value={draft.adresse_pays ?? ''}
              onChange={(e) =>
                patch((d) => ({ ...d, adresse_pays: e.target.value || undefined }))
              }
            />
          </Field>
        </CardContent>
      </Card>

      {/* === CONTACT === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Email">
              <Input
                type="email"
                value={draft.email ?? ''}
                onChange={(e) => patch((d) => ({ ...d, email: e.target.value || undefined }))}
              />
            </Field>
            <Field label="Téléphone">
              <Input
                type="tel"
                value={draft.telephone ?? ''}
                onChange={(e) =>
                  patch((d) => ({ ...d, telephone: e.target.value || undefined }))
                }
              />
            </Field>
            <Field label="Site web" hint="Sans http://" className="md:col-span-2">
              <Input
                value={draft.site_web ?? ''}
                placeholder="avenirnumerique.fr"
                onChange={(e) =>
                  patch((d) => ({ ...d, site_web: e.target.value || undefined }))
                }
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* === BANQUE === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Coordonnées bancaires</CardTitle>
          <CardDescription>
            Affichées en pied de page des devis pour faciliter les paiements par virement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Banque" className="md:col-span-2">
              <Input
                value={draft.banque ?? ''}
                placeholder="ex. Crédit Mutuel"
                onChange={(e) => patch((d) => ({ ...d, banque: e.target.value || undefined }))}
              />
            </Field>
            <Field label="IBAN" className="md:col-span-2">
              <Input
                value={draft.iban ?? ''}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                onChange={(e) => patch((d) => ({ ...d, iban: e.target.value || undefined }))}
              />
            </Field>
            <Field label="BIC / SWIFT">
              <Input
                value={draft.bic ?? ''}
                placeholder="CMCIFR2A"
                onChange={(e) => patch((d) => ({ ...d, bic: e.target.value || undefined }))}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* === LOGO === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Logo</CardTitle>
          <CardDescription>
            URL d&apos;une image (Drive, hébergement web…) affichée en en-tête du devis. Phase
            3b (Supabase Storage) : upload réel à venir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field label="URL du logo">
            <Input
              type="url"
              value={draft.logo_url ?? ''}
              placeholder="https://..."
              onChange={(e) =>
                patch((d) => ({ ...d, logo_url: e.target.value || undefined }))
              }
            />
          </Field>
        </CardContent>
      </Card>

      {/* === MENTIONS LÉGALES DEVIS === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Mentions de pied de page</CardTitle>
          <CardDescription>
            Conditions et mentions imprimées en pied de page de chaque devis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            className="flex w-full min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={draft.mentions_devis ?? ''}
            placeholder="ex. Devis valable 30 jours. CGV disponibles sur demande. Pénalités de retard au taux légal en vigueur."
            onChange={(e) =>
              patch((d) => ({ ...d, mentions_devis: e.target.value || undefined }))
            }
          />
        </CardContent>
      </Card>

      <ActionBar
        dirty={dirty}
        isCustom={isCustom}
        savedAt={savedAt}
        onSave={save}
        onCancel={cancel}
        onReset={reset}
      />
    </SettingsPageContainer>
  );
}
