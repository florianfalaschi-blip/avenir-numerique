'use client';

import type { RollupParams } from '@avenir/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field } from '../../calculateurs/_shared/components';
import { defaultRollupParams } from '@/lib/default-params/rollup';
import {
  ActionBar,
  CatalogueCard,
  DegressifEditor,
  SettingsHeader,
  SettingsPageContainer,
  useSettingsDraft,
} from '../_shared';

export default function ParametresRollupPage() {
  const { draft, patch, save, cancel, reset, dirty, savedAt, isCustom, updatedAt } = useSettingsDraft(
    'rollup',
    defaultRollupParams,
    { resetConfirmMessage: 'Réinitialiser tous les paramètres Roll-up aux valeurs par défaut ?' }
  );

  return (
    <SettingsPageContainer>
      <SettingsHeader
        title="Paramètres Roll-up"
        subtitle="Bâches, structures, machines, marges et dégressif. Les modifications s’appliquent immédiatement au calculateur après enregistrement."
        updatedAt={updatedAt}
      />

      {/* === BÂCHES === */}
      <CatalogueCard
        title="Bâches"
        items={draft.baches}
        onAdd={() =>
          patch((d) => ({
            ...d,
            baches: [
              ...d.baches,
              { id: `bache_${Date.now()}`, nom: 'Nouvelle bâche', prix_m2_ht: 0 },
            ],
          }))
        }
        onRemove={(i) => patch((d) => ({ ...d, baches: d.baches.filter((_, j) => j !== i) }))}
        minItems={1}
        columns={[
          { label: 'Nom', span: 7 },
          { label: 'Prix /m² HT', span: 4 },
        ]}
        renderRow={(b, i) => (
          <>
            <Input
              className="col-span-7"
              value={b.nom}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.baches];
                  next[i] = { ...next[i]!, nom: e.target.value };
                  return { ...d, baches: next };
                })
              }
            />
            <Input
              className="col-span-4"
              type="number"
              min={0}
              step={0.1}
              value={b.prix_m2_ht}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.baches];
                  next[i] = { ...next[i]!, prix_m2_ht: Number(e.target.value) || 0 };
                  return { ...d, baches: next };
                })
              }
            />
          </>
        )}
      />

      {/* === STRUCTURES === */}
      <CatalogueCard
        title="Structures"
        items={draft.structures}
        onAdd={() =>
          patch((d) => ({
            ...d,
            structures: [
              ...d.structures,
              {
                id: `structure_${Date.now()}`,
                nom: 'Nouvelle structure',
                prix_unitaire_ht: 0,
              },
            ],
          }))
        }
        onRemove={(i) =>
          patch((d) => ({ ...d, structures: d.structures.filter((_, j) => j !== i) }))
        }
        minItems={1}
        columns={[
          { label: 'Nom', span: 7 },
          { label: 'Prix /u HT', span: 4 },
        ]}
        renderRow={(s, i) => (
          <>
            <Input
              className="col-span-7"
              value={s.nom}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.structures];
                  next[i] = { ...next[i]!, nom: e.target.value };
                  return { ...d, structures: next };
                })
              }
            />
            <Input
              className="col-span-4"
              type="number"
              min={0}
              step={1}
              value={s.prix_unitaire_ht}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.structures];
                  next[i] = { ...next[i]!, prix_unitaire_ht: Number(e.target.value) || 0 };
                  return { ...d, structures: next };
                })
              }
            />
          </>
        )}
      />

      {/* === MACHINES === */}
      <CatalogueCard
        title="Machines d’impression"
        items={draft.machines}
        onAdd={() =>
          patch((d) => ({
            ...d,
            machines: [
              ...d.machines,
              {
                id: `machine_${Date.now()}`,
                nom: 'Nouvelle machine',
                vitesse_m2_h: 10,
                taux_horaire_ht: 50,
              },
            ],
          }))
        }
        onRemove={(i) =>
          patch((d) => ({ ...d, machines: d.machines.filter((_, j) => j !== i) }))
        }
        minItems={1}
        columns={[
          { label: 'Nom', span: 5 },
          { label: 'Vitesse (m²/h)', span: 3 },
          { label: 'Taux HT (€/h)', span: 3 },
        ]}
        renderRow={(m, i) => (
          <>
            <Input
              className="col-span-5"
              value={m.nom}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.machines];
                  next[i] = { ...next[i]!, nom: e.target.value };
                  return { ...d, machines: next };
                })
              }
            />
            <Input
              className="col-span-3"
              type="number"
              min={0}
              step={0.5}
              value={m.vitesse_m2_h}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.machines];
                  next[i] = { ...next[i]!, vitesse_m2_h: Number(e.target.value) || 0 };
                  return { ...d, machines: next };
                })
              }
            />
            <Input
              className="col-span-3"
              type="number"
              min={0}
              step={1}
              value={m.taux_horaire_ht}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.machines];
                  next[i] = { ...next[i]!, taux_horaire_ht: Number(e.target.value) || 0 };
                  return { ...d, machines: next };
                })
              }
            />
          </>
        )}
      />

      {/* === PRIX GÉNÉRAUX === */}
      <ScalarsCard params={draft} onPatch={patch} />

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

// ============================================================
// SCALARS CARD spécifique Rollup
// ============================================================

function ScalarsCard({
  params,
  onPatch,
}: {
  params: RollupParams;
  onPatch: (updater: (d: RollupParams) => RollupParams) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Prix généraux</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Frais fixes HT (€)" hint="Préparation, calage, etc.">
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
          <Field label="Marge (%)" hint="Appliquée au coût de revient">
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
              onChange={(e) => onPatch((d) => ({ ...d, tva_pct: Number(e.target.value) || 0 }))}
            />
          </Field>
          <Field
            label="Plancher prix HT (€)"
            hint="Optionnel — le prix HT ne descend jamais en dessous"
            className="md:col-span-2"
          >
            <div className="flex gap-2 items-center">
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

