'use client';

import type {
  BobinesFinitionType,
  BobinesMethodeCalcul,
  BobinesParams,
} from '@avenir/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field, Select } from '../../calculateurs/_shared/components';
import { defaultBobinesParams } from '@/lib/default-params/bobines';
import {
  ActionBar,
  CatalogueCard,
  DegressifEditor,
  SettingsHeader,
  SettingsPageContainer,
  useSettingsDraft,
} from '../_shared';

const FINITION_TYPES: { value: BobinesFinitionType; label: string }[] = [
  { value: 'forfait', label: 'Forfait' },
  { value: 'unitaire', label: 'Unitaire (/u)' },
  { value: 'm2', label: 'Au m²' },
];

const METHODES_CALCUL: { value: BobinesMethodeCalcul; label: string }[] = [
  { value: 'calepinage', label: 'Calepinage rouleau' },
  { value: 'm2', label: 'Au m²' },
  { value: 'auto', label: 'Auto (calepinage si dispo)' },
];

export default function ParametresBobinesPage() {
  const { draft, patch, save, cancel, reset, dirty, savedAt, isCustom } = useSettingsDraft(
    'bobines',
    defaultBobinesParams,
    { resetConfirmMessage: 'Réinitialiser tous les paramètres Bobines aux valeurs par défaut ?' }
  );

  return (
    <SettingsPageContainer>
      <SettingsHeader
        title="Paramètres Bobines / Étiquettes"
        subtitle="Matériaux adhésifs (vinyle, polyester…), machines, finitions et marges."
      />

      {/* === MATÉRIAUX (avec rouleaux nestés) === */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-xl">Matériaux</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                patch((d) => ({
                  ...d,
                  materiaux: [
                    ...d.materiaux,
                    {
                      id: `materiau_${Date.now()}`,
                      nom: 'Nouveau matériau',
                      type: 'adhesif',
                      methode_calcul: 'calepinage',
                      rouleaux: [{ largeur_mm: 1000, longueur_m: 50, prix_rouleau_ht: 0 }],
                    },
                  ],
                }))
              }
            >
              + Ajouter un matériau
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.materiaux.map((m, mi) => (
            <div key={m.id} className="rounded-md border bg-secondary/20 p-3 space-y-3">
              <div className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-5"
                  value={m.nom}
                  placeholder="Nom du matériau"
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.materiaux];
                      next[mi] = { ...next[mi]!, nom: e.target.value };
                      return { ...d, materiaux: next };
                    })
                  }
                />
                <Input
                  className="col-span-3"
                  value={m.type}
                  placeholder="ex. adhesif"
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.materiaux];
                      next[mi] = { ...next[mi]!, type: e.target.value };
                      return { ...d, materiaux: next };
                    })
                  }
                />
                <Select
                  className="col-span-3"
                  value={m.methode_calcul}
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.materiaux];
                      next[mi] = {
                        ...next[mi]!,
                        methode_calcul: e.target.value as BobinesMethodeCalcul,
                      };
                      return { ...d, materiaux: next };
                    })
                  }
                >
                  {METHODES_CALCUL.map((mc) => (
                    <option key={mc.value} value={mc.value}>
                      {mc.label}
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
                      materiaux: d.materiaux.filter((_, j) => j !== mi),
                    }))
                  }
                  aria-label={`Supprimer ${m.nom}`}
                  disabled={draft.materiaux.length === 1}
                  title={
                    draft.materiaux.length === 1
                      ? 'Au moins un matériau requis'
                      : 'Supprimer le matériau'
                  }
                >
                  ✕
                </Button>
              </div>

              {/* Prix m² (utilisé si méthode = m²) */}
              {(m.methode_calcul === 'm2' || m.methode_calcul === 'auto') && (
                <Field label={`Prix au m² HT (€) — utilisé si méthode "m²"`}>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={m.prix_m2_ht ?? ''}
                    placeholder="Optionnel"
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.materiaux];
                        const raw = e.target.value;
                        next[mi] = {
                          ...next[mi]!,
                          prix_m2_ht: raw === '' ? undefined : Number(raw) || 0,
                        };
                        return { ...d, materiaux: next };
                      })
                    }
                  />
                </Field>
              )}

              {/* Rouleaux disponibles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Rouleaux disponibles
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      patch((d) => {
                        const next = [...d.materiaux];
                        next[mi] = {
                          ...next[mi]!,
                          rouleaux: [
                            ...next[mi]!.rouleaux,
                            { largeur_mm: 1000, longueur_m: 50, prix_rouleau_ht: 0 },
                          ],
                        };
                        return { ...d, materiaux: next };
                      })
                    }
                  >
                    + Rouleau
                  </Button>
                </div>
                {m.rouleaux.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Aucun rouleau. Ce matériau ne supporte pas le calepinage rouleau.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                      <div className="col-span-4">Largeur (mm)</div>
                      <div className="col-span-4">Longueur (m)</div>
                      <div className="col-span-3">Prix HT (€)</div>
                      <div className="col-span-1" />
                    </div>
                    {m.rouleaux.map((r, ri) => (
                      <div key={ri} className="grid grid-cols-12 gap-2 items-center">
                        <Input
                          className="col-span-4"
                          type="number"
                          min={1}
                          step={10}
                          value={r.largeur_mm}
                          onChange={(e) =>
                            patch((d) => {
                              const nextMats = [...d.materiaux];
                              const nextRols = [...nextMats[mi]!.rouleaux];
                              nextRols[ri] = {
                                ...nextRols[ri]!,
                                largeur_mm: Number(e.target.value) || 0,
                              };
                              nextMats[mi] = { ...nextMats[mi]!, rouleaux: nextRols };
                              return { ...d, materiaux: nextMats };
                            })
                          }
                        />
                        <Input
                          className="col-span-4"
                          type="number"
                          min={1}
                          step={5}
                          value={r.longueur_m}
                          onChange={(e) =>
                            patch((d) => {
                              const nextMats = [...d.materiaux];
                              const nextRols = [...nextMats[mi]!.rouleaux];
                              nextRols[ri] = {
                                ...nextRols[ri]!,
                                longueur_m: Number(e.target.value) || 0,
                              };
                              nextMats[mi] = { ...nextMats[mi]!, rouleaux: nextRols };
                              return { ...d, materiaux: nextMats };
                            })
                          }
                        />
                        <Input
                          className="col-span-3"
                          type="number"
                          min={0}
                          step={1}
                          value={r.prix_rouleau_ht}
                          onChange={(e) =>
                            patch((d) => {
                              const nextMats = [...d.materiaux];
                              const nextRols = [...nextMats[mi]!.rouleaux];
                              nextRols[ri] = {
                                ...nextRols[ri]!,
                                prix_rouleau_ht: Number(e.target.value) || 0,
                              };
                              nextMats[mi] = { ...nextMats[mi]!, rouleaux: nextRols };
                              return { ...d, materiaux: nextMats };
                            })
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="col-span-1 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            patch((d) => {
                              const nextMats = [...d.materiaux];
                              nextMats[mi] = {
                                ...nextMats[mi]!,
                                rouleaux: nextMats[mi]!.rouleaux.filter((_, j) => j !== ri),
                              };
                              return { ...d, materiaux: nextMats };
                            })
                          }
                          aria-label="Supprimer ce rouleau"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            💡 Méthode <strong>auto</strong> : calepinage si rouleaux disponibles, sinon m².
          </p>
        </CardContent>
      </Card>

      {/* === MACHINE IMPRESSION === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Machine impression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Nom" className="lg:col-span-3">
              <Input
                value={draft.machine_impression.nom}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    machine_impression: { ...d.machine_impression, nom: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Vitesse (m²/h)">
              <Input
                type="number"
                min={0}
                step={0.5}
                value={draft.machine_impression.vitesse_m2_h}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    machine_impression: {
                      ...d.machine_impression,
                      vitesse_m2_h: Number(e.target.value) || 0,
                    },
                  }))
                }
              />
            </Field>
            <Field label="Taux machine HT (€/h)">
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.machine_impression.taux_horaire_ht}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    machine_impression: {
                      ...d.machine_impression,
                      taux_horaire_ht: Number(e.target.value) || 0,
                    },
                  }))
                }
              />
            </Field>
            <Field label="Taux opérateur HT (€/h)">
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.machine_impression.operateur_taux_horaire_ht}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    machine_impression: {
                      ...d.machine_impression,
                      operateur_taux_horaire_ht: Number(e.target.value) || 0,
                    },
                  }))
                }
              />
            </Field>
            <Field label="Gâches (%)" hint="% de matière perdue">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={draft.machine_impression.gaches_pct}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    machine_impression: {
                      ...d.machine_impression,
                      gaches_pct: Number(e.target.value) || 0,
                    },
                  }))
                }
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* === MACHINE DÉCOUPE === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Machine découpe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Nom" className="lg:col-span-3">
              <Input
                value={draft.machine_decoupe.nom}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    machine_decoupe: { ...d.machine_decoupe, nom: e.target.value },
                  }))
                }
              />
            </Field>
            <Field label="Vitesse (m/min)">
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.machine_decoupe.vitesse_m_min}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    machine_decoupe: {
                      ...d.machine_decoupe,
                      vitesse_m_min: Number(e.target.value) || 0,
                    },
                  }))
                }
              />
            </Field>
            <Field label="Taux machine HT (€/h)">
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.machine_decoupe.taux_horaire_ht}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    machine_decoupe: {
                      ...d.machine_decoupe,
                      taux_horaire_ht: Number(e.target.value) || 0,
                    },
                  }))
                }
              />
            </Field>
            <Field label="Taux opérateur HT (€/h)">
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.machine_decoupe.operateur_taux_horaire_ht}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    machine_decoupe: {
                      ...d.machine_decoupe,
                      operateur_taux_horaire_ht: Number(e.target.value) || 0,
                    },
                  }))
                }
              />
            </Field>
            <Field label="Forfait cliquage HT (€)" hint="Préparation par référence">
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.machine_decoupe.forfait_cliquage_ht}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    machine_decoupe: {
                      ...d.machine_decoupe,
                      forfait_cliquage_ht: Number(e.target.value) || 0,
                    },
                  }))
                }
              />
            </Field>
          </div>
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
                  next[i] = { ...next[i]!, type: e.target.value as BobinesFinitionType };
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
                placeholder="Coût fournisseur"
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
                placeholder="Marge %"
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
      <BobinesScalars params={draft} onPatch={patch} />

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

function BobinesScalars({
  params,
  onPatch,
}: {
  params: BobinesParams;
  onPatch: (updater: (d: BobinesParams) => BobinesParams) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Prix généraux & options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Espace entre étiquettes (mm)"
            hint="Marge inter-étiquettes pour calepinage"
          >
            <Input
              type="number"
              min={0}
              step={0.5}
              value={params.espace_entre_etiquettes_mm}
              onChange={(e) =>
                onPatch((d) => ({
                  ...d,
                  espace_entre_etiquettes_mm: Number(e.target.value) || 0,
                }))
              }
            />
          </Field>
          <Field
            label="Forfait rembobinage HT (€)"
            hint="Ajouté si conditionnement = rouleau applicateur"
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={params.forfait_rembobinage_ht}
              onChange={(e) =>
                onPatch((d) => ({ ...d, forfait_rembobinage_ht: Number(e.target.value) || 0 }))
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
          <Field label="Marge (%)">
            <Input
              type="number"
              min={0}
              step={1}
              value={params.marge_pct}
              onChange={(e) =>
                onPatch((d) => ({ ...d, marge_pct: Number(e.target.value) || 0 }))
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
