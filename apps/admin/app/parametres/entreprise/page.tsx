'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { defaultEntreprise, type EntrepriseConfig } from '@/lib/entreprise';
import { deleteFile } from '@/lib/storage';
import { FileUploadButton } from '@/app/_components/file-upload-button';
import {
  ActionBar,
  ScalarsEditor,
  SettingsHeader,
  SettingsPageContainer,
  fmtModifiedShort,
  stampScalar,
  useSettingsDraft,
} from '../_shared';

/** Génère un row ScalarsEditor pour un champ texte/email/tel de EntrepriseConfig. */
function textRow(
  draft: EntrepriseConfig,
  patch: (u: (d: EntrepriseConfig) => EntrepriseConfig) => void,
  key: keyof EntrepriseConfig,
  label: string,
  opts: { hint?: string; placeholder?: string; type?: 'text' | 'number' } = {}
) {
  const value = draft[key];
  const stringValue =
    typeof value === 'string' || typeof value === 'number' ? value : (value ?? '');
  return {
    key: String(key),
    label,
    type: opts.type ?? 'text',
    hint: opts.hint,
    placeholder: opts.placeholder,
    value: stringValue as string | number,
    modifiedAt: draft.meta?.[String(key)],
    onChange: (v: string) =>
      patch((d) =>
        stampScalar(d, String(key), {
          [key]: v === '' ? undefined : v,
        } as Partial<EntrepriseConfig>)
      ),
  };
}

export default function ParametresEntreprisePage() {
  const { draft, patch, save, cancel, reset, dirty, savedAt, isCustom, updatedAt } = useSettingsDraft(
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
        updatedAt={updatedAt}
      />

      {/* === IDENTITÉ LÉGALE === */}
      <ScalarsEditor
        title="Identité légale"
        rows={[
          textRow(draft, patch, 'raison_sociale', 'Raison sociale'),
          textRow(draft, patch, 'forme_juridique', 'Forme juridique', {
            hint: 'ex. SARL, SAS, EI',
          }),
          textRow(draft, patch, 'capital_social', 'Capital social', {
            hint: 'ex. 10 000 €',
          }),
          textRow(draft, patch, 'siret', 'SIRET', { placeholder: '123 456 789 00012' }),
          textRow(draft, patch, 'rcs', 'RCS', { hint: 'ex. Paris B 123 456 789' }),
          textRow(draft, patch, 'ape', 'Code APE / NAF', { placeholder: '1812Z' }),
          textRow(draft, patch, 'tva_intra', 'TVA intracommunautaire', {
            placeholder: 'FR12345678901',
          }),
        ]}
      />

      {/* === ADRESSE === */}
      <ScalarsEditor
        title="Adresse"
        rows={[
          textRow(draft, patch, 'adresse_ligne1', 'Adresse — ligne 1'),
          textRow(draft, patch, 'adresse_ligne2', 'Adresse — ligne 2', { hint: 'Optionnel' }),
          textRow(draft, patch, 'adresse_cp', 'Code postal'),
          textRow(draft, patch, 'adresse_ville', 'Ville'),
          textRow(draft, patch, 'adresse_pays', 'Pays'),
        ]}
      />

      {/* === CONTACT === */}
      <ScalarsEditor
        title="Contact"
        rows={[
          textRow(draft, patch, 'email', 'Email'),
          textRow(draft, patch, 'telephone', 'Téléphone'),
          textRow(draft, patch, 'site_web', 'Site web', {
            hint: 'Sans http://',
            placeholder: 'avenirnumerique.fr',
          }),
        ]}
      />

      {/* === BANQUE === */}
      <ScalarsEditor
        title="Coordonnées bancaires"
        rows={[
          textRow(draft, patch, 'banque', 'Banque', { placeholder: 'ex. Crédit Mutuel' }),
          textRow(draft, patch, 'iban', 'IBAN', {
            placeholder: 'FR76 1234 5678 9012 3456 7890 123',
          }),
          textRow(draft, patch, 'bic', 'BIC / SWIFT', { placeholder: 'CMCIFR2A' }),
        ]}
      />

      {/* === LOGO === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Logo</CardTitle>
            <span
              className="text-[10px] text-muted-foreground/70 tabular-nums"
              title={
                draft.meta?.logo_url
                  ? new Date(draft.meta.logo_url).toLocaleString('fr-FR')
                  : 'Jamais modifié'
              }
            >
              {fmtModifiedShort(draft.meta?.logo_url)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-2.5 space-y-2.5">
          {draft.logo_url ? (
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={draft.logo_url}
                alt="Logo entreprise"
                className="h-20 w-auto max-w-48 border rounded bg-secondary/30 p-2 object-contain"
              />
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-[11px] text-muted-foreground break-all">
                  {draft.logo_url}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <FileUploadButton
                    bucket="entreprise-logos"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    prefix="logo"
                    upsert
                    label="Remplacer"
                    onUploaded={(r) => {
                      patch((d) =>
                        stampScalar(d, 'logo_url', {
                          logo_url: r.url,
                          logo_path: r.path,
                        })
                      );
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={async () => {
                      if (!confirm('Supprimer le logo ?')) return;
                      if (draft.logo_path) {
                        try {
                          await deleteFile('entreprise-logos', draft.logo_path);
                        } catch (e) {
                          console.warn('[logo] delete file failed (might already be gone):', e);
                        }
                      }
                      patch((d) =>
                        stampScalar(d, 'logo_url', {
                          logo_url: undefined,
                          logo_path: undefined,
                        })
                      );
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Image PNG / JPG / SVG / WebP, max 5 MB. Affichée en en-tête des PDF.
              </p>
              <FileUploadButton
                bucket="entreprise-logos"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                prefix="logo"
                variant="accent"
                label="📎 Uploader un logo"
                onUploaded={(r) => {
                  patch((d) =>
                    stampScalar(d, 'logo_url', {
                      logo_url: r.url,
                      logo_path: r.path,
                    })
                  );
                }}
              />
            </div>
          )}
          {/* Champ avancé : URL externe (Drive, hébergeur web…) */}
          <details className="text-[11px] text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">
              Utiliser une URL externe à la place
            </summary>
            <div className="mt-2 flex items-center gap-2">
              <label className="shrink-0">URL :</label>
              <Input
                type="url"
                className="h-7 text-xs px-2 flex-1"
                value={draft.logo_url ?? ''}
                placeholder="https://..."
                onChange={(e) =>
                  patch((d) =>
                    stampScalar(d, 'logo_url', {
                      logo_url: e.target.value || undefined,
                      logo_path: undefined,
                    })
                  )
                }
              />
            </div>
          </details>
        </CardContent>
      </Card>

      {/* === MENTIONS LÉGALES — textarea (pas un scalaire simple) === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm">Mentions de pied de page</CardTitle>
            <span
              className="text-[10px] text-muted-foreground/70 tabular-nums"
              title={
                draft.meta?.mentions_devis
                  ? new Date(draft.meta.mentions_devis).toLocaleString('fr-FR')
                  : 'Jamais modifié'
              }
            >
              {fmtModifiedShort(draft.meta?.mentions_devis)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-2.5">
          <p className="text-[11px] text-muted-foreground/80 mb-1.5">
            Conditions et mentions imprimées en pied de page de chaque devis.
          </p>
          <textarea
            className="flex w-full min-h-20 rounded-md border border-input bg-background px-2 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={draft.mentions_devis ?? ''}
            placeholder="ex. Devis valable 30 jours. CGV disponibles sur demande. Pénalités de retard au taux légal en vigueur."
            onChange={(e) =>
              patch((d) =>
                stampScalar(d, 'mentions_devis', {
                  mentions_devis: e.target.value || undefined,
                })
              )
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

