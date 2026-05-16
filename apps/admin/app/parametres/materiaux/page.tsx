'use client';

import type {
  BobinesMethodeCalcul,
  BobinesMateriauConfig,
  MateriauConfig,
  PlaquesParams,
  BobinesParams,
} from '@avenir/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Select } from '../../calculateurs/_shared/components';
import { defaultPlaquesParams } from '@/lib/default-params/plaques';
import { defaultBobinesParams } from '@/lib/default-params/bobines';
import {
  ActionBar,
  SettingsHeader,
  SettingsPageContainer,
  fmtModifiedShort,
  useSettingsDraft,
} from '../_shared';

const METHODES_CALCUL: { value: BobinesMethodeCalcul; label: string }[] = [
  { value: 'calepinage', label: 'Calepinage rouleau' },
  { value: 'm2', label: 'Au m²' },
  { value: 'auto', label: 'Auto (calepinage si dispo)' },
];

/** Met à jour un matériau Plaques et stamp le lastModifiedAt. */
function updateMatPlaques(
  list: MateriauConfig[],
  index: number,
  changes: Partial<MateriauConfig>
): MateriauConfig[] {
  const next = [...list];
  next[index] = { ...next[index]!, ...changes, lastModifiedAt: Date.now() };
  return next;
}

/** Met à jour un matériau Bobines et stamp le lastModifiedAt. */
function updateMatBobines(
  list: BobinesMateriauConfig[],
  index: number,
  changes: Partial<BobinesMateriauConfig>
): BobinesMateriauConfig[] {
  const next = [...list];
  next[index] = { ...next[index]!, ...changes, lastModifiedAt: Date.now() };
  return next;
}

export default function ParametresMateriauxPage() {
  // Deux drafts indépendants : Plaques materiaux vs Bobines materiaux
  const plaques = useSettingsDraft('plaques', defaultPlaquesParams);
  const bobines = useSettingsDraft('bobines', defaultBobinesParams);

  const dirty = plaques.dirty || bobines.dirty;
  const isCustom = plaques.isCustom || bobines.isCustom;
  // Last savedAt = max of the two
  const savedAt = Math.max(plaques.savedAt ?? 0, bobines.savedAt ?? 0) || null;

  const handleSave = () => {
    if (plaques.dirty) plaques.save();
    if (bobines.dirty) bobines.save();
  };
  const handleCancel = () => {
    plaques.cancel();
    bobines.cancel();
  };
  const handleReset = () => {
    if (
      confirm(
        'Réinitialiser TOUS les matériaux (Plaques ET Bobines) aux valeurs par défaut ?'
      )
    ) {
      // useSettingsDraft.reset() has its own confirm — we bypass by calling
      // saveSettings/resetSettings via the underlying useSettings. Simplest :
      // utiliser reset() qui demande confirmation, mais l'utilisateur a déjà
      // confirmé. On laisse les deux confirms — accepté car action destructive.
      plaques.reset();
      bobines.reset();
    }
  };

  return (
    <SettingsPageContainer>
      <SettingsHeader
        title="Catalogue Matériaux"
        subtitle="Matériaux Plaques (PVC, Forex, Dibond…) et Bobines (vinyle, polyester…). Horodatage par matériau."
        updatedAt={
          // Date max entre plaques et bobines
          [plaques.updatedAt, bobines.updatedAt]
            .filter((d): d is string => Boolean(d))
            .reduce<string | null>((a, b) => (a === null || b > a ? b : a), null)
        }
      />

      {/* === MATÉRIAUX PLAQUES === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm">
              Matériaux Plaques ({plaques.draft.materiaux.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={() =>
                plaques.patch((d: PlaquesParams) => ({
                  ...d,
                  materiaux: [
                    ...d.materiaux,
                    {
                      id: `materiau_${Date.now()}`,
                      nom: 'Nouveau matériau',
                      formats_achat: [
                        { largeur_cm: 100, hauteur_cm: 100, prix_unite_ht: 0 },
                      ],
                      lastModifiedAt: Date.now(),
                    },
                  ],
                }))
              }
            >
              + Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-2.5 pt-0 space-y-2">
          {plaques.draft.materiaux.map((m, mi) => (
            <div
              key={m.id}
              className="rounded-md border bg-secondary/20 p-2.5 space-y-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80"
            >
              <div className="grid grid-cols-12 gap-1.5 items-center">
                <Input
                  className="col-span-8"
                  value={m.nom}
                  placeholder="Nom"
                  onChange={(e) =>
                    plaques.patch((d) => ({
                      ...d,
                      materiaux: updateMatPlaques(d.materiaux, mi, { nom: e.target.value }),
                    }))
                  }
                />
                <span
                  className="col-span-3 text-[10px] text-muted-foreground/70 whitespace-nowrap tabular-nums text-right"
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
                  className="col-span-1 h-7 w-7 text-muted-foreground hover:text-destructive justify-self-end"
                  onClick={() =>
                    plaques.patch((d) => ({
                      ...d,
                      materiaux: d.materiaux.filter((_, j) => j !== mi),
                    }))
                  }
                  aria-label={`Supprimer ${m.nom}`}
                  disabled={plaques.draft.materiaux.length === 1}
                  title={
                    plaques.draft.materiaux.length === 1
                      ? 'Au moins un matériau requis'
                      : 'Supprimer'
                  }
                >
                  ✕
                </Button>
              </div>

              {/* Fournisseur Plaques */}
              <div className="flex items-center gap-2">
                <label className="shrink-0 w-24">Fournisseur</label>
                <Input
                  className="max-w-md"
                  value={m.fournisseur ?? ''}
                  placeholder="ex. 3A Composites, Evonik, Bachmann…"
                  onChange={(e) =>
                    plaques.patch((d) => ({
                      ...d,
                      materiaux: updateMatPlaques(d.materiaux, mi, {
                        fournisseur: e.target.value === '' ? undefined : e.target.value,
                      }),
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                    Formats d&apos;achat
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() =>
                      plaques.patch((d) => ({
                        ...d,
                        materiaux: updateMatPlaques(d.materiaux, mi, {
                          formats_achat: [
                            ...d.materiaux[mi]!.formats_achat,
                            { largeur_cm: 100, hauteur_cm: 100, prix_unite_ht: 0 },
                          ],
                        }),
                      }))
                    }
                  >
                    + Format
                  </Button>
                </div>
                <div className="grid grid-cols-12 gap-1.5 text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wide px-1">
                  <div className="col-span-4">Largeur (cm)</div>
                  <div className="col-span-4">Hauteur (cm)</div>
                  <div className="col-span-3">Prix HT (€)</div>
                  <div className="col-span-1" />
                </div>
                {m.formats_achat.map((f, fi) => (
                  <div key={fi} className="grid grid-cols-12 gap-1.5 items-center">
                    <Input
                      className="col-span-4"
                      type="number"
                      min={1}
                      step={1}
                      value={f.largeur_cm}
                      onChange={(e) =>
                        plaques.patch((d) => {
                          const fmts = [...d.materiaux[mi]!.formats_achat];
                          fmts[fi] = { ...fmts[fi]!, largeur_cm: Number(e.target.value) || 0 };
                          return {
                            ...d,
                            materiaux: updateMatPlaques(d.materiaux, mi, {
                              formats_achat: fmts,
                            }),
                          };
                        })
                      }
                    />
                    <Input
                      className="col-span-4"
                      type="number"
                      min={1}
                      step={1}
                      value={f.hauteur_cm}
                      onChange={(e) =>
                        plaques.patch((d) => {
                          const fmts = [...d.materiaux[mi]!.formats_achat];
                          fmts[fi] = { ...fmts[fi]!, hauteur_cm: Number(e.target.value) || 0 };
                          return {
                            ...d,
                            materiaux: updateMatPlaques(d.materiaux, mi, {
                              formats_achat: fmts,
                            }),
                          };
                        })
                      }
                    />
                    <Input
                      className="col-span-3"
                      type="number"
                      min={0}
                      step={0.5}
                      value={f.prix_unite_ht}
                      onChange={(e) =>
                        plaques.patch((d) => {
                          const fmts = [...d.materiaux[mi]!.formats_achat];
                          fmts[fi] = {
                            ...fmts[fi]!,
                            prix_unite_ht: Number(e.target.value) || 0,
                          };
                          return {
                            ...d,
                            materiaux: updateMatPlaques(d.materiaux, mi, {
                              formats_achat: fmts,
                            }),
                          };
                        })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="col-span-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        plaques.patch((d) => ({
                          ...d,
                          materiaux: updateMatPlaques(d.materiaux, mi, {
                            formats_achat: d.materiaux[mi]!.formats_achat.filter(
                              (_, j) => j !== fi
                            ),
                          }),
                        }))
                      }
                      aria-label="Supprimer ce format"
                      disabled={m.formats_achat.length === 1}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* === MATÉRIAUX BOBINES === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm">
              Matériaux Bobines ({bobines.draft.materiaux.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={() =>
                bobines.patch((d: BobinesParams) => ({
                  ...d,
                  materiaux: [
                    ...d.materiaux,
                    {
                      id: `materiau_${Date.now()}`,
                      nom: 'Nouveau matériau',
                      type: 'adhesif',
                      methode_calcul: 'calepinage',
                      rouleaux: [{ largeur_mm: 1000, longueur_m: 50, prix_rouleau_ht: 0 }],
                      lastModifiedAt: Date.now(),
                    },
                  ],
                }))
              }
            >
              + Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-2.5 pt-0 space-y-2">
          {bobines.draft.materiaux.map((m, mi) => (
            <div
              key={m.id}
              className="rounded-md border bg-secondary/20 p-2.5 space-y-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80"
            >
              <div className="grid grid-cols-12 gap-1.5 items-center">
                <Input
                  className="col-span-4"
                  value={m.nom}
                  placeholder="Nom"
                  onChange={(e) =>
                    bobines.patch((d) => ({
                      ...d,
                      materiaux: updateMatBobines(d.materiaux, mi, { nom: e.target.value }),
                    }))
                  }
                />
                <Input
                  className="col-span-2"
                  value={m.type}
                  placeholder="type"
                  onChange={(e) =>
                    bobines.patch((d) => ({
                      ...d,
                      materiaux: updateMatBobines(d.materiaux, mi, { type: e.target.value }),
                    }))
                  }
                />
                <Select
                  className="col-span-2"
                  value={m.methode_calcul}
                  onChange={(e) =>
                    bobines.patch((d) => ({
                      ...d,
                      materiaux: updateMatBobines(d.materiaux, mi, {
                        methode_calcul: e.target.value as BobinesMethodeCalcul,
                      }),
                    }))
                  }
                >
                  {METHODES_CALCUL.map((mc) => (
                    <option key={mc.value} value={mc.value}>
                      {mc.label}
                    </option>
                  ))}
                </Select>
                <span
                  className="col-span-3 text-[10px] text-muted-foreground/70 whitespace-nowrap tabular-nums text-right"
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
                  className="col-span-1 h-7 w-7 text-muted-foreground hover:text-destructive justify-self-end"
                  onClick={() =>
                    bobines.patch((d) => ({
                      ...d,
                      materiaux: d.materiaux.filter((_, j) => j !== mi),
                    }))
                  }
                  aria-label={`Supprimer ${m.nom}`}
                  disabled={bobines.draft.materiaux.length === 1}
                  title={
                    bobines.draft.materiaux.length === 1
                      ? 'Au moins un matériau requis'
                      : 'Supprimer'
                  }
                >
                  ✕
                </Button>
              </div>

              {/* Fournisseur Bobines */}
              <div className="flex items-center gap-2">
                <label className="shrink-0 w-24">Fournisseur</label>
                <Input
                  className="max-w-md"
                  value={m.fournisseur ?? ''}
                  placeholder="ex. Avery Dennison, Ritrama, Mactac…"
                  onChange={(e) =>
                    bobines.patch((d) => ({
                      ...d,
                      materiaux: updateMatBobines(d.materiaux, mi, {
                        fournisseur: e.target.value === '' ? undefined : e.target.value,
                      }),
                    }))
                  }
                />
              </div>

              {/* Prix m² conditionnel */}
              {(m.methode_calcul === 'm2' || m.methode_calcul === 'auto') && (
                <div className="flex items-center gap-2">
                  <label className="shrink-0 w-24 normal-case tracking-normal text-[10px] text-muted-foreground/80">
                    Prix au m² HT (€)
                  </label>
                  <Input
                    className="max-w-[8rem]"
                    type="number"
                    min={0}
                    step={0.1}
                    value={m.prix_m2_ht ?? ''}
                    placeholder="Optionnel"
                    onChange={(e) =>
                      bobines.patch((d) => {
                        const raw = e.target.value;
                        return {
                          ...d,
                          materiaux: updateMatBobines(d.materiaux, mi, {
                            prix_m2_ht: raw === '' ? undefined : Number(raw) || 0,
                          }),
                        };
                      })
                    }
                  />
                  <span className="text-[10px] text-muted-foreground/70">
                    utilisé si méthode « m² »
                  </span>
                </div>
              )}

              {/* Rouleaux */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                    Rouleaux disponibles
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() =>
                      bobines.patch((d) => ({
                        ...d,
                        materiaux: updateMatBobines(d.materiaux, mi, {
                          rouleaux: [
                            ...d.materiaux[mi]!.rouleaux,
                            { largeur_mm: 1000, longueur_m: 50, prix_rouleau_ht: 0 },
                          ],
                        }),
                      }))
                    }
                  >
                    + Rouleau
                  </Button>
                </div>
                {m.rouleaux.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">
                    Aucun rouleau. Ce matériau ne supporte pas le calepinage rouleau.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-12 gap-1.5 text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wide px-1">
                      <div className="col-span-4">Largeur (mm)</div>
                      <div className="col-span-4">Longueur (m)</div>
                      <div className="col-span-3">Prix HT (€)</div>
                      <div className="col-span-1" />
                    </div>
                    {m.rouleaux.map((r, ri) => (
                      <div key={ri} className="grid grid-cols-12 gap-1.5 items-center">
                        <Input
                          className="col-span-4"
                          type="number"
                          min={1}
                          step={10}
                          value={r.largeur_mm}
                          onChange={(e) =>
                            bobines.patch((d) => {
                              const rols = [...d.materiaux[mi]!.rouleaux];
                              rols[ri] = {
                                ...rols[ri]!,
                                largeur_mm: Number(e.target.value) || 0,
                              };
                              return {
                                ...d,
                                materiaux: updateMatBobines(d.materiaux, mi, { rouleaux: rols }),
                              };
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
                            bobines.patch((d) => {
                              const rols = [...d.materiaux[mi]!.rouleaux];
                              rols[ri] = {
                                ...rols[ri]!,
                                longueur_m: Number(e.target.value) || 0,
                              };
                              return {
                                ...d,
                                materiaux: updateMatBobines(d.materiaux, mi, { rouleaux: rols }),
                              };
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
                            bobines.patch((d) => {
                              const rols = [...d.materiaux[mi]!.rouleaux];
                              rols[ri] = {
                                ...rols[ri]!,
                                prix_rouleau_ht: Number(e.target.value) || 0,
                              };
                              return {
                                ...d,
                                materiaux: updateMatBobines(d.materiaux, mi, { rouleaux: rols }),
                              };
                            })
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="col-span-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            bobines.patch((d) => ({
                              ...d,
                              materiaux: updateMatBobines(d.materiaux, mi, {
                                rouleaux: d.materiaux[mi]!.rouleaux.filter((_, j) => j !== ri),
                              }),
                            }))
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
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground">
        💡 Le timestamp <em>Modifié</em> se met à jour automatiquement quand tu changes un champ.
        Il n&apos;est persisté qu&apos;après <strong>Enregistrer</strong>. Le bouton{' '}
        <em>Annuler</em> revient à la version sauvegardée.
      </p>

      <ActionBar
        dirty={dirty}
        isCustom={isCustom}
        savedAt={savedAt}
        onSave={handleSave}
        onCancel={handleCancel}
        onReset={handleReset}
      />
    </SettingsPageContainer>
  );
}
