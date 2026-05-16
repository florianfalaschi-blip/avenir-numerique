'use client';

import Link from 'next/link';
import type { BobinesFinitionType } from '@avenir/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Select } from '../../calculateurs/_shared/components';
import { defaultBobinesParams } from '@/lib/default-params/bobines';
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

const FINITION_TYPES: { value: BobinesFinitionType; label: string }[] = [
  { value: 'forfait', label: 'Forfait' },
  { value: 'unitaire', label: 'Unitaire (/u)' },
  { value: 'm2', label: 'Au m²' },
];

export default function ParametresBobinesPage() {
  const { draft, patch, save, cancel, reset, dirty, savedAt, isCustom, updatedAt } = useSettingsDraft(
    'bobines',
    defaultBobinesParams,
    { resetConfirmMessage: 'Réinitialiser tous les paramètres Bobines aux valeurs par défaut ?' }
  );

  return (
    <SettingsPageContainer>
      <SettingsHeader
        title="Paramètres Bobines / Étiquettes"
        subtitle="Matériaux adhésifs (vinyle, polyester…), machines, finitions et marges."
        updatedAt={updatedAt}
      />

      {/* === MATÉRIAUX — délégué à la page catalogue partagée === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <CardTitle className="text-sm">Matériaux</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-2.5">
          <p className="text-xs text-muted-foreground">
            Les matériaux Bobines (vinyle, polyester, papier adhésif…) sont gérés dans la page
            partagée avec les matériaux Plaques, avec horodatage de modification.
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
            label: 'Taux machine HT',
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
          {
            key: 'machine_impression.operateur_taux_horaire_ht',
            label: 'Taux opérateur HT',
            suffix: '€/h',
            value: draft.machine_impression.operateur_taux_horaire_ht,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.['machine_impression.operateur_taux_horaire_ht'],
            onChange: (v) =>
              patch((d) => ({
                ...d,
                machine_impression: {
                  ...d.machine_impression,
                  operateur_taux_horaire_ht: Number(v) || 0,
                },
                meta: {
                  ...(d.meta ?? {}),
                  'machine_impression.operateur_taux_horaire_ht': Date.now(),
                },
              })),
          },
          {
            key: 'machine_impression.gaches_pct',
            label: 'Gâches',
            hint: '% de matière perdue',
            suffix: '%',
            value: draft.machine_impression.gaches_pct,
            min: 0,
            step: 0.5,
            modifiedAt: draft.meta?.['machine_impression.gaches_pct'],
            onChange: (v) =>
              patch((d) => ({
                ...d,
                machine_impression: {
                  ...d.machine_impression,
                  gaches_pct: Number(v) || 0,
                },
                meta: { ...(d.meta ?? {}), 'machine_impression.gaches_pct': Date.now() },
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
            key: 'machine_decoupe.vitesse_m_min',
            label: 'Vitesse',
            suffix: 'm/min',
            value: draft.machine_decoupe.vitesse_m_min,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.['machine_decoupe.vitesse_m_min'],
            onChange: (v) =>
              patch((d) => ({
                ...d,
                machine_decoupe: {
                  ...d.machine_decoupe,
                  vitesse_m_min: Number(v) || 0,
                },
                meta: { ...(d.meta ?? {}), 'machine_decoupe.vitesse_m_min': Date.now() },
              })),
          },
          {
            key: 'machine_decoupe.taux_horaire_ht',
            label: 'Taux machine HT',
            suffix: '€/h',
            value: draft.machine_decoupe.taux_horaire_ht,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.['machine_decoupe.taux_horaire_ht'],
            onChange: (v) =>
              patch((d) => ({
                ...d,
                machine_decoupe: {
                  ...d.machine_decoupe,
                  taux_horaire_ht: Number(v) || 0,
                },
                meta: { ...(d.meta ?? {}), 'machine_decoupe.taux_horaire_ht': Date.now() },
              })),
          },
          {
            key: 'machine_decoupe.operateur_taux_horaire_ht',
            label: 'Taux opérateur HT',
            suffix: '€/h',
            value: draft.machine_decoupe.operateur_taux_horaire_ht,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.['machine_decoupe.operateur_taux_horaire_ht'],
            onChange: (v) =>
              patch((d) => ({
                ...d,
                machine_decoupe: {
                  ...d.machine_decoupe,
                  operateur_taux_horaire_ht: Number(v) || 0,
                },
                meta: {
                  ...(d.meta ?? {}),
                  'machine_decoupe.operateur_taux_horaire_ht': Date.now(),
                },
              })),
          },
          {
            key: 'machine_decoupe.forfait_cliquage_ht',
            label: 'Forfait cliquage HT',
            hint: 'Préparation par référence',
            suffix: '€',
            value: draft.machine_decoupe.forfait_cliquage_ht,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.['machine_decoupe.forfait_cliquage_ht'],
            onChange: (v) =>
              patch((d) => ({
                ...d,
                machine_decoupe: {
                  ...d.machine_decoupe,
                  forfait_cliquage_ht: Number(v) || 0,
                },
                meta: { ...(d.meta ?? {}), 'machine_decoupe.forfait_cliquage_ht': Date.now() },
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
                type: 'forfait' as BobinesFinitionType,
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
                    type: e.target.value as BobinesFinitionType,
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
                placeholder="Coût fournisseur"
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
                placeholder="Marge %"
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

      {/* === PRIX GÉNÉRAUX & OPTIONS === */}
      <ScalarsEditor
        title="Prix généraux & options"
        rows={[
          {
            key: 'espace_entre_etiquettes_mm',
            label: 'Espace entre étiquettes',
            hint: 'Marge inter-étiquettes pour calepinage',
            suffix: 'mm',
            value: draft.espace_entre_etiquettes_mm,
            min: 0,
            step: 0.5,
            modifiedAt: draft.meta?.espace_entre_etiquettes_mm,
            onChange: (v) =>
              patch((d) =>
                stampScalar(d, 'espace_entre_etiquettes_mm', {
                  espace_entre_etiquettes_mm: Number(v) || 0,
                })
              ),
          },
          {
            key: 'forfait_rembobinage_ht',
            label: 'Forfait rembobinage HT',
            hint: 'Si conditionnement = rouleau applicateur',
            suffix: '€',
            value: draft.forfait_rembobinage_ht,
            min: 0,
            step: 1,
            modifiedAt: draft.meta?.forfait_rembobinage_ht,
            onChange: (v) =>
              patch((d) =>
                stampScalar(d, 'forfait_rembobinage_ht', {
                  forfait_rembobinage_ht: Number(v) || 0,
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
