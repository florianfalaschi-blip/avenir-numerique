'use client';

import Link from 'next/link';
import type { FlyersFinitionType, Techno } from '@avenir/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field, Select } from '../../calculateurs/_shared/components';
import { defaultFlyersParams } from '@/lib/default-params/flyers';
import {
  ActionBar,
  CatalogueCard,
  DegressifEditor,
  ScalarsEditor,
  SettingsHeader,
  SettingsPageContainer,
  fmtModifiedShort,
  stampRow,
  stampScalar,
  stamped,
  useSettingsDraft,
} from '../_shared';

const FINITION_TYPES: { value: FlyersFinitionType; label: string }[] = [
  { value: 'forfait', label: 'Forfait' },
  { value: 'unitaire', label: 'Unitaire' },
  { value: 'm2', label: 'm²' },
  { value: 'par_face', label: 'Par face (RV × 2)' },
];


export default function ParametresFlyersPage() {
  const { draft, patch, save, cancel, reset, dirty, savedAt, isCustom, updatedAt } = useSettingsDraft(
    'flyers',
    defaultFlyersParams,
    { resetConfirmMessage: 'Réinitialiser tous les paramètres Flyers aux valeurs par défaut ?' }
  );

  return (
    <SettingsPageContainer>
      <SettingsHeader
        title="Paramètres Flyers / Affiches"
        subtitle="Machines (offset + numérique), papiers, finitions, seuil offset et marges séparées."
        updatedAt={updatedAt}
      />

      {/* === MACHINES === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm">Machines d&apos;impression</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={() =>
                patch((d) => ({
                  ...d,
                  machines: [
                    ...d.machines,
                    stamped({
                      id: `machine_${Date.now()}`,
                      nom: 'Nouvelle machine',
                      techno: 'numerique' as Techno,
                      format_max_mm: { largeur: 330, hauteur: 488 },
                      vitesse_feuilles_h: 1000,
                      taux_horaire_ht: 60,
                      cout_calage_ht: 0,
                      recto_verso_calage_unique: true,
                      gaches_pct: 2,
                      operateur_taux_horaire_ht: 30,
                      actif: true,
                    }),
                  ],
                }))
              }
            >
              + Ajouter une machine
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-2.5 space-y-2">
          {draft.machines.map((m, mi) => (
            <div key={m.id} className="rounded-md border bg-secondary/20 p-2.5 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1 h-7 text-xs px-2"
                  value={m.nom}
                  placeholder="Nom de la machine"
                  onChange={(e) =>
                    patch((d) => ({
                      ...d,
                      machines: stampRow(d.machines, mi, { nom: e.target.value }),
                    }))
                  }
                />
                <label className="flex items-center gap-1.5 text-xs shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={m.actif}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        machines: stampRow(d.machines, mi, { actif: e.target.checked }),
                      }))
                    }
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  Active
                </label>
                <span
                  className="text-[10px] text-muted-foreground/70 whitespace-nowrap tabular-nums"
                  title={
                    m.lastModifiedAt
                      ? new Date(m.lastModifiedAt).toLocaleString('fr-FR')
                      : 'Jamais modifié'
                  }
                >
                  {fmtModifiedShort(m.lastModifiedAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    patch((d) => ({
                      ...d,
                      machines: d.machines.filter((_, j) => j !== mi),
                    }))
                  }
                  aria-label={`Supprimer ${m.nom}`}
                  disabled={draft.machines.length === 1}
                >
                  ✕
                </Button>
              </div>

              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2">
                <Field label="Techno">
                  <Select
                    className="h-7 text-xs px-2 py-0"
                    value={m.techno}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        machines: stampRow(d.machines, mi, {
                          techno: e.target.value as Techno,
                        }),
                      }))
                    }
                  >
                    <option value="numerique">Numérique</option>
                    <option value="offset">Offset</option>
                  </Select>
                </Field>
                <Field label="Format max — Largeur (mm)">
                  <Input
                    type="number"
                    min={1}
                    step={10}
                    value={m.format_max_mm.largeur}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        machines: stampRow(d.machines, mi, {
                          format_max_mm: {
                            ...m.format_max_mm,
                            largeur: Number(e.target.value) || 0,
                          },
                        }),
                      }))
                    }
                  />
                </Field>
                <Field label="Format max — Hauteur (mm)">
                  <Input
                    type="number"
                    min={1}
                    step={10}
                    value={m.format_max_mm.hauteur}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        machines: stampRow(d.machines, mi, {
                          format_max_mm: {
                            ...m.format_max_mm,
                            hauteur: Number(e.target.value) || 0,
                          },
                        }),
                      }))
                    }
                  />
                </Field>
                <Field label="Vitesse (feuilles/h)">
                  <Input
                    type="number"
                    min={1}
                    step={100}
                    value={m.vitesse_feuilles_h}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        machines: stampRow(d.machines, mi, {
                          vitesse_feuilles_h: Number(e.target.value) || 0,
                        }),
                      }))
                    }
                  />
                </Field>
                <Field label="Taux machine HT (€/h)">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={m.taux_horaire_ht}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        machines: stampRow(d.machines, mi, {
                          taux_horaire_ht: Number(e.target.value) || 0,
                        }),
                      }))
                    }
                  />
                </Field>
                <Field label="Taux opérateur HT (€/h)">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={m.operateur_taux_horaire_ht}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        machines: stampRow(d.machines, mi, {
                          operateur_taux_horaire_ht: Number(e.target.value) || 0,
                        }),
                      }))
                    }
                  />
                </Field>
                <Field label="Coût calage HT (€)" hint="Offset uniquement">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={m.cout_calage_ht}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        machines: stampRow(d.machines, mi, {
                          cout_calage_ht: Number(e.target.value) || 0,
                        }),
                      }))
                    }
                  />
                </Field>
                <Field label="Gâches (%)">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={m.gaches_pct}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        machines: stampRow(d.machines, mi, {
                          gaches_pct: Number(e.target.value) || 0,
                        }),
                      }))
                    }
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={m.recto_verso_calage_unique}
                  onChange={(e) =>
                    patch((d) => ({
                      ...d,
                      machines: stampRow(d.machines, mi, {
                        recto_verso_calage_unique: e.target.checked,
                      }),
                    }))
                  }
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span>Recto-verso = 1 seul calage (sinon ×2)</span>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* === PAPIERS — délégué au catalogue partagé === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <CardTitle className="text-sm">Papiers</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-2.5">
          <p className="text-xs text-muted-foreground">
            Les papiers sont gérés dans le catalogue partagé (utilisé aussi par les Brochures).
          </p>
          <Link
            href="/parametres/papiers"
            className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-primary hover:underline"
          >
            Modifier le catalogue Papiers
            <span aria-hidden>→</span>
          </Link>
        </CardContent>
      </Card>

      {/* === FINITIONS === */}
      <CatalogueCard
        title="Finitions"
        items={draft.finitions}
        onAdd={() =>
          patch((d) => ({
            ...d,
            finitions: [
              ...d.finitions,
              stamped({
                id: `finition_${Date.now()}`,
                nom: 'Nouvelle finition',
                type: 'forfait' as FlyersFinitionType,
                prix_ht: 0,
                sous_traite: false,
              }),
            ],
          }))
        }
        onRemove={(i) =>
          patch((d) => ({ ...d, finitions: d.finitions.filter((_, j) => j !== i) }))
        }
        columns={[
          { label: 'Nom', span: 4 },
          { label: 'Type', span: 2 },
          { label: 'Prix HT', span: 2 },
          { label: 'ST', span: 1 },
          { label: 'Coût ST / Marge ST%', span: 3 },
        ]}
        renderRow={(f, i) => (
          <>
            <Input
              className="col-span-4"
              value={f.nom}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  finitions: stampRow(d.finitions, i, { nom: e.target.value }),
                }))
              }
            />
            <Select
              className="col-span-2"
              value={f.type}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  finitions: stampRow(d.finitions, i, {
                    type: e.target.value as FlyersFinitionType,
                  }),
                }))
              }
            >
              {FINITION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Input
              className="col-span-2"
              type="number"
              min={0}
              step={0.1}
              value={f.prix_ht}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  finitions: stampRow(d.finitions, i, {
                    prix_ht: Number(e.target.value) || 0,
                  }),
                }))
              }
            />
            <div className="col-span-1 flex justify-center">
              <input
                type="checkbox"
                checked={f.sous_traite}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    finitions: stampRow(d.finitions, i, {
                      sous_traite: e.target.checked,
                    }),
                  }))
                }
                className="h-4 w-4 rounded border-input accent-primary"
                aria-label="Sous-traité"
              />
            </div>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="Coût ST"
                disabled={!f.sous_traite}
                value={f.cout_fournisseur_ht ?? ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  patch((d) => ({
                    ...d,
                    finitions: stampRow(d.finitions, i, {
                      cout_fournisseur_ht: raw === '' ? undefined : Number(raw) || 0,
                    }),
                  }));
                }}
              />
              <Input
                type="number"
                min={0}
                max={500}
                step={1}
                placeholder="Marge ST %"
                disabled={!f.sous_traite}
                value={f.marge_sous_traitance_pct ?? ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  patch((d) => ({
                    ...d,
                    finitions: stampRow(d.finitions, i, {
                      marge_sous_traitance_pct: raw === '' ? undefined : Number(raw) || 0,
                    }),
                  }));
                }}
              />
            </div>
          </>
        )}
      />

      {/* === PRIX GÉNÉRAUX & MARGES === */}
      <ScalarsEditor
        title="Prix généraux & marges"
        rows={[
          {
            key: 'seuil_offset_quantite_min',
            label: 'Seuil offset (qté min)',
            hint: 'Quantité à partir de laquelle techno=auto bascule en offset',
            value: draft.seuil_offset_quantite_min,
            min: 1,
            step: 50,
            modifiedAt: draft.meta?.seuil_offset_quantite_min,
            onChange: (v) =>
              patch((d) =>
                stampScalar(d, 'seuil_offset_quantite_min', {
                  seuil_offset_quantite_min: Number(v) || 0,
                })
              ),
          },
          {
            key: 'frais_fixes_ht',
            label: 'Frais fixes HT',
            suffix: '€',
            value: draft.frais_fixes_ht,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.frais_fixes_ht,
            onChange: (v) =>
              patch((d) => stampScalar(d, 'frais_fixes_ht', { frais_fixes_ht: Number(v) || 0 })),
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
              patch((d) => stampScalar(d, 'bat_prix_ht', { bat_prix_ht: Number(v) || 0 })),
          },
          {
            key: 'marge_pct_offset',
            label: 'Marge offset',
            suffix: '%',
            value: draft.marge_pct_offset,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.marge_pct_offset,
            onChange: (v) =>
              patch((d) =>
                stampScalar(d, 'marge_pct_offset', { marge_pct_offset: Number(v) || 0 })
              ),
          },
          {
            key: 'marge_pct_numerique',
            label: 'Marge numérique',
            suffix: '%',
            value: draft.marge_pct_numerique,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.marge_pct_numerique,
            onChange: (v) =>
              patch((d) =>
                stampScalar(d, 'marge_pct_numerique', { marge_pct_numerique: Number(v) || 0 })
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
            hint: 'Optionnel — le prix HT ne descend jamais en dessous',
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

      {/* === DÉGRESSIF === */}
      <DegressifEditor
        value={draft.degressif}
        onChange={(degressif) => patch((d) => ({ ...d, degressif }))}
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
