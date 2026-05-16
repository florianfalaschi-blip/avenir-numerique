'use client';

import { Button, Input } from '@avenir/ui';
import { defaultRollupParams } from '@/lib/default-params/rollup';
import {
  ActionBar,
  CatalogueCard,
  DegressifEditor,
  ScalarsEditor,
  SettingsHeader,
  SettingsPageContainer,
  stampRow,
  stampScalar,
  stamped,
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
        subtitle="Bâches, structures, machines, marges et dégressif."
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
              stamped({ id: `bache_${Date.now()}`, nom: 'Nouvelle bâche', prix_m2_ht: 0 }),
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
                patch((d) => ({ ...d, baches: stampRow(d.baches, i, { nom: e.target.value }) }))
              }
            />
            <Input
              className="col-span-4"
              type="number"
              min={0}
              step={0.1}
              value={b.prix_m2_ht}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  baches: stampRow(d.baches, i, { prix_m2_ht: Number(e.target.value) || 0 }),
                }))
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
              stamped({
                id: `structure_${Date.now()}`,
                nom: 'Nouvelle structure',
                prix_unitaire_ht: 0,
              }),
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
                patch((d) => ({
                  ...d,
                  structures: stampRow(d.structures, i, { nom: e.target.value }),
                }))
              }
            />
            <Input
              className="col-span-4"
              type="number"
              min={0}
              step={1}
              value={s.prix_unitaire_ht}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  structures: stampRow(d.structures, i, {
                    prix_unitaire_ht: Number(e.target.value) || 0,
                  }),
                }))
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
              stamped({
                id: `machine_${Date.now()}`,
                nom: 'Nouvelle machine',
                vitesse_m2_h: 10,
                taux_horaire_ht: 50,
              }),
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
                patch((d) => ({
                  ...d,
                  machines: stampRow(d.machines, i, { nom: e.target.value }),
                }))
              }
            />
            <Input
              className="col-span-3"
              type="number"
              min={0}
              step={0.5}
              value={m.vitesse_m2_h}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  machines: stampRow(d.machines, i, {
                    vitesse_m2_h: Number(e.target.value) || 0,
                  }),
                }))
              }
            />
            <Input
              className="col-span-3"
              type="number"
              min={0}
              step={1}
              value={m.taux_horaire_ht}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  machines: stampRow(d.machines, i, {
                    taux_horaire_ht: Number(e.target.value) || 0,
                  }),
                }))
              }
            />
          </>
        )}
      />

      {/* === PRIX GÉNÉRAUX === */}
      <ScalarsEditor
        title="Prix généraux"
        rows={[
          {
            key: 'frais_fixes_ht',
            label: 'Frais fixes HT',
            hint: 'Préparation, calage, etc.',
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
            key: 'marge_pct',
            label: 'Marge',
            hint: 'Appliquée au coût de revient',
            suffix: '%',
            value: draft.marge_pct,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.marge_pct,
            onChange: (v) =>
              patch((d) => stampScalar(d, 'marge_pct', { marge_pct: Number(v) || 0 })),
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
