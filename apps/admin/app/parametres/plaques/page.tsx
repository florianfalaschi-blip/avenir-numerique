'use client';

import Link from 'next/link';
import type { FinitionType, PlaquesParams } from '@avenir/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field, Select } from '../../calculateurs/_shared/components';
import { defaultPlaquesParams } from '@/lib/default-params/plaques';
import {
  ActionBar,
  CatalogueCard,
  DegressifEditor,
  SettingsHeader,
  SettingsPageContainer,
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

      {/* === MATÉRIAUX (avec formats d'achat nestés) === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Matériaux</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les matériaux Plaques (PVC, Forex, Dibond, Plexi…) sont gérés dans la page partagée
            avec les matériaux Bobines, avec horodatage de modification.
          </p>
          <Link
            href="/parametres/materiaux"
            className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:underline"
          >
            Modifier le catalogue Matériaux
            <span aria-hidden>→</span>
          </Link>
        </CardContent>
      </Card>

      {/* === MACHINE IMPRESSION === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Machine impression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Nom" className="md:col-span-3">
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
            <Field label="Taux HT (€/h)">
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
          </div>
        </CardContent>
      </Card>

      {/* === MACHINE DÉCOUPE === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Machine découpe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Nom" className="md:col-span-3">
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
            <Field label="Prix /m linéaire (€)" hint="Coût de découpe par mètre linéaire">
              <Input
                type="number"
                min={0}
                step={0.1}
                value={draft.machine_decoupe.prix_metre_lineaire_ht}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    machine_decoupe: {
                      ...d.machine_decoupe,
                      prix_metre_lineaire_ht: Number(e.target.value) || 0,
                    },
                  }))
                }
              />
            </Field>
            <Field label="Forfait minimum (€)" hint="Plancher de facturation découpe">
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.machine_decoupe.forfait_minimum_ht}
                onChange={(e) =>
                  patch((d) => ({
                    ...d,
                    machine_decoupe: {
                      ...d.machine_decoupe,
                      forfait_minimum_ht: Number(e.target.value) || 0,
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
              },
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
                patch((d) => {
                  const next = [...d.finitions];
                  next[i] = { ...next[i]!, nom: e.target.value };
                  return { ...d, finitions: next };
                })
              }
            />
            <Select
              className="col-span-3"
              value={f.type}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.finitions];
                  next[i] = { ...next[i]!, type: e.target.value as FinitionType };
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
              className="col-span-3"
              type="number"
              min={0}
              step={0.5}
              value={f.prix_ht}
              onChange={(e) =>
                patch((d) => {
                  const next = [...d.finitions];
                  next[i] = { ...next[i]!, prix_ht: Number(e.target.value) || 0 };
                  return { ...d, finitions: next };
                })
              }
            />
          </>
        )}
      />

      {/* === SCALARS === */}
      <PlaquesScalars params={draft} onPatch={patch} />

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

function PlaquesScalars({
  params,
  onPatch,
}: {
  params: PlaquesParams;
  onPatch: (updater: (d: PlaquesParams) => PlaquesParams) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Prix généraux</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
