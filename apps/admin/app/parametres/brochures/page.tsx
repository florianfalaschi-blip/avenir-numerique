'use client';

import Link from 'next/link';
import type {
  BrochuresFinitionType,
  BrochuresParams,
  BrochuresReliureType,
  BrochuresTechno,
} from '@avenir/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field, Select } from '../../calculateurs/_shared/components';
import { defaultBrochuresParams } from '@/lib/default-params/brochures';
import {
  ActionBar,
  CatalogueCard,
  DegressifEditor,
  SettingsHeader,
  SettingsPageContainer,
  useSettingsDraft,
} from '../_shared';

const FINITION_TYPES: { value: BrochuresFinitionType; label: string }[] = [
  { value: 'forfait', label: 'Forfait' },
  { value: 'unitaire', label: 'Unitaire' },
  { value: 'm2', label: 'm²' },
  { value: 'par_face', label: 'Par face (RV × 2)' },
];

const RELIURE_TYPES: { value: BrochuresReliureType; label: string }[] = [
  { value: 'agrafe', label: 'Agrafé' },
  { value: 'dos_carre_colle', label: 'Dos carré collé' },
  { value: 'dos_carre_cousu', label: 'Dos carré cousu' },
  { value: 'spirale', label: 'Spirale' },
  { value: 'wire_o', label: 'Wire-O' },
];

const FACONNAGE_TYPES: { value: BrochuresReliureType | 'plieuse'; label: string }[] = [
  ...RELIURE_TYPES,
  { value: 'plieuse', label: 'Plieuse' },
];


export default function ParametresBrochuresPage() {
  const { draft, patch, save, cancel, reset, dirty, savedAt, isCustom } = useSettingsDraft(
    'brochures',
    defaultBrochuresParams,
    {
      resetConfirmMessage:
        'Réinitialiser tous les paramètres Brochures aux valeurs par défaut ?',
    }
  );

  return (
    <SettingsPageContainer>
      <SettingsHeader
        title="Paramètres Brochures"
        subtitle="Machines impression + façonnage, reliures, papiers, finitions et marges prorata techno."
      />

      {/* === MACHINES IMPRESSION === */}
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
                  machines_impression: [
                    ...d.machines_impression,
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
          {draft.machines_impression.map((m, mi) => (
            <div key={m.id} className="rounded-md border bg-secondary/20 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  value={m.nom}
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.machines_impression];
                      next[mi] = { ...next[mi]!, nom: e.target.value };
                      return { ...d, machines_impression: next };
                    })
                  }
                />
                <label className="flex items-center gap-1.5 text-sm shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={m.actif}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.machines_impression];
                        next[mi] = { ...next[mi]!, actif: e.target.checked };
                        return { ...d, machines_impression: next };
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
                      machines_impression: d.machines_impression.filter((_, j) => j !== mi),
                    }))
                  }
                  aria-label={`Supprimer ${m.nom}`}
                  disabled={draft.machines_impression.length === 1}
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
                        const next = [...d.machines_impression];
                        next[mi] = {
                          ...next[mi]!,
                          techno: e.target.value as BrochuresTechno,
                        };
                        return { ...d, machines_impression: next };
                      })
                    }
                  >
                    <option value="numerique">Numérique</option>
                    <option value="offset">Offset</option>
                  </Select>
                </Field>
                <Field label="Format max Largeur (mm)">
                  <Input
                    type="number"
                    min={1}
                    step={10}
                    value={m.format_max_mm.largeur}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.machines_impression];
                        next[mi] = {
                          ...next[mi]!,
                          format_max_mm: {
                            ...next[mi]!.format_max_mm,
                            largeur: Number(e.target.value) || 0,
                          },
                        };
                        return { ...d, machines_impression: next };
                      })
                    }
                  />
                </Field>
                <Field label="Format max Hauteur (mm)">
                  <Input
                    type="number"
                    min={1}
                    step={10}
                    value={m.format_max_mm.hauteur}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.machines_impression];
                        next[mi] = {
                          ...next[mi]!,
                          format_max_mm: {
                            ...next[mi]!.format_max_mm,
                            hauteur: Number(e.target.value) || 0,
                          },
                        };
                        return { ...d, machines_impression: next };
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
                        const next = [...d.machines_impression];
                        next[mi] = {
                          ...next[mi]!,
                          vitesse_feuilles_h: Number(e.target.value) || 0,
                        };
                        return { ...d, machines_impression: next };
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
                        const next = [...d.machines_impression];
                        next[mi] = {
                          ...next[mi]!,
                          taux_horaire_ht: Number(e.target.value) || 0,
                        };
                        return { ...d, machines_impression: next };
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
                        const next = [...d.machines_impression];
                        next[mi] = {
                          ...next[mi]!,
                          operateur_taux_horaire_ht: Number(e.target.value) || 0,
                        };
                        return { ...d, machines_impression: next };
                      })
                    }
                  />
                </Field>
                <Field label="Calage HT/couleur (€)" hint="Offset uniquement">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={m.cout_calage_ht}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.machines_impression];
                        next[mi] = {
                          ...next[mi]!,
                          cout_calage_ht: Number(e.target.value) || 0,
                        };
                        return { ...d, machines_impression: next };
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
                        const next = [...d.machines_impression];
                        next[mi] = {
                          ...next[mi]!,
                          gaches_pct: Number(e.target.value) || 0,
                        };
                        return { ...d, machines_impression: next };
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
                      const next = [...d.machines_impression];
                      next[mi] = {
                        ...next[mi]!,
                        recto_verso_calage_unique: e.target.checked,
                      };
                      return { ...d, machines_impression: next };
                    })
                  }
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span>Recto-verso = 1 seul calage</span>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* === MACHINES FAÇONNAGE === */}
      <CatalogueCard
        title="Machines de façonnage"
        items={draft.machines_faconnage}
        onAdd={() =>
          patch((d) => ({
            ...d,
            machines_faconnage: [
              ...d.machines_faconnage,
              {
                id: `faconnage_${Date.now()}`,
                nom: 'Nouvelle machine',
                type: 'agrafe',
                vitesse_h: 1000,
                taux_horaire_ht: 40,
                operateur_taux_horaire_ht: 30,
                cout_consommables_unitaire_ht: 0,
              },
            ],
          }))
        }
        onRemove={(i) =>
          patch((d) => ({
            ...d,
            machines_faconnage: d.machines_faconnage.filter((_, j) => j !== i),
          }))
        }
        columns={[
          { label: 'Nom', span: 3 },
          { label: 'Type', span: 2 },
          { label: 'Vitesse/h', span: 2 },
          { label: 'Taux €/h', span: 2 },
          { label: 'Conso /u (€)', span: 2 },
        ]}
        renderRow={(m, i) => (
          <>
            <Input
              className="col-span-3"
              value={m.nom}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.machines_faconnage];
                  next[i] = { ...next[i]!, nom: e.target.value };
                  return { ...d, machines_faconnage: next };
                })
              }
            />
            <Select
              className="col-span-2"
              value={m.type}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.machines_faconnage];
                  next[i] = {
                    ...next[i]!,
                    type: e.target.value as BrochuresReliureType | 'plieuse',
                  };
                  return { ...d, machines_faconnage: next };
                })
              }
            >
              {FACONNAGE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Input
              className="col-span-2"
              type="number"
              min={1}
              step={100}
              value={m.vitesse_h}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.machines_faconnage];
                  next[i] = { ...next[i]!, vitesse_h: Number(e.target.value) || 0 };
                  return { ...d, machines_faconnage: next };
                })
              }
            />
            <Input
              className="col-span-2"
              type="number"
              min={0}
              step={1}
              value={m.taux_horaire_ht}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.machines_faconnage];
                  next[i] = { ...next[i]!, taux_horaire_ht: Number(e.target.value) || 0 };
                  return { ...d, machines_faconnage: next };
                })
              }
            />
            <Input
              className="col-span-2"
              type="number"
              min={0}
              step={0.01}
              value={m.cout_consommables_unitaire_ht}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.machines_faconnage];
                  next[i] = {
                    ...next[i]!,
                    cout_consommables_unitaire_ht: Number(e.target.value) || 0,
                  };
                  return { ...d, machines_faconnage: next };
                })
              }
            />
          </>
        )}
      />

      {/* === RELIURES === */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-xl">Reliures</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                patch((d) => ({
                  ...d,
                  reliures: [
                    ...d.reliures,
                    {
                      id: `reliure_${Date.now()}`,
                      nom: 'Nouvelle reliure',
                      type: 'agrafe',
                      pages_multiple: 4,
                      pages_min: 8,
                      pages_max: 64,
                      machine_faconnage_id: d.machines_faconnage[0]?.id ?? '',
                      sous_traite: false,
                    },
                  ],
                }))
              }
            >
              + Ajouter une reliure
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.reliures.map((r, ri) => (
            <div key={r.id} className="rounded-md border bg-secondary/20 p-3 space-y-3">
              <div className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-7"
                  value={r.nom}
                  placeholder="Nom de la reliure"
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.reliures];
                      next[ri] = { ...next[ri]!, nom: e.target.value };
                      return { ...d, reliures: next };
                    })
                  }
                />
                <Select
                  className="col-span-4"
                  value={r.type}
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.reliures];
                      next[ri] = {
                        ...next[ri]!,
                        type: e.target.value as BrochuresReliureType,
                      };
                      return { ...d, reliures: next };
                    })
                  }
                >
                  {RELIURE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    patch((d) => ({
                      ...d,
                      reliures: d.reliures.filter((_, j) => j !== ri),
                    }))
                  }
                  aria-label={`Supprimer ${r.nom}`}
                  disabled={draft.reliures.length === 1}
                >
                  ✕
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <Field label="Multiple pages">
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={r.pages_multiple}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.reliures];
                        next[ri] = {
                          ...next[ri]!,
                          pages_multiple: Number(e.target.value) || 1,
                        };
                        return { ...d, reliures: next };
                      })
                    }
                  />
                </Field>
                <Field label="Pages min">
                  <Input
                    type="number"
                    min={4}
                    step={1}
                    value={r.pages_min}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.reliures];
                        next[ri] = {
                          ...next[ri]!,
                          pages_min: Number(e.target.value) || 4,
                        };
                        return { ...d, reliures: next };
                      })
                    }
                  />
                </Field>
                <Field label="Pages max">
                  <Input
                    type="number"
                    min={4}
                    step={1}
                    value={r.pages_max}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.reliures];
                        next[ri] = {
                          ...next[ri]!,
                          pages_max: Number(e.target.value) || 4,
                        };
                        return { ...d, reliures: next };
                      })
                    }
                  />
                </Field>
                <Field label="Machine façonnage">
                  <Select
                    value={r.machine_faconnage_id}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.reliures];
                        next[ri] = { ...next[ri]!, machine_faconnage_id: e.target.value };
                        return { ...d, reliures: next };
                      })
                    }
                  >
                    {draft.machines_faconnage.map((mf) => (
                      <option key={mf.id} value={mf.id}>
                        {mf.nom}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid gap-3 md:grid-cols-3 items-end">
                <label className="flex items-center gap-2 text-sm cursor-pointer h-10">
                  <input
                    type="checkbox"
                    checked={r.sous_traite}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.reliures];
                        next[ri] = { ...next[ri]!, sous_traite: e.target.checked };
                        return { ...d, reliures: next };
                      })
                    }
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span>Sous-traité</span>
                </label>
                <Field label="Coût ST / brochure (€)">
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    disabled={!r.sous_traite}
                    value={r.cout_fournisseur_brochure_ht ?? ''}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.reliures];
                        const raw = e.target.value;
                        next[ri] = {
                          ...next[ri]!,
                          cout_fournisseur_brochure_ht:
                            raw === '' ? undefined : Number(raw) || 0,
                        };
                        return { ...d, reliures: next };
                      })
                    }
                  />
                </Field>
                <Field label="Marge ST (%)">
                  <Input
                    type="number"
                    min={0}
                    max={500}
                    step={1}
                    disabled={!r.sous_traite}
                    value={r.marge_sous_traitance_pct ?? ''}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.reliures];
                        const raw = e.target.value;
                        next[ri] = {
                          ...next[ri]!,
                          marge_sous_traitance_pct:
                            raw === '' ? undefined : Number(raw) || 0,
                        };
                        return { ...d, reliures: next };
                      })
                    }
                  />
                </Field>
              </div>
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
            Les papiers sont gérés dans le catalogue partagé (utilisé aussi par les Flyers).
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
        title="Finitions couverture"
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
                  next[i] = { ...next[i]!, type: e.target.value as BrochuresFinitionType };
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
      <BrochuresScalars params={draft} onPatch={patch} />

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

function BrochuresScalars({
  params,
  onPatch,
}: {
  params: BrochuresParams;
  onPatch: (updater: (d: BrochuresParams) => BrochuresParams) => void;
}) {
  const plieuses = params.machines_faconnage.filter((m) => m.type === 'plieuse');
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Seuils, prix généraux & marges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Seuil offset (qté min)"
            hint="Qté min pour bascule en offset (auto)"
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
          <Field
            label="Seuil pages pliage"
            hint="Si nb_pages > seuil, la plieuse est utilisée"
          >
            <Input
              type="number"
              min={4}
              step={1}
              value={params.seuil_pages_pliage}
              onChange={(e) =>
                onPatch((d) => ({
                  ...d,
                  seuil_pages_pliage: Number(e.target.value) || 0,
                }))
              }
            />
          </Field>
          <Field label="Machine pliage" hint="Doit être de type 'plieuse'">
            <Select
              value={params.machine_pliage_id ?? ''}
              onChange={(e) =>
                onPatch((d) => ({
                  ...d,
                  machine_pliage_id: e.target.value === '' ? undefined : e.target.value,
                }))
              }
            >
              <option value="">Aucune (pliage non facturé)</option>
              {plieuses.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </Select>
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
