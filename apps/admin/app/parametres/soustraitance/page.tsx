'use client';

import { Button, Input } from '@avenir/ui';
import { defaultSoustraitanceParams } from '@/lib/default-params/soustraitance';
import {
  ActionBar,
  CatalogueCard,
  ScalarsEditor,
  SettingsHeader,
  SettingsPageContainer,
  stampRow,
  stampScalar,
  stamped,
  useSettingsDraft,
} from '../_shared';

export default function ParametresSoustraitancePage() {
  const { draft, patch, save, cancel, reset, dirty, savedAt, isCustom, updatedAt } =
    useSettingsDraft('soustraitance', defaultSoustraitanceParams, {
      resetConfirmMessage:
        'Réinitialiser tous les paramètres Sous-traitance aux valeurs par défaut ?',
    });

  return (
    <SettingsPageContainer>
      <SettingsHeader
        title="Paramètres Sous-traitance"
        subtitle="Catalogue des fournisseurs partenaires + marges + dégressif sur gros achats."
        updatedAt={updatedAt}
      />

      {/* === FOURNISSEURS === */}
      <CatalogueCard
        title={`Fournisseurs (${draft.fournisseurs.length})`}
        items={draft.fournisseurs}
        onAdd={() =>
          patch((d) => ({
            ...d,
            fournisseurs: [
              ...d.fournisseurs,
              stamped({
                id: `fournisseur_${Date.now()}`,
                nom: 'Nouveau fournisseur',
              }),
            ],
          }))
        }
        onRemove={(i) =>
          patch((d) => ({
            ...d,
            fournisseurs: d.fournisseurs.filter((_, j) => j !== i),
          }))
        }
        minItems={1}
        columns={[
          { label: 'Nom', span: 4 },
          { label: 'Catégorie', span: 3 },
          { label: 'Marge habit. %', span: 2 },
          { label: 'Notes', span: 2 },
        ]}
        renderRow={(f, i) => (
          <>
            <Input
              className="col-span-4"
              value={f.nom}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  fournisseurs: stampRow(d.fournisseurs, i, { nom: e.target.value }),
                }))
              }
            />
            <Input
              className="col-span-3"
              value={f.categorie ?? ''}
              placeholder="ex. Tampons, Packaging…"
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  fournisseurs: stampRow(d.fournisseurs, i, {
                    categorie: e.target.value || undefined,
                  }),
                }))
              }
            />
            <Input
              className="col-span-2"
              type="number"
              min={0}
              max={500}
              step={1}
              value={f.marge_habituelle_pct ?? ''}
              placeholder={String(draft.default_marge_pct)}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  fournisseurs: stampRow(d.fournisseurs, i, {
                    marge_habituelle_pct:
                      e.target.value === '' ? undefined : Number(e.target.value) || 0,
                  }),
                }))
              }
            />
            <Input
              className="col-span-2"
              value={f.notes ?? ''}
              placeholder="Notes admin"
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  fournisseurs: stampRow(d.fournisseurs, i, {
                    notes: e.target.value || undefined,
                  }),
                }))
              }
            />
          </>
        )}
      />

      {/* === SCALARS (Prix généraux) === */}
      <ScalarsEditor
        title="Prix généraux"
        rows={[
          {
            key: 'default_marge_pct',
            label: 'Marge par défaut',
            hint: 'Appliquée si aucune marge habituelle fournisseur',
            suffix: '%',
            value: draft.default_marge_pct,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.default_marge_pct,
            onChange: (v) =>
              patch((d) =>
                stampScalar(d, 'default_marge_pct', {
                  default_marge_pct: Number(v) || 0,
                })
              ),
          },
          {
            key: 'frais_fixes_ht',
            label: 'Frais fixes HT',
            hint: 'Préparation, gestion fournisseur',
            suffix: '€',
            value: draft.frais_fixes_ht,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.frais_fixes_ht,
            onChange: (v) =>
              patch((d) =>
                stampScalar(d, 'frais_fixes_ht', { frais_fixes_ht: Number(v) || 0 })
              ),
          },
          {
            key: 'bat_prix_ht',
            label: 'Prix BAT HT',
            suffix: '€',
            value: draft.bat_prix_ht,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.bat_prix_ht,
            onChange: (v) =>
              patch((d) =>
                stampScalar(d, 'bat_prix_ht', { bat_prix_ht: Number(v) || 0 })
              ),
          },
          {
            key: 'tva_pct',
            label: 'TVA',
            suffix: '%',
            value: draft.tva_pct,
            min: 0,
            step: 0.1,
            modifiedAt: draft.meta?.tva_pct,
            onChange: (v) =>
              patch((d) => stampScalar(d, 'tva_pct', { tva_pct: Number(v) || 0 })),
          },
          {
            key: 'prix_plancher_ht',
            label: 'Plancher prix HT',
            hint: 'Optionnel — prix HT ne descend jamais en dessous',
            suffix: '€',
            value: draft.prix_plancher_ht ?? '',
            placeholder: 'Aucun',
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.prix_plancher_ht,
            onChange: (v) =>
              patch((d) =>
                stampScalar(d, 'prix_plancher_ht', {
                  prix_plancher_ht: v === '' ? undefined : Number(v) || 0,
                })
              ),
            action:
              draft.prix_plancher_ht !== undefined ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px]"
                  onClick={() =>
                    patch((d) =>
                      stampScalar(d, 'prix_plancher_ht', { prix_plancher_ht: undefined })
                    )
                  }
                >
                  Désactiver
                </Button>
              ) : null,
          },
        ]}
      />

      {/* === DÉGRESSIF SUR ACHATS === */}
      <CatalogueCard
        title="Dégressif sur prix d'achat total"
        items={draft.degressif.map((d, i) => ({
          id: `deg_${i}`,
          nom: `Seuil ${d.seuil_achat_ht} €`,
          ...d,
        }))}
        onAdd={() =>
          patch((d) => ({
            ...d,
            degressif: [
              ...d.degressif,
              { seuil_achat_ht: 1000, remise_pct: 0 },
            ],
          }))
        }
        onRemove={(i) =>
          patch((d) => ({
            ...d,
            degressif: d.degressif.filter((_, j) => j !== i),
          }))
        }
        columns={[
          { label: 'À partir de (achat HT)', span: 6 },
          { label: 'Remise (%)', span: 5 },
        ]}
        renderRow={(_, i) => {
          const d = draft.degressif[i]!;
          return (
            <>
              <Input
                className="col-span-6"
                type="number"
                min={0}
                step={100}
                value={d.seuil_achat_ht}
                onChange={(e) =>
                  patch((p) => {
                    const next = [...p.degressif];
                    next[i] = { ...next[i]!, seuil_achat_ht: Number(e.target.value) || 0 };
                    return { ...p, degressif: next };
                  })
                }
              />
              <Input
                className="col-span-5"
                type="number"
                min={0}
                max={100}
                step={1}
                value={d.remise_pct}
                onChange={(e) =>
                  patch((p) => {
                    const next = [...p.degressif];
                    next[i] = { ...next[i]!, remise_pct: Number(e.target.value) || 0 };
                    return { ...p, degressif: next };
                  })
                }
              />
            </>
          );
        }}
      />

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
