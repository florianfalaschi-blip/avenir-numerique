'use client';

import Link from 'next/link';
import type { FlyersFinitionType, FlyersParams, Techno } from '@avenir/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field, Select } from '../../calculateurs/_shared/components';
import { defaultFlyersParams } from '@/lib/default-params/flyers';
import {
  ActionBar,
  CatalogueCard,
  DegressifEditor,
  SettingsHeader,
  SettingsPageContainer,
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
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-xl">Machines d&apos;impression</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                patch((d) => ({
                  ...d,
                  machines: [
                    ...d.machines,
                    {
                      id: `machine_${Date.now()}`,
                      nom: 'Nouvelle machine',
                      techno: 'numerique',
                      format_max_mm: { largeur: 330, hauteur: 488 },
                      vitesse_feuilles_h: 1000,
                      taux_horaire_ht: 60,
                      cout_calage_ht: 0,
                      recto_verso_calage_unique: true,
                      gaches_pct: 2,
                      operateur_taux_horaire_ht: 30,
                      actif: true,
                    },
                  ],
                }))
              }
            >
              + Ajouter une machine
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.machines.map((m, mi) => (
            <div key={m.id} className="rounded-md border bg-secondary/20 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  value={m.nom}
                  placeholder="Nom de la machine"
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.machines];
                      next[mi] = { ...next[mi]!, nom: e.target.value };
                      return { ...d, machines: next };
                    })
                  }
                />
                <label className="flex items-center gap-1.5 text-sm shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={m.actif}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.machines];
                        next[mi] = { ...next[mi]!, actif: e.target.checked };
                        return { ...d, machines: next };
                      })
                    }
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  Active
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
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

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Field label="Techno">
                  <Select
                    value={m.techno}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.machines];
                        next[mi] = { ...next[mi]!, techno: e.target.value as Techno };
                        return { ...d, machines: next };
                      })
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
                      patch((d) => {
                        const next = [...d.machines];
                        next[mi] = {
                          ...next[mi]!,
                          format_max_mm: {
                            ...next[mi]!.format_max_mm,
                            largeur: Number(e.target.value) || 0,
                          },
                        };
                        return { ...d, machines: next };
                      })
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
                      patch((d) => {
                        const next = [...d.machines];
                        next[mi] = {
                          ...next[mi]!,
                          format_max_mm: {
                            ...next[mi]!.format_max_mm,
                            hauteur: Number(e.target.value) || 0,
                          },
                        };
                        return { ...d, machines: next };
                      })
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
                      patch((d) => {
                        const next = [...d.machines];
                        next[mi] = {
                          ...next[mi]!,
                          vitesse_feuilles_h: Number(e.target.value) || 0,
                        };
                        return { ...d, machines: next };
                      })
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
                      patch((d) => {
                        const next = [...d.machines];
                        next[mi] = {
                          ...next[mi]!,
                          taux_horaire_ht: Number(e.target.value) || 0,
                        };
                        return { ...d, machines: next };
                      })
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
                      patch((d) => {
                        const next = [...d.machines];
                        next[mi] = {
                          ...next[mi]!,
                          operateur_taux_horaire_ht: Number(e.target.value) || 0,
                        };
                        return { ...d, machines: next };
                      })
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
                      patch((d) => {
                        const next = [...d.machines];
                        next[mi] = {
                          ...next[mi]!,
                          cout_calage_ht: Number(e.target.value) || 0,
                        };
                        return { ...d, machines: next };
                      })
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
                      patch((d) => {
                        const next = [...d.machines];
                        next[mi] = {
                          ...next[mi]!,
                          gaches_pct: Number(e.target.value) || 0,
                        };
                        return { ...d, machines: next };
                      })
                    }
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={m.recto_verso_calage_unique}
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.machines];
                      next[mi] = {
                        ...next[mi]!,
                        recto_verso_calage_unique: e.target.checked,
                      };
                      return { ...d, machines: next };
                    })
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
        <CardHeader>
          <CardTitle className="text-xl">Papiers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les papiers sont gérés dans le catalogue partagé (utilisé aussi par les Brochures).
          </p>
          <Link
            href="/parametres/papiers"
            className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:underline"
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
              {
                id: `finition_${Date.now()}`,
                nom: 'Nouvelle finition',
                type: 'forfait',
                prix_ht: 0,
                sous_traite: false,
              },
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
                patch((d) => {
                  const next = [...d.finitions];
                  next[i] = { ...next[i]!, nom: e.target.value };
                  return { ...d, finitions: next };
                })
              }
            />
            <Select
              className="col-span-2"
              value={f.type}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.finitions];
                  next[i] = { ...next[i]!, type: e.target.value as FlyersFinitionType };
                  return { ...d, finitions: next };
                })
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
                patch((d) => {
                  const next = [...d.finitions];
                  next[i] = { ...next[i]!, prix_ht: Number(e.target.value) || 0 };
                  return { ...d, finitions: next };
                })
              }
            />
            <div className="col-span-1 flex justify-center">
              <input
                type="checkbox"
                checked={f.sous_traite}
                onChange={(e) =>
                  patch((d) => {
                    const next = [...d.finitions];
                    next[i] = { ...next[i]!, sous_traite: e.target.checked };
                    return { ...d, finitions: next };
                  })
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
                onChange={(e) =>
                  patch((d) => {
                    const next = [...d.finitions];
                    const raw = e.target.value;
                    next[i] = {
                      ...next[i]!,
                      cout_fournisseur_ht: raw === '' ? undefined : Number(raw) || 0,
                    };
                    return { ...d, finitions: next };
                  })
                }
              />
              <Input
                type="number"
                min={0}
                max={500}
                step={1}
                placeholder="Marge ST %"
                disabled={!f.sous_traite}
                value={f.marge_sous_traitance_pct ?? ''}
                onChange={(e) =>
                  patch((d) => {
                    const next = [...d.finitions];
                    const raw = e.target.value;
                    next[i] = {
                      ...next[i]!,
                      marge_sous_traitance_pct: raw === '' ? undefined : Number(raw) || 0,
                    };
                    return { ...d, finitions: next };
                  })
                }
              />
            </div>
          </>
        )}
      />

      {/* === SCALARS === */}
      <FlyersScalars params={draft} onPatch={patch} />

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

function FlyersScalars({
  params,
  onPatch,
}: {
  params: FlyersParams;
  onPatch: (updater: (d: FlyersParams) => FlyersParams) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Prix généraux & marges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Seuil offset (qté min)"
            hint="Quantité à partir de laquelle techno=auto bascule en offset"
          >
            <Input
              type="number"
              min={1}
              step={50}
              value={params.seuil_offset_quantite_min}
              onChange={(e) =>
                onPatch((d) => ({
                  ...d,
                  seuil_offset_quantite_min: Number(e.target.value) || 0,
                }))
              }
            />
          </Field>
          <Field label="Frais fixes HT (€)">
            <Input
              type="number"
              min={0}
              step={1}
              value={params.frais_fixes_ht}
              onChange={(e) =>
                onPatch((d) => ({ ...d, frais_fixes_ht: Number(e.target.value) || 0 }))
              }
            />
          </Field>
          <Field label="Prix BAT HT (€)">
            <Input
              type="number"
              min={0}
              step={1}
              value={params.bat_prix_ht}
              onChange={(e) =>
                onPatch((d) => ({ ...d, bat_prix_ht: Number(e.target.value) || 0 }))
              }
            />
          </Field>
          <Field label="Marge offset (%)">
            <Input
              type="number"
              min={0}
              step={1}
              value={params.marge_pct_offset}
              onChange={(e) =>
                onPatch((d) => ({ ...d, marge_pct_offset: Number(e.target.value) || 0 }))
              }
            />
          </Field>
          <Field label="Marge numérique (%)">
            <Input
              type="number"
              min={0}
              step={1}
              value={params.marge_pct_numerique}
              onChange={(e) =>
                onPatch((d) => ({ ...d, marge_pct_numerique: Number(e.target.value) || 0 }))
              }
            />
          </Field>
          <Field label="TVA (%)">
            <Input
              type="number"
              min={0}
              step={0.1}
              value={params.tva_pct}
              onChange={(e) =>
                onPatch((d) => ({ ...d, tva_pct: Number(e.target.value) || 0 }))
              }
            />
          </Field>
          <Field
            label="Plancher prix HT (€)"
            hint="Optionnel"
            className="md:col-span-2 lg:col-span-3"
          >
            <div className="flex gap-2 items-center max-w-md">
              <Input
                type="number"
                min={0}
                step={1}
                value={params.prix_plancher_ht ?? ''}
                placeholder="Aucun plancher"
                onChange={(e) => {
                  const raw = e.target.value;
                  onPatch((d) => ({
                    ...d,
                    prix_plancher_ht: raw === '' ? undefined : Number(raw) || 0,
                  }));
                }}
              />
              {params.prix_plancher_ht !== undefined && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPatch((d) => ({ ...d, prix_plancher_ht: undefined }))}
                >
                  Désactiver
                </Button>
              )}
            </div>
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
