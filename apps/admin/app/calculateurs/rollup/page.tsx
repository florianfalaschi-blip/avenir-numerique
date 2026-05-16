'use client';

import { useMemo, useState } from 'react';
import { calcRollup, RollupCalcError } from '@avenir/core';
import type { RollupInput, RollupResult } from '@avenir/core';
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
import { fmtEur } from '../_shared/format';
import { demoRollupParams } from './demo-params';

const DEFAULT_INPUT: RollupInput = {
  quantite: 1,
  largeur_cm: 85,
  hauteur_cm: 200,
  bache_id: 'pvc_440',
  structure_id: 'standard',
  bat: false,
};

function compute(input: RollupInput): { result: RollupResult | null; error: string | null } {
  try {
    return { result: calcRollup(input, demoRollupParams), error: null };
  } catch (e) {
    if (e instanceof RollupCalcError) return { result: null, error: e.message };
    return { result: null, error: 'Erreur inattendue lors du calcul' };
  }
}

export default function RollupCalcPage() {
  const [input, setInput] = useState<RollupInput>(DEFAULT_INPUT);
  const outcome = useMemo(() => compute(input), [input]);

  return (
    <div className="space-y-6">
      <BackLink />
      <CalcHeader
        title="Calculateur Roll-up"
        subtitle="Bâche PVC + structure (eco/standard/premium). Sac et scratchs inclus."
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
                    label={`BAT (${fmtEur(demoRollupParams.bat_prix_ht)})`}
                  />
                </Field>
                <Field label="Largeur (cm)">
                  <Input
                    type="number"
                    min={1}
                    value={input.largeur_cm}
                    onChange={(e) =>
                      setInput({ ...input, largeur_cm: Number(e.target.value) || 0 })
                    }
                  />
                </Field>
                <Field label="Hauteur (cm)">
                  <Input
                    type="number"
                    min={1}
                    value={input.hauteur_cm}
                    onChange={(e) =>
                      setInput({ ...input, hauteur_cm: Number(e.target.value) || 0 })
                    }
                  />
                </Field>
              </div>

              <Field label="Bâche">
                <Select
                  value={input.bache_id}
                  onChange={(e) => setInput({ ...input, bache_id: e.target.value })}
                >
                  {demoRollupParams.baches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nom} — {fmtEur(b.prix_m2_ht)}/m²
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Structure">
                <Select
                  value={input.structure_id}
                  onChange={(e) => setInput({ ...input, structure_id: e.target.value })}
                >
                  {demoRollupParams.structures.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom} — {fmtEur(s.prix_unitaire_ht)}/u
                    </option>
                  ))}
                </Select>
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

function ResultBlock({ result }: { result: RollupResult }) {
  return (
    <div className="space-y-4">
      <ResultSection title="Coût unitaire">
        <Row label="Surface" value={`${result.surface_m2.toFixed(3)} m²`} />
        <MoneyRow label="Bâche /u" value={result.cout_bache_unitaire_ht} />
        <MoneyRow label="Machine /u" value={result.cout_machine_unitaire_ht} />
        <MoneyRow label="Structure /u" value={result.cout_structure_unitaire_ht} />
        <MoneyRow label="Total /u" value={result.cout_unitaire_ht} bold />
      </ResultSection>

      <hr />

      <ResultSection title="Coût de revient">
        <MoneyRow label="Production totale" value={result.cout_production_ht} />
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
