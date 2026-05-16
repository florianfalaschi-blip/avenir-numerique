'use client';

import Link from 'next/link';
import type { FinitionType } from '@avenir/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Select } from '../../calculateurs/_shared/components';
import { defaultPlaquesParams } from '@/lib/default-params/plaques';
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

const FINITION_TYPES: { value: FinitionType; label: string }[] = [
  { value: 'forfait', label: 'Forfait' },
  { value: 'unitaire', label: 'Unitaire (/u)' },
  { value: 'm2', label: 'Au m²' },
  { value: 'par_oeillet', label: 'Par œillet' },
];

export default function ParametresPlaquesPage() {
  const { draft, patch, save, cancel, reset, dirty, savedAt, isCustom, updatedAt } = useSettingsDraft(
    'plaques',
    defaultPlaquesParams,
    { resetConfirmMessage: 'Réinitialiser tous les paramètres Plaques aux valeurs par défaut ?' }
  );

  return (
    <SettingsPageContainer>
      <SettingsHeader
        title="Paramètres Plaques / Signalétique"
        subtitle="Matériaux (PVC, Forex, Dibond…), machine Mutoh, découpe Zund, finitions et marges."
        updatedAt={updatedAt}
      />

      {/* === MATÉRIAUX (délégué au catalogue partagé) === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <CardTitle className="text-sm">Matériaux</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-2.5">
          <p className="text-xs text-muted-foreground">
            Les matériaux Plaques (PVC, Forex, Dibond, Plexi…) sont gérés dans la page partagée
            avec les matériaux Bobines, avec horodatage de modification.
          </p>
          <Link
            href="/parametres/materiaux"
            className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-primary hover:underline"
          >
            Modifier le catalogue Matériaux
            <span aria-hidden>→</span>
          </Link>
        </CardContent>
      </Card>

      {/* === MACHINE IMPRESSION === */}
      <ScalarsEditor
        title="Machine impression"
        rows={[
          {
            key: 'machine_impression.nom',
            label: 'Nom',
            type: 'text',
            value: draft.machine_impression.nom,
            modifiedAt: draft.meta?.['machine_impression.nom'],
            onChange: (v) =>
              patch((d) => ({
                ...d,
                machine_impression: { ...d.machine_impression, nom: v },
                meta: { ...(d.meta ?? {}), 'machine_impression.nom': Date.now() },
              })),
          },
          {
            key: 'machine_impression.vitesse_m2_h',
            label: 'Vitesse',
            suffix: 'm²/h',
            value: draft.machine_impression.vitesse_m2_h,
            min: 0,
            step: 0.5,
            modifiedAt: draft.meta?.['machine_impression.vitesse_m2_h'],
            onChange: (v) =>
              patch((d) => ({
                ...d,
                machine_impression: {
                  ...d.machine_impression,
                  vitesse_m2_h: Number(v) || 0,
                },
                meta: { ...(d.meta ?? {}), 'machine_impression.vitesse_m2_h': Date.now() },
              })),
          },
          {
            key: 'machine_impression.taux_horaire_ht',
            label: 'Taux HT',
            suffix: '€/h',
            value: draft.machine_impression.taux_horaire_ht,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.['machine_impression.taux_horaire_ht'],
            onChange: (v) =>
              patch((d) => ({
                ...d,
                machine_impression: {
                  ...d.machine_impression,
                  taux_horaire_ht: Number(v) || 0,
                },
                meta: { ...(d.meta ?? {}), 'machine_impression.taux_horaire_ht': Date.now() },
              })),
          },
        ]}
      />

      {/* === MACHINE DÉCOUPE === */}
      <ScalarsEditor
        title="Machine découpe"
        rows={[
          {
            key: 'machine_decoupe.nom',
            label: 'Nom',
            type: 'text',
            value: draft.machine_decoupe.nom,
            modifiedAt: draft.meta?.['machine_decoupe.nom'],
            onChange: (v) =>
              patch((d) => ({
                ...d,
                machine_decoupe: { ...d.machine_decoupe, nom: v },
                meta: { ...(d.meta ?? {}), 'machine_decoupe.nom': Date.now() },
              })),
          },
          {
            key: 'machine_decoupe.prix_metre_lineaire_ht',
            label: 'Prix /m linéaire',
            hint: 'Coût de découpe par mètre linéaire',
            suffix: '€',
            value: draft.machine_decoupe.prix_metre_lineaire_ht,
            min: 0,
            step: 0.1,
            modifiedAt: draft.meta?.['machine_decoupe.prix_metre_lineaire_ht'],
            onChange: (v) =>
              patch((d) => ({
                ...d,
                machine_decoupe: {
                  ...d.machine_decoupe,
                  prix_metre_lineaire_ht: Number(v) || 0,
                },
                meta: {
                  ...(d.meta ?? {}),
                  'machine_decoupe.prix_metre_lineaire_ht': Date.now(),
                },
              })),
          },
          {
            key: 'machine_decoupe.forfait_minimum_ht',
            label: 'Forfait minimum',
            hint: 'Plancher de facturation découpe',
            suffix: '€',
            value: draft.machine_decoupe.forfait_minimum_ht,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.['machine_decoupe.forfait_minimum_ht'],
            onChange: (v) =>
              patch((d) => ({
                ...d,
                machine_decoupe: {
                  ...d.machine_decoupe,
                  forfait_minimum_ht: Number(v) || 0,
                },
                meta: { ...(d.meta ?? {}), 'machine_decoupe.forfait_minimum_ht': Date.now() },
              })),
          },
        ]}
      />

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
                type: 'forfait' as FinitionType,
                prix_ht: 0,
              }),
            ],
          }))
        }
        onRemove={(i) =>
          patch((d) => ({ ...d, finitions: d.finitions.filter((_, j) => j !== i) }))
        }
        columns={[
          { label: 'Nom', span: 5 },
          { label: 'Type', span: 3 },
          { label: 'Prix HT (€)', span: 3 },
        ]}
        renderRow={(f, i) => (
          <>
            <Input
              className="col-span-5"
              value={f.nom}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  finitions: stampRow(d.finitions, i, { nom: e.target.value }),
                }))
              }
            />
            <Select
              className="col-span-3"
              value={f.type}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  finitions: stampRow(d.finitions, i, {
                    type: e.target.value as FinitionType,
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
              className="col-span-3"
              type="number"
              min={0}
              step={0.5}
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
