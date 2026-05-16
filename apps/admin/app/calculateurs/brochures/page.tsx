'use client';

import { useMemo, useState } from 'react';
import { calcBrochures, BrochuresCalcError } from '@avenir/core';
import type {
  BrochuresInput,
  BrochuresResult,
  BrochuresTailleStandard,
  BrochuresCouleur,
  BrochuresTechnoMode,
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
import { defaultBrochuresParams } from '@/lib/default-params/brochures';
import { useSettings } from '@/lib/settings';

const DEFAULT_INPUT: BrochuresInput = {
  quantite: 100,
  nb_pages: 16,
  dimension_mode: 'standard',
  taille_standard: 'A5',
  reliure_id: 'agrafe_std',
  papier_interieur_id: 'couche_135',
  papier_couverture_id: 'couverture_300',
  couleur_interieur: 'quadri',
  couleur_couverture: 'quadri',
  techno_mode_interieur: 'auto',
  techno_mode_couverture: 'auto',
  finitions_ids: [],
  bat: false,
};

function compute(
  input: BrochuresInput,
  params: typeof defaultBrochuresParams
): {
  result: BrochuresResult | null;
  error: string | null;
} {
  try {
    return { result: calcBrochures(input, params), error: null };
  } catch (e) {
    if (e instanceof BrochuresCalcError) return { result: null, error: e.message };
    return { result: null, error: 'Erreur inattendue lors du calcul' };
  }
}

export default function BrochuresCalcPage() {
  const { value: params, isCustom } = useSettings('brochures', defaultBrochuresParams);
  const [input, setInput] = useState<BrochuresInput>(DEFAULT_INPUT);
  const outcome = useMemo(() => compute(input, params), [input, params]);

  const currentReliure = params.reliures.find((r) => r.id === input.reliure_id);
  const reliureHint = currentReliure
    ? `Multiple de ${currentReliure.pages_multiple} pages, entre ${currentReliure.pages_min} et ${currentReliure.pages_max}`
    : undefined;

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
        <SettingsBadge slug="brochures" isCustom={isCustom} />
      </div>
      <CalcHeader
        title="Calculateur Brochures"
        subtitle="Intérieur + couverture séparés, 4 reliures, pliage automatique, marge prorata techno."
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
                <Field label="Nombre de pages" hint={reliureHint}>
                  <Input
                    type="number"
                    min={4}
                    value={input.nb_pages}
                    onChange={(e) =>
                      setInput({ ...input, nb_pages: Math.max(4, Number(e.target.value) || 4) })
                    }
                  />
                </Field>
              </div>

              <Field label="Reliure">
                <Select
                  value={input.reliure_id}
                  onChange={(e) => setInput({ ...input, reliure_id: e.target.value })}
                >
                  {params.reliures.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nom}
                    </option>
                  ))}
                </Select>
              </Field>

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
                        taille_standard: e.target.value as BrochuresTailleStandard,
                      })
                    }
                  >
                    {params.formats_standards.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id.replace('_paysage', ' paysage').replace('_carre', ' carré')} (
                        {t.largeur_mm} × {t.hauteur_mm} mm)
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

              {/* === INTÉRIEUR === */}
              <div className="rounded-md border bg-secondary/20 p-3 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Intérieur
                </div>
                <Field label="Papier intérieur">
                  <Select
                    value={input.papier_interieur_id}
                    onChange={(e) =>
                      setInput({ ...input, papier_interieur_id: e.target.value })
                    }
                  >
                    {params.papiers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom} ({p.grammage} g)
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Couleur">
                    <Select
                      value={input.couleur_interieur}
                      onChange={(e) =>
                        setInput({
                          ...input,
                          couleur_interieur: e.target.value as BrochuresCouleur,
                        })
                      }
                    >
                      <option value="quadri">Quadri (4 couleurs)</option>
                      <option value="noir">Noir seul</option>
                    </Select>
                  </Field>
                  <Field label="Techno">
                    <Select
                      value={input.techno_mode_interieur}
                      onChange={(e) =>
                        setInput({
                          ...input,
                          techno_mode_interieur: e.target.value as BrochuresTechnoMode,
                        })
                      }
                    >
                      <option value="auto">Auto</option>
                      <option value="numerique">Numérique</option>
                      <option value="offset">Offset</option>
                    </Select>
                  </Field>
                </div>
              </div>

              {/* === COUVERTURE === */}
              <div className="rounded-md border bg-secondary/20 p-3 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Couverture
                </div>
                <Field label="Papier couverture">
                  <Select
                    value={input.papier_couverture_id}
                    onChange={(e) =>
                      setInput({ ...input, papier_couverture_id: e.target.value })
                    }
                  >
                    {params.papiers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom} ({p.grammage} g)
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Couleur">
                    <Select
                      value={input.couleur_couverture}
                      onChange={(e) =>
                        setInput({
                          ...input,
                          couleur_couverture: e.target.value as BrochuresCouleur,
                        })
                      }
                    >
                      <option value="quadri">Quadri</option>
                      <option value="noir">Noir seul</option>
                    </Select>
                  </Field>
                  <Field label="Techno">
                    <Select
                      value={input.techno_mode_couverture}
                      onChange={(e) =>
                        setInput({
                          ...input,
                          techno_mode_couverture: e.target.value as BrochuresTechnoMode,
                        })
                      }
                    >
                      <option value="auto">Auto</option>
                      <option value="numerique">Numérique</option>
                      <option value="offset">Offset</option>
                    </Select>
                  </Field>
                </div>
              </div>

              <Field label="Finitions couverture">
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

              <Field label="Option BAT">
                <Checkbox
                  checked={input.bat}
                  onChange={(bat) => setInput({ ...input, bat })}
                  label={`BAT (${fmtEur(params.bat_prix_ht)})`}
                />
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

function ResultBlock({ result }: { result: BrochuresResult }) {
  return (
    <div className="space-y-4">
      <ResultSection title="Configuration finale">
        <Row
          label="Format"
          value={`${result.largeur_finale_mm} × ${result.hauteur_finale_mm} mm`}
        />
        <Row
          label="Feuilles intérieur / brochure"
          value={fmtInt(result.nb_feuilles_interieur_par_brochure)}
        />
      </ResultSection>

      <hr />

      {result.impression_interieur && (
        <>
          <ResultSection title="Impression intérieur">
            <Row
              label="Machine"
              value={`${result.impression_interieur.machine_nom}${
                result.techno_switch_interieur ? ' (switch auto)' : ''
              }`}
            />
            <Row label="Techno" value={result.impression_interieur.techno} />
            <Row label="Couleur" value={result.impression_interieur.couleur} />
            <Row
              label="Format papier"
              value={`${result.impression_interieur.format_papier_largeur_mm} × ${result.impression_interieur.format_papier_hauteur_mm} mm`}
            />
            <Row
              label="Poses / feuille"
              value={fmtInt(result.impression_interieur.nb_poses_par_feuille)}
            />
            <Row
              label="Feuilles (avec gâches)"
              value={fmtInt(result.impression_interieur.nb_feuilles_avec_gaches)}
            />
            <MoneyRow label="Papier" value={result.impression_interieur.cout_papier_ht} />
            <MoneyRow label="Machine" value={result.impression_interieur.cout_machine_ht} />
            <MoneyRow label="Opérateur" value={result.impression_interieur.cout_operateur_ht} />
          </ResultSection>
          <hr />
        </>
      )}

      <ResultSection title="Impression couverture">
        <Row
          label="Machine"
          value={`${result.impression_couverture.machine_nom}${
            result.techno_switch_couverture ? ' (switch auto)' : ''
          }`}
        />
        <Row label="Techno" value={result.impression_couverture.techno} />
        <Row label="Couleur" value={result.impression_couverture.couleur} />
        <Row
          label="Format papier"
          value={`${result.impression_couverture.format_papier_largeur_mm} × ${result.impression_couverture.format_papier_hauteur_mm} mm`}
        />
        <Row
          label="Poses / feuille"
          value={fmtInt(result.impression_couverture.nb_poses_par_feuille)}
        />
        <Row
          label="Feuilles (avec gâches)"
          value={fmtInt(result.impression_couverture.nb_feuilles_avec_gaches)}
        />
        <MoneyRow label="Papier" value={result.impression_couverture.cout_papier_ht} />
        <MoneyRow label="Machine" value={result.impression_couverture.cout_machine_ht} />
        <MoneyRow label="Opérateur" value={result.impression_couverture.cout_operateur_ht} />
      </ResultSection>

      <hr />

      <ResultSection title="Façonnage & finitions">
        <MoneyRow
          label={`Façonnage${result.faconnage_sous_traite ? ' (sous-traité)' : ''}`}
          value={result.cout_faconnage_ht}
        />
        {result.cout_pliage_ht > 0 && <MoneyRow label="Pliage" value={result.cout_pliage_ht} />}
        <MoneyRow label="Finitions couverture" value={result.cout_finitions_ht} />
        <MoneyRow label="Frais fixes" value={result.frais_fixes_ht} />
        {result.cout_bat_ht > 0 && <MoneyRow label="BAT" value={result.cout_bat_ht} />}
        <MoneyRow label="Revient" value={result.cout_revient_ht} bold />
      </ResultSection>

      <hr />

      <ResultSection title="Marge & remise">
        <MoneyRow
          label={`Marge ${result.marge_pct.toFixed(2)} % (prorata techno)`}
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
