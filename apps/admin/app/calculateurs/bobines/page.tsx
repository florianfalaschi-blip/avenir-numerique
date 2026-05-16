'use client';

import { useMemo, useState } from 'react';
import { calcBobines, BobinesCalcError } from '@avenir/core';
import type {
  BobinesInput,
  BobinesResult,
  BobinesForme,
  BobinesConditionnement,
  BobinesDecoupeMode,
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
  TwoColumns,
  Warnings,
} from '../_shared/components';
import { fmtEur, fmtInt } from '../_shared/format';
import { demoBobinesParams } from './demo-params';

const DEFAULT_INPUT: BobinesInput = {
  quantite_etiquettes: 500,
  forme: 'rectangle',
  largeur_mm: 80,
  hauteur_mm: 40,
  materiau_id: 'vinyle_blanc',
  decoupe_mode: 'forme_simple',
  conditionnement: 'planches_plat',
  finitions_ids: [],
  bat: false,
};

function compute(input: BobinesInput): { result: BobinesResult | null; error: string | null } {
  try {
    return { result: calcBobines(input, demoBobinesParams), error: null };
  } catch (e) {
    if (e instanceof BobinesCalcError) return { result: null, error: e.message };
    return { result: null, error: 'Erreur inattendue lors du calcul' };
  }
}

export default function BobinesCalcPage() {
  const [input, setInput] = useState<BobinesInput>(DEFAULT_INPUT);
  const outcome = useMemo(() => compute(input), [input]);

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
      <BackLink />
      <CalcHeader
        title="Calculateur Bobines / Étiquettes"
        subtitle="4 formes, calepinage rouleau ou m², planches ou rouleau applicateur."
      />

      <TwoColumns
        form={
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Quantité d'étiquettes">
                  <Input
                    type="number"
                    min={1}
                    value={input.quantite_etiquettes}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        quantite_etiquettes: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                  />
                </Field>
                <Field label="Option BAT">
                  <Checkbox
                    checked={input.bat}
                    onChange={(bat) => setInput({ ...input, bat })}
                    label={`BAT (${fmtEur(demoBobinesParams.bat_prix_ht)})`}
                  />
                </Field>
              </div>

              <Field label="Forme">
                <Select
                  value={input.forme}
                  onChange={(e) => {
                    const forme = e.target.value as BobinesForme;
                    setInput({
                      ...input,
                      forme,
                      decoupe_mode: forme === 'forme_libre' ? 'forme_libre' : 'forme_simple',
                    });
                  }}
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="rond">Rond</option>
                  <option value="ovale">Ovale</option>
                  <option value="forme_libre">Forme libre (manuel)</option>
                </Select>
              </Field>

              {input.forme === 'rond' ? (
                <Field label="Diamètre (mm)">
                  <Input
                    type="number"
                    min={1}
                    value={input.diametre_mm ?? 30}
                    onChange={(e) =>
                      setInput({ ...input, diametre_mm: Number(e.target.value) || 0 })
                    }
                  />
                </Field>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Largeur (mm)">
                    <Input
                      type="number"
                      min={1}
                      value={input.largeur_mm ?? 50}
                      onChange={(e) =>
                        setInput({ ...input, largeur_mm: Number(e.target.value) || 0 })
                      }
                    />
                  </Field>
                  <Field label="Hauteur (mm)">
                    <Input
                      type="number"
                      min={1}
                      value={input.hauteur_mm ?? 30}
                      onChange={(e) =>
                        setInput({ ...input, hauteur_mm: Number(e.target.value) || 0 })
                      }
                    />
                  </Field>
                </div>
              )}

              {input.forme === 'forme_libre' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Surface unitaire (mm²)" hint="Lue du fichier vectoriel">
                    <Input
                      type="number"
                      min={0}
                      value={input.surface_libre_mm2 ?? 1500}
                      onChange={(e) =>
                        setInput({ ...input, surface_libre_mm2: Number(e.target.value) || 0 })
                      }
                    />
                  </Field>
                  <Field label="Périmètre unitaire (mm)" hint="Lu du fichier vectoriel">
                    <Input
                      type="number"
                      min={0}
                      value={input.perimetre_libre_mm ?? 180}
                      onChange={(e) =>
                        setInput({ ...input, perimetre_libre_mm: Number(e.target.value) || 0 })
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
                  {demoBobinesParams.materiaux.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom}
                      {m.methode_calcul !== 'calepinage' && m.methode_calcul !== 'auto'
                        ? ` (m²)`
                        : ''}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Type de découpe">
                  <Select
                    value={input.decoupe_mode}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        decoupe_mode: e.target.value as BobinesDecoupeMode,
                      })
                    }
                  >
                    <option value="forme_simple">Forme simple</option>
                    <option value="forme_libre">Forme libre</option>
                  </Select>
                </Field>
                <Field label="Conditionnement">
                  <Select
                    value={input.conditionnement}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        conditionnement: e.target.value as BobinesConditionnement,
                      })
                    }
                  >
                    <option value="planches_plat">Planches à plat</option>
                    <option value="rouleau_applicateur">Rouleau applicateur</option>
                  </Select>
                </Field>
              </div>

              <Field label="Finitions">
                <div className="space-y-2 rounded-md border bg-secondary/30 p-3">
                  {demoBobinesParams.finitions.map((f) => (
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

function ResultBlock({ result }: { result: BobinesResult }) {
  return (
    <div className="space-y-4">
      <ResultSection title="Dimensions">
        <Row
          label="Surface unitaire"
          value={`${result.surface_unitaire_mm2.toFixed(1)} mm²`}
        />
        <Row
          label="Périmètre unitaire"
          value={`${result.perimetre_unitaire_mm.toFixed(1)} mm`}
        />
      </ResultSection>

      <hr />

      <ResultSection title="Matière">
        <Row
          label="Méthode"
          value={result.matiere.methode === 'm2' ? 'm²' : result.matiere.methode}
        />
        {result.matiere.rouleau && (
          <>
            <Row
              label="Rouleau choisi"
              value={`${result.matiere.rouleau.largeur_mm} mm × ${result.matiere.rouleau.longueur_m} m`}
            />
            <Row
              label="Étiquettes / largeur"
              value={fmtInt(result.matiere.rouleau.nb_etiquettes_par_largeur)}
            />
            <Row
              label="Longueur nécessaire"
              value={`${result.matiere.rouleau.longueur_necessaire_m.toFixed(2)} m`}
            />
            <Row label="Nb rouleaux" value={fmtInt(result.matiere.rouleau.nb_rouleaux)} />
          </>
        )}
        {result.matiere.surface_totale_m2 !== undefined && (
          <Row
            label="Surface totale (avec gâches)"
            value={`${result.matiere.surface_totale_m2.toFixed(2)} m²`}
          />
        )}
        <MoneyRow label="Coût matière" value={result.matiere.cout_matiere_ht} />
      </ResultSection>

      <hr />

      <ResultSection title="Coûts">
        <MoneyRow label="Impression machine" value={result.cout_impression_ht} />
        <MoneyRow label="Impression opérateur" value={result.cout_operateur_impression_ht} />
        <MoneyRow label="Découpe machine" value={result.cout_decoupe_machine_ht} />
        <MoneyRow label="Découpe opérateur" value={result.cout_decoupe_operateur_ht} />
        <MoneyRow label="Cliquage" value={result.cout_cliquage_ht} />
        <MoneyRow label="Finitions" value={result.cout_finitions_ht} />
        {result.cout_conditionnement_ht > 0 && (
          <MoneyRow label="Rembobinage" value={result.cout_conditionnement_ht} />
        )}
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
