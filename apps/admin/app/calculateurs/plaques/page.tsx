'use client';

import { useMemo, useState } from 'react';
import { calcPlaques, PlaquesCalcError } from '@avenir/core';
import type { PlaquesInput, PlaquesResult, TailleStandard } from '@avenir/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import {
  BackLink,
  CalcHeader,
  Checkbox,
  Field,
  MoneyRow,
  PriceHighlight,
  ResultSection,
  Row,
  Select,
  SettingsBadge,
  TwoColumns,
  Warnings,
} from '../_shared/components';
import { fmtEur, fmtInt } from '../_shared/format';
import { defaultPlaquesParams } from '@/lib/default-params/plaques';
import { useSettings } from '@/lib/settings';
import { SaveAsDevisCard } from '../_shared/save-as-devis';

const DEFAULT_INPUT: PlaquesInput = {
  quantite: 1,
  dimension_mode: 'standard',
  taille_standard: 'A3',
  materiau_id: 'forex_5mm',
  decoupe_mode: 'pleine_plaque',
  finitions_ids: [],
  bat: false,
};

function compute(
  input: PlaquesInput,
  params: typeof defaultPlaquesParams
): { result: PlaquesResult | null; error: string | null } {
  try {
    return { result: calcPlaques(input, params), error: null };
  } catch (e) {
    if (e instanceof PlaquesCalcError) return { result: null, error: e.message };
    return { result: null, error: 'Erreur inattendue lors du calcul' };
  }
}

export default function PlaquesCalcPage() {
  const { value: params, isCustom } = useSettings('plaques', defaultPlaquesParams);
  const [input, setInput] = useState<PlaquesInput>(DEFAULT_INPUT);
  const outcome = useMemo(() => compute(input, params), [input, params]);

  const hasOeilletFinition = input.finitions_ids.some(
    (id) => params.finitions.find((f) => f.id === id)?.type === 'par_oeillet'
  );

  const toggleFinition = (id: string) => {
    setInput((i) => ({
      ...i,
      finitions_ids: i.finitions_ids.includes(id)
        ? i.finitions_ids.filter((x) => x !== id)
        : [...i.finitions_ids, id],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <BackLink />
        <SettingsBadge slug="plaques" isCustom={isCustom} />
      </div>
      <CalcHeader
        title="Calculateur Plaques / Signalétique"
        subtitle="PVC, Forex, Dibond, Plexi… avec calepinage automatique et découpe Zund."
      />

      <TwoColumns
        form={
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Quantité">
                  <Input
                    type="number"
                    min={1}
                    value={input.quantite}
                    onChange={(e) =>
                      setInput({ ...input, quantite: Math.max(1, Number(e.target.value) || 1) })
                    }
                  />
                </Field>
                <Field label="Option BAT">
                  <Checkbox
                    checked={input.bat}
                    onChange={(bat) => setInput({ ...input, bat })}
                    label={`BAT (${fmtEur(params.bat_prix_ht)})`}
                  />
                </Field>
              </div>

              <Field label="Dimensions">
                <Select
                  value={input.dimension_mode}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      dimension_mode: e.target.value as 'standard' | 'custom',
                    })
                  }
                >
                  <option value="standard">Taille standard</option>
                  <option value="custom">Sur mesure</option>
                </Select>
              </Field>

              {input.dimension_mode === 'standard' ? (
                <Field label="Taille standard">
                  <Select
                    value={input.taille_standard ?? 'A3'}
                    onChange={(e) =>
                      setInput({ ...input, taille_standard: e.target.value as TailleStandard })
                    }
                  >
                    {params.tailles_standards.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id} ({t.largeur_cm} × {t.hauteur_cm} cm)
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Largeur (cm)">
                    <Input
                      type="number"
                      min={1}
                      value={input.largeur_cm ?? 50}
                      onChange={(e) =>
                        setInput({ ...input, largeur_cm: Number(e.target.value) || 0 })
                      }
                    />
                  </Field>
                  <Field label="Hauteur (cm)">
                    <Input
                      type="number"
                      min={1}
                      value={input.hauteur_cm ?? 50}
                      onChange={(e) =>
                        setInput({ ...input, hauteur_cm: Number(e.target.value) || 0 })
                      }
                    />
                  </Field>
                </div>
              )}

              <Field label="Matériau">
                <Select
                  value={input.materiau_id}
                  onChange={(e) => setInput({ ...input, materiau_id: e.target.value })}
                >
                  {params.materiaux.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Type de découpe">
                <Select
                  value={input.decoupe_mode}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      decoupe_mode: e.target.value as 'pleine_plaque' | 'forme',
                    })
                  }
                >
                  <option value="pleine_plaque">Pleine plaque (rectangle)</option>
                  <option value="forme">Forme (longueur manuelle)</option>
                </Select>
              </Field>

              {input.decoupe_mode === 'forme' && (
                <Field
                  label="Longueur de découpe (m)"
                  hint="Estimée par taille du visuel. Le périmètre de pleine plaque est calculé automatiquement."
                >
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={input.longueur_decoupe_forme_m ?? 2}
                    onChange={(e) =>
                      setInput({ ...input, longueur_decoupe_forme_m: Number(e.target.value) || 0 })
                    }
                  />
                </Field>
              )}

              <Field label="Finitions">
                <div className="space-y-2 rounded-md border bg-secondary/30 p-3">
                  {params.finitions.map((f) => (
                    <label key={f.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={input.finitions_ids.includes(f.id)}
                        onChange={() => toggleFinition(f.id)}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                      <span>
                        {f.nom} —{' '}
                        <span className="text-muted-foreground">
                          {fmtEur(f.prix_ht)}{' '}
                          {f.type === 'unitaire'
                            ? '/u'
                            : f.type === 'm2'
                              ? '/m²'
                              : f.type === 'par_oeillet'
                                ? '/œillet'
                                : 'forfait'}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              {hasOeilletFinition && (
                <Field label="Nombre d'œillets (total commande)">
                  <Input
                    type="number"
                    min={0}
                    value={input.nb_oeillets ?? 4}
                    onChange={(e) =>
                      setInput({ ...input, nb_oeillets: Number(e.target.value) || 0 })
                    }
                  />
                </Field>
              )}

              <div className="pt-2">
                <Button variant="outline" onClick={() => setInput(DEFAULT_INPUT)}>
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        }
        result={
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Résultat</CardTitle>
              </CardHeader>
              <CardContent>
                {outcome.error ? (
                  <div className="text-destructive text-sm">⚠️ {outcome.error}</div>
                ) : outcome.result ? (
                  <ResultBlock result={outcome.result} />
                ) : null}
              </CardContent>
            </Card>
            <SaveAsDevisCard
              calculateur="plaques"
              input={input}
              result={outcome.result}
              recap={outcome.result?.recap}
              prixHt={outcome.result?.prix_ht ?? 0}
              prixTtc={outcome.result?.prix_ttc ?? 0}
              quantite={input.quantite}
              hasError={!!outcome.error || !outcome.result}
            />
          </div>
        }
      />
    </div>
  );
}

function ResultBlock({ result }: { result: PlaquesResult }) {
  return (
    <div className="space-y-4">
      <ResultSection title="Dimensions & calepinage">
        <Row
          label="Format fini"
          value={`${result.largeur_finale_cm.toFixed(1)} × ${result.hauteur_finale_cm.toFixed(1)} cm`}
        />
        <Row
          label="Surface unitaire"
          value={`${result.surface_unitaire_m2.toFixed(4)} m²`}
        />
        <Row
          label="Format brut choisi"
          value={`${result.calepinage.format_brut_largeur_cm} × ${result.calepinage.format_brut_hauteur_cm} cm`}
        />
        <Row label="Poses / format brut" value={fmtInt(result.calepinage.nb_poses_par_format)} />
        <Row label="Nb formats bruts achetés" value={fmtInt(result.calepinage.nb_formats_brut)} />
        {result.calepinage.rotation_appliquee && (
          <Row label="Rotation 90°" value="appliquée" />
        )}
      </ResultSection>

      <hr />

      <ResultSection title="Coûts">
        <MoneyRow label="Matière (calepinage)" value={result.calepinage.cout_matiere_ht} />
        <MoneyRow label="Impression" value={result.cout_impression_ht} />
        <MoneyRow label="Découpe" value={result.cout_decoupe_ht} />
        <MoneyRow label="Finitions" value={result.cout_finitions_ht} />
        <MoneyRow label="Frais fixes" value={result.frais_fixes_ht} />
        {result.cout_bat_ht > 0 && <MoneyRow label="BAT" value={result.cout_bat_ht} />}
        <MoneyRow label="Revient" value={result.cout_revient_ht} bold />
      </ResultSection>

      <hr />

      <ResultSection title="Marge & remise">
        <MoneyRow label={`Marge ${result.marge_pct} %`} value={result.prix_ht_brut} />
        {result.remise_pct > 0 && (
          <Row label={`Dégressif -${result.remise_pct} %`} value="appliqué" />
        )}
      </ResultSection>

      <PriceHighlight
        prixHt={result.prix_ht}
        prixTtc={result.prix_ttc}
        tvaPct={result.tva_pct}
      />

      <Warnings items={result.warnings} />
    </div>
  );
}
