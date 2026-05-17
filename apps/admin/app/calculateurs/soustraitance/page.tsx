'use client';

import { useMemo, useState } from 'react';
import { calcSoustraitance, SoustraitanceCalcError } from '@avenir/core';
import type {
  SoustraitanceInput,
  SoustraitanceLigne,
  SoustraitanceResult,
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
import { fmtEur } from '../_shared/format';
import { defaultSoustraitanceParams } from '@/lib/default-params/soustraitance';
import { useSettings } from '@/lib/settings';
import { SaveAsDevisCard } from '../_shared/save-as-devis';

function newLigneId(): string {
  return `stl_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

const DEFAULT_INPUT: SoustraitanceInput = {
  nom_job: '',
  lignes: [],
  descriptif: '',
  quantite: 1,
  bat: false,
};

function compute(
  input: SoustraitanceInput,
  params: typeof defaultSoustraitanceParams
): { result: SoustraitanceResult | null; error: string | null } {
  try {
    return { result: calcSoustraitance(input, params), error: null };
  } catch (e) {
    if (e instanceof SoustraitanceCalcError) return { result: null, error: e.message };
    return { result: null, error: 'Erreur inattendue lors du calcul' };
  }
}

export default function SoustraitanceCalcPage() {
  const { value: params, isCustom } = useSettings(
    'soustraitance',
    defaultSoustraitanceParams
  );
  const [input, setInput] = useState<SoustraitanceInput>(() => ({
    ...DEFAULT_INPUT,
    lignes: [
      {
        id: newLigneId(),
        fournisseur_id: params.fournisseurs[0]?.id ?? '',
        prix_achat_ht: 0,
        marge_pct: params.default_marge_pct,
      },
    ],
  }));

  const outcome = useMemo(() => compute(input, params), [input, params]);

  const addLigne = () => {
    setInput((prev) => ({
      ...prev,
      lignes: [
        ...prev.lignes,
        {
          id: newLigneId(),
          fournisseur_id: params.fournisseurs[0]?.id ?? '',
          prix_achat_ht: 0,
          marge_pct: params.default_marge_pct,
        },
      ],
    }));
  };

  const updateLigne = (id: string, changes: Partial<SoustraitanceLigne>) => {
    setInput((prev) => ({
      ...prev,
      lignes: prev.lignes.map((l) => (l.id === id ? { ...l, ...changes } : l)),
    }));
  };

  const removeLigne = (id: string) => {
    setInput((prev) => ({
      ...prev,
      lignes: prev.lignes.filter((l) => l.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <BackLink />
        <SettingsBadge slug="soustraitance" isCustom={isCustom} />
      </div>
      <CalcHeader
        title="Calculateur Sous-traitance"
        subtitle="Devis multi-postes avec sous-traitants. Prix d'achat × marge → prix de vente."
      />

      <TwoColumns
        form={
          <div className="space-y-4">
            {/* Nom du job */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Job</CardTitle>
              </CardHeader>
              <CardContent>
                <Field label="Nom du job">
                  <Input
                    value={input.nom_job}
                    placeholder="Ex. Tampon caoutchouc client X"
                    maxLength={120}
                    onChange={(e) =>
                      setInput((prev) => ({ ...prev, nom_job: e.target.value }))
                    }
                  />
                </Field>
              </CardContent>
            </Card>

            {/* Lignes de sous-traitance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-xl">
                    Postes de sous-traitance ({input.lignes.length})
                  </CardTitle>
                  <Button variant="accent" size="sm" onClick={addLigne}>
                    + Ajouter une ligne
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="[&_input]:h-8 [&_input]:text-xs [&_input]:px-2 [&_select]:h-8 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0 space-y-2">
                  {/* En-tête colonnes */}
                  <div className="grid grid-cols-12 gap-1.5 text-[10px] uppercase tracking-wide font-medium text-muted-foreground/80 px-1 pb-0.5">
                    <div className="col-span-3">Fournisseur</div>
                    <div className="col-span-3">Réf devis</div>
                    <div className="col-span-2 text-right">Achat HT (€)</div>
                    <div className="col-span-1 text-right">Marge %</div>
                    <div className="col-span-2 text-right">Vente HT (€)</div>
                    <div className="col-span-1 text-right">×</div>
                  </div>

                  {input.lignes.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Aucun poste. Clique « + Ajouter une ligne » pour commencer.
                    </p>
                  ) : (
                    input.lignes.map((ligne) => {
                      const prixVente =
                        ligne.prix_achat_ht * (1 + ligne.marge_pct / 100);
                      return (
                        <div
                          key={ligne.id}
                          className="grid grid-cols-12 gap-1.5 items-center"
                        >
                          <Select
                            className="col-span-3"
                            value={ligne.fournisseur_id}
                            onChange={(e) =>
                              updateLigne(ligne.id, { fournisseur_id: e.target.value })
                            }
                          >
                            {params.fournisseurs.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.nom}
                              </option>
                            ))}
                          </Select>
                          <Input
                            className="col-span-3"
                            value={ligne.ref_devis_fournisseur ?? ''}
                            placeholder="Réf. devis"
                            onChange={(e) =>
                              updateLigne(ligne.id, {
                                ref_devis_fournisseur: e.target.value || undefined,
                              })
                            }
                          />
                          <Input
                            className="col-span-2"
                            type="number"
                            min={0}
                            step={0.01}
                            value={ligne.prix_achat_ht}
                            onChange={(e) =>
                              updateLigne(ligne.id, {
                                prix_achat_ht: Number(e.target.value) || 0,
                              })
                            }
                          />
                          <Input
                            className="col-span-1"
                            type="number"
                            min={0}
                            step={1}
                            value={ligne.marge_pct}
                            onChange={(e) =>
                              updateLigne(ligne.id, {
                                marge_pct: Number(e.target.value) || 0,
                              })
                            }
                          />
                          <span className="col-span-2 text-right text-sm font-semibold tabular">
                            {fmtEur(prixVente)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="col-span-1 h-7 w-7 text-muted-foreground hover:text-destructive justify-self-end"
                            onClick={() => removeLigne(ligne.id)}
                            aria-label="Supprimer cette ligne"
                            disabled={input.lignes.length === 1}
                          >
                            ✕
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Descriptif */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Descriptif produit</CardTitle>
              </CardHeader>
              <CardContent>
                <Field label="Description détaillée" hint={`${(input.descriptif ?? '').length} / 750 caractères`}>
                  <textarea
                    className="flex w-full min-h-24 rounded-md border border-input bg-background px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={input.descriptif ?? ''}
                    maxLength={750}
                    placeholder="Matières, dimensions, finitions, particularités…"
                    onChange={(e) =>
                      setInput((prev) => ({ ...prev, descriptif: e.target.value }))
                    }
                  />
                </Field>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Options</CardTitle>
              </CardHeader>
              <CardContent>
                <Checkbox
                  checked={input.bat}
                  onChange={(bat) => setInput((prev) => ({ ...prev, bat }))}
                  label={`BAT (${fmtEur(params.bat_prix_ht)})`}
                />
              </CardContent>
            </Card>
          </div>
        }
        result={
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Récap</CardTitle>
              </CardHeader>
              <CardContent>
                {outcome.error ? (
                  <p className="text-sm text-destructive">{outcome.error}</p>
                ) : outcome.result ? (
                  <ResultBlock result={outcome.result} />
                ) : null}
              </CardContent>
            </Card>
            <SaveAsDevisCard
              calculateur="soustraitance"
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

function ResultBlock({ result }: { result: SoustraitanceResult }) {
  return (
    <div className="space-y-4">
      <ResultSection title="Configuration">
        <Row label="Nombre de postes" value={String(result.nb_lignes)} />
        <Row
          label="Fournisseurs distincts"
          value={String(result.nb_fournisseurs_distincts)}
        />
      </ResultSection>

      <hr />

      <ResultSection title="Coûts">
        <MoneyRow label="Total achats HT" value={result.total_achat_ht} />
        <Row
          label="Marge moyenne"
          value={`${result.marge_moy_pct.toFixed(1)} %`}
        />
        <MoneyRow label="Total marge €" value={result.total_marge_eur} />
        <MoneyRow label="Frais fixes" value={result.frais_fixes_ht} />
        {result.cout_bat_ht > 0 && (
          <MoneyRow label="BAT" value={result.cout_bat_ht} />
        )}
        <MoneyRow label="Coût de revient" value={result.cout_revient_ht} bold />
      </ResultSection>

      <hr />

      <ResultSection title="Prix de vente">
        <MoneyRow label="HT brut" value={result.prix_ht_brut} />
        {result.remise_pct > 0 && (
          <Row label="Dégressif" value={`-${result.remise_pct} %`} />
        )}
        <PriceHighlight
          prixHt={result.prix_ht}
          prixTtc={result.prix_ttc}
          tvaPct={result.tva_pct}
        />
      </ResultSection>

      <Warnings items={result.warnings} />
    </div>
  );
}
