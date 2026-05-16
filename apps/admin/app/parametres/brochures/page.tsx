'use client';

import Link from 'next/link';
import type {
  BrochuresFinitionType,
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
  ScalarsEditor,
  SettingsHeader,
  SettingsPageContainer,
  fmtModifiedShort,
  stampRow,
  stampScalar,
  stamped,
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
  const { draft, patch, save, cancel, reset, dirty, savedAt, isCustom, updatedAt } = useSettingsDraft(
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
        updatedAt={updatedAt}
      />

      {/* === MACHINES IMPRESSION === */}
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
                  machines_impression: [
                    ...d.machines_impression,
                    stamped({
                      id: `machine_${Date.now()}`,
                      nom: 'Nouvelle machine',
                      techno: 'numerique' as BrochuresTechno,
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
          {draft.machines_impression.map((m, mi) => (
            <div key={m.id} className="rounded-md border bg-secondary/20 p-2.5 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1 h-7 text-xs px-2"
                  value={m.nom}
                  onChange={(e) =>
                    patch((d) => ({
                      ...d,
                      machines_impression: stampRow(d.machines_impression, mi, {
                        nom: e.target.value,
                      }),
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
                        machines_impression: stampRow(d.machines_impression, mi, {
                          actif: e.target.checked,
                        }),
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
                      machines_impression: d.machines_impression.filter((_, j) => j !== mi),
                    }))
                  }
                  aria-label={`Supprimer ${m.nom}`}
                  disabled={draft.machines_impression.length === 1}
                >
                  ✕
                </Button>
              </div>

              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
                <Field label="Techno">
                  <Select
                    className="h-7 text-xs px-2 py-0"
                    value={m.techno}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        machines_impression: stampRow(d.machines_impression, mi, {
                          techno: e.target.value as BrochuresTechno,
                        }),
                      }))
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
                      patch((d) => ({
                        ...d,
                        machines_impression: stampRow(d.machines_impression, mi, {
                          format_max_mm: {
                            ...m.format_max_mm,
                            largeur: Number(e.target.value) || 0,
                          },
                        }),
                      }))
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
                      patch((d) => ({
                        ...d,
                        machines_impression: stampRow(d.machines_impression, mi, {
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
                        machines_impression: stampRow(d.machines_impression, mi, {
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
                        machines_impression: stampRow(d.machines_impression, mi, {
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
                        machines_impression: stampRow(d.machines_impression, mi, {
                          operateur_taux_horaire_ht: Number(e.target.value) || 0,
                        }),
                      }))
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
                      patch((d) => ({
                        ...d,
                        machines_impression: stampRow(d.machines_impression, mi, {
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
                        machines_impression: stampRow(d.machines_impression, mi, {
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
                      machines_impression: stampRow(d.machines_impression, mi, {
                        recto_verso_calage_unique: e.target.checked,
                      }),
                    }))
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
              stamped({
                id: `faconnage_${Date.now()}`,
                nom: 'Nouvelle machine',
                type: 'agrafe' as BrochuresReliureType | 'plieuse',
                vitesse_h: 1000,
                taux_horaire_ht: 40,
                operateur_taux_horaire_ht: 30,
                cout_consommables_unitaire_ht: 0,
              }),
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
                patch((d) => ({
                  ...d,
                  machines_faconnage: stampRow(d.machines_faconnage, i, {
                    nom: e.target.value,
                  }),
                }))
              }
            />
            <Select
              className="col-span-2"
              value={m.type}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  machines_faconnage: stampRow(d.machines_faconnage, i, {
                    type: e.target.value as BrochuresReliureType | 'plieuse',
                  }),
                }))
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
                patch((d) => ({
                  ...d,
                  machines_faconnage: stampRow(d.machines_faconnage, i, {
                    vitesse_h: Number(e.target.value) || 0,
                  }),
                }))
              }
            />
            <Input
              className="col-span-2"
              type="number"
              min={0}
              step={1}
              value={m.taux_horaire_ht}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  machines_faconnage: stampRow(d.machines_faconnage, i, {
                    taux_horaire_ht: Number(e.target.value) || 0,
                  }),
                }))
              }
            />
            <Input
              className="col-span-2"
              type="number"
              min={0}
              step={0.01}
              value={m.cout_consommables_unitaire_ht}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  machines_faconnage: stampRow(d.machines_faconnage, i, {
                    cout_consommables_unitaire_ht: Number(e.target.value) || 0,
                  }),
                }))
              }
            />
          </>
        )}
      />

      {/* === RELIURES === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm">Reliures</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={() =>
                patch((d) => ({
                  ...d,
                  reliures: [
                    ...d.reliures,
                    stamped({
                      id: `reliure_${Date.now()}`,
                      nom: 'Nouvelle reliure',
                      type: 'agrafe' as BrochuresReliureType,
                      pages_multiple: 4,
                      pages_min: 8,
                      pages_max: 64,
                      machine_faconnage_id: d.machines_faconnage[0]?.id ?? '',
                      sous_traite: false,
                    }),
                  ],
                }))
              }
            >
              + Ajouter une reliure
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-2.5 space-y-2">
          {draft.reliures.map((r, ri) => (
            <div key={r.id} className="rounded-md border bg-secondary/20 p-2.5 space-y-2">
              <div className="grid grid-cols-12 gap-2 items-center [&_input]:h-7 [&_input]:text-xs [&_input]:px-2">
                <Input
                  className="col-span-6"
                  value={r.nom}
                  placeholder="Nom de la reliure"
                  onChange={(e) =>
                    patch((d) => ({
                      ...d,
                      reliures: stampRow(d.reliures, ri, { nom: e.target.value }),
                    }))
                  }
                />
                <Select
                  className="col-span-4 h-7 text-xs px-2 py-0"
                  value={r.type}
                  onChange={(e) =>
                    patch((d) => ({
                      ...d,
                      reliures: stampRow(d.reliures, ri, {
                        type: e.target.value as BrochuresReliureType,
                      }),
                    }))
                  }
                >
                  {RELIURE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
                <span
                  className="col-span-1 text-[10px] text-muted-foreground/70 text-right whitespace-nowrap tabular-nums"
                  title={
                    r.lastModifiedAt
                      ? new Date(r.lastModifiedAt).toLocaleString('fr-FR')
                      : 'Jamais modifié'
                  }
                >
                  {fmtModifiedShort(r.lastModifiedAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1 h-7 w-7 text-muted-foreground hover:text-destructive"
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

              <div className="grid gap-2 md:grid-cols-4 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
                <Field label="Multiple pages">
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={r.pages_multiple}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        reliures: stampRow(d.reliures, ri, {
                          pages_multiple: Number(e.target.value) || 1,
                        }),
                      }))
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
                      patch((d) => ({
                        ...d,
                        reliures: stampRow(d.reliures, ri, {
                          pages_min: Number(e.target.value) || 4,
                        }),
                      }))
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
                      patch((d) => ({
                        ...d,
                        reliures: stampRow(d.reliures, ri, {
                          pages_max: Number(e.target.value) || 4,
                        }),
                      }))
                    }
                  />
                </Field>
                <Field label="Machine façonnage">
                  <Select
                    className="h-7 text-xs px-2 py-0"
                    value={r.machine_faconnage_id}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        reliures: stampRow(d.reliures, ri, {
                          machine_faconnage_id: e.target.value,
                        }),
                      }))
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

              <div className="grid gap-2 md:grid-cols-3 items-end [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
                <label className="flex items-center gap-2 text-xs cursor-pointer h-7">
                  <input
                    type="checkbox"
                    checked={r.sous_traite}
                    onChange={(e) =>
                      patch((d) => ({
                        ...d,
                        reliures: stampRow(d.reliures, ri, {
                          sous_traite: e.target.checked,
                        }),
                      }))
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
                    onChange={(e) => {
                      const raw = e.target.value;
                      patch((d) => ({
                        ...d,
                        reliures: stampRow(d.reliures, ri, {
                          cout_fournisseur_brochure_ht:
                            raw === '' ? undefined : Number(raw) || 0,
                        }),
                      }));
                    }}
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
                    onChange={(e) => {
                      const raw = e.target.value;
                      patch((d) => ({
                        ...d,
                        reliures: stampRow(d.reliures, ri, {
                          marge_sous_traitance_pct:
                            raw === '' ? undefined : Number(raw) || 0,
                        }),
                      }));
                    }}
                  />
                </Field>
              </div>
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
            Les papiers sont gérés dans le catalogue partagé (utilisé aussi par les Flyers).
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
        title="Finitions couverture"
        items={draft.finitions}
        onAdd={() =>
          patch((d) => ({
            ...d,
            finitions: [
              ...d.finitions,
              stamped({
                id: `finition_${Date.now()}`,
                nom: 'Nouvelle finition',
                type: 'forfait' as BrochuresFinitionType,
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
                    type: e.target.value as BrochuresFinitionType,
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

      {/* === MACHINE PLIAGE (sélecteur seul, pas un ScalarsEditor) === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <CardTitle className="text-sm">Machine pliage</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-2.5">
          <div className="flex items-center gap-2 flex-wrap [&_input]:h-7 [&_input]:text-xs [&_input]:px-2">
            <span className="text-xs text-muted-foreground flex-1">
              Doit être de type &laquo; plieuse &raquo;. Si vide, pliage non facturé.
            </span>
            <Select
              className="h-7 text-xs px-2 py-0 w-64"
              value={draft.machine_pliage_id ?? ''}
              onChange={(e) =>
                patch((d) =>
                  stampScalar(d, 'machine_pliage_id', {
                    machine_pliage_id:
                      e.target.value === '' ? undefined : e.target.value,
                  })
                )
              }
            >
              <option value="">Aucune (pliage non facturé)</option>
              {draft.machines_faconnage
                .filter((m) => m.type === 'plieuse')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom}
                  </option>
                ))}
            </Select>
            <span
              className="text-[10px] text-muted-foreground/70 whitespace-nowrap tabular-nums w-14 text-right"
              title={
                draft.meta?.machine_pliage_id
                  ? new Date(draft.meta.machine_pliage_id).toLocaleString('fr-FR')
                  : 'Jamais modifié'
              }
            >
              {fmtModifiedShort(draft.meta?.machine_pliage_id)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* === SEUILS, PRIX GÉNÉRAUX & MARGES === */}
      <ScalarsEditor
        title="Seuils, prix généraux & marges"
        rows={[
          {
            key: 'seuil_offset_quantite_min',
            label: 'Seuil offset (qté min)',
            hint: 'Qté min pour bascule en offset (auto)',
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
            key: 'seuil_pages_pliage',
            label: 'Seuil pages pliage',
            hint: 'Si nb_pages > seuil, la plieuse est utilisée',
            value: draft.seuil_pages_pliage,
            min: 4,
            step: 1,
            modifiedAt: draft.meta?.seuil_pages_pliage,
            onChange: (v) =>
              patch((d) =>
                stampScalar(d, 'seuil_pages_pliage', {
                  seuil_pages_pliage: Number(v) || 0,
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
