'use client';

import { useMemo, useState } from 'react';
import { calcFlyers, FlyersCalcError } from '@avenir/core';
import type {
  FlyersInput,
  FlyersResult,
  FlyersTailleStandard,
  RectoVerso,
  TechnoMode,
} from '@avenir/core';
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
import { defaultFlyersParams } from '@/lib/default-params/flyers';
import { useSettings } from '@/lib/settings';

const DEFAULT_INPUT: FlyersInput = {
  quantite: 100,
  dimension_mode: 'standard',
  taille_standard: 'A5',
  papier_id: 'couche_brillant_135',
  recto_verso: 'rv',
  techno_mode: 'auto',
  finitions_ids: [],
  bat: false,
};

function compute(
  input: FlyersInput,
  params: typeof defaultFlyersParams
): { result: FlyersResult | null; error: string | null } {
  try {
    return { result: calcFlyers(input, params), error: null };
  } catch (e) {
    if (e instanceof FlyersCalcError) return { result: null, error: e.message };
    return { result: null, error: 'Erreur inattendue lors du calcul' };
  }
}

export default function FlyersCalcPage() {
  const { value: params, isCustom } = useSettings('flyers', defaultFlyersParams);
  const [input, setInput] = useState<FlyersInput>(DEFAULT_INPUT);
  const outcome = useMemo(() => compute(input, params), [input, params]);

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
        <SettingsBadge slug="flyers" isCustom={isCustom} />
      </div>
      <CalcHeader
        title="Calculateur Flyers / Affiches"
        subtitle="Choix techno auto, sélection machine la moins chère, pelliculage par face."
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
                    value={input.taille_standard ?? 'A5'}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        taille_standard: e.target.value as FlyersTailleStandard,
                      })
                    }
                  >
                    {params.formats_standards.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id} ({t.largeur_mm} × {t.hauteur_mm} mm)
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Largeur (mm)">
                    <Input
                      type="number"
                      min={1}
                      value={input.largeur_mm ?? 148}
                      onChange={(e) =>
                        setInput({ ...input, largeur_mm: Number(e.target.value) || 0 })
                      }
                    />
                  </Field>
                  <Field label="Hauteur (mm)">
                    <Input
                      type="number"
                      min={1}
                      value={input.hauteur_mm ?? 210}
                      onChange={(e) =>
                        setInput({ ...input, hauteur_mm: Number(e.target.value) || 0 })
                      }
                    />
                  </Field>
                </div>
              )}

              <Field label="Papier">
                <Select
                  value={input.papier_id}
                  onChange={(e) => setInput({ ...input, papier_id: e.target.value })}
                >
                  {params.papiers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} ({p.grammage} g)
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Recto / verso">
                  <Select
                    value={input.recto_verso}
                    onChange={(e) =>
                      setInput({ ...input, recto_verso: e.target.value as RectoVerso })
                    }
                  >
                    <option value="recto">Recto seul</option>
                    <option value="rv">Recto-verso</option>
                  </Select>
                </Field>
                <Field
                  label="Techno"
                  hint={`Seuil offset : ${params.seuil_offset_quantite_min} ex.`}
                >
                  <Select
                    value={input.techno_mode}
                    onChange={(e) =>
                      setInput({ ...input, techno_mode: e.target.value as TechnoMode })
                    }
                  >
                    <option value="auto">Auto (selon quantité)</option>
                    <option value="numerique">Numérique forcé</option>
                    <option value="offset">Offset forcé</option>
                  </Select>
                </Field>
              </div>

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
                        {f.nom}
                        {f.sous_traite && (
                          <span className="text-xs text-muted-foreground"> · sous-traité</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <div className="pt-2">
                <Button variant="outline" onClick={() => setInput(DEFAULT_INPUT)}>
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        }
        result={
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
        }
      />
    </div>
  );
}

function ResultBlock({ result }: { result: FlyersResult }) {
  return (
    <div className="space-y-4">
      <ResultSection title="Dimensions & techno">
        <Row
          label="Format fini"
          value={`${result.largeur_finale_mm} × ${result.hauteur_finale_mm} mm`}
        />
        <Row
          label="Techno"
          value={`${result.techno_choisie}${result.techno_switch_auto ? ' (switch auto)' : ''}`}
        />
        <Row label="Machine" value={result.impression.machine_nom} />
      </ResultSection>

      <hr />

      <ResultSection title="Calepinage">
        <Row
          label="Format papier"
          value={`${result.impression.format_papier_largeur_mm} × ${result.impression.format_papier_hauteur_mm} mm`}
        />
        <Row label="Poses / feuille" value={fmtInt(result.impression.nb_poses_par_feuille)} />
        <Row label="Feuilles (brut)" value={fmtInt(result.impression.nb_feuilles_brut)} />
        <Row
          label="Feuilles (avec gâches)"
          value={fmtInt(result.impression.nb_feuilles_avec_gaches)}
        />
      </ResultSection>

      <hr />

      <ResultSection title="Coûts">
        <MoneyRow label="Papier" value={result.impression.cout_papier_ht} />
        <MoneyRow label="Machine" value={result.impression.cout_machine_ht} />
        <MoneyRow label="Opérateur" value={result.impression.cout_operateur_ht} />
        <MoneyRow label="Finitions" value={result.cout_finitions_ht} />
        <MoneyRow label="Frais fixes" value={result.frais_fixes_ht} />
        {result.cout_bat_ht > 0 && <MoneyRow label="BAT" value={result.cout_bat_ht} />}
        <MoneyRow label="Revient" value={result.cout_revient_ht} bold />
      </ResultSection>

      <hr />

      <ResultSection title="Marge & remise">
        <MoneyRow
          label={`Marge ${result.marge_pct} % (${result.techno_choisie})`}
          value={result.prix_ht_brut}
        />
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
