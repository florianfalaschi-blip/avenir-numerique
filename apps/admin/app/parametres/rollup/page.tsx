'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { RollupParams } from '@avenir/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field } from '../../calculateurs/_shared/components';
import { defaultRollupParams } from '@/lib/default-params/rollup';
import { useSettings } from '@/lib/settings';

export default function ParametresRollupPage() {
  const { value: persisted, update, reset, hydrated, isCustom } = useSettings(
    'rollup',
    defaultRollupParams
  );
  const [draft, setDraft] = useState<RollupParams>(persisted);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Sync draft with persisted value when hydration completes or external change.
  useEffect(() => {
    if (hydrated && !dirty) setDraft(persisted);
  }, [persisted, hydrated, dirty]);

  const patch = (updater: (d: RollupParams) => RollupParams) => {
    setDraft(updater);
    setDirty(true);
    setSavedAt(null);
  };

  const handleSave = () => {
    update(draft);
    setDirty(false);
    setSavedAt(Date.now());
  };

  const handleCancel = () => {
    setDraft(persisted);
    setDirty(false);
    setSavedAt(null);
  };

  const handleReset = () => {
    if (confirm('Réinitialiser tous les paramètres Roll-up aux valeurs par défaut ?')) {
      reset();
      setDraft(defaultRollupParams);
      setDirty(false);
      setSavedAt(null);
    }
  };

  return (
    <div className="space-y-6 pb-32">
      <div className="text-sm">
        <Link href="/parametres" className="text-muted-foreground hover:text-primary">
          ← Paramètres
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres Roll-up</h1>
        <p className="text-muted-foreground mt-2">
          Bâches, structures, machine, marge et dégressif. Les modifications s&apos;appliquent
          immédiatement au calculateur Roll-up après enregistrement.
        </p>
      </div>

      {/* === BÂCHES === */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-xl">Bâches</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                patch((d) => ({
                  ...d,
                  baches: [
                    ...d.baches,
                    { id: `bache_${Date.now()}`, nom: 'Nouvelle bâche', prix_m2_ht: 0 },
                  ],
                }))
              }
            >
              + Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              <div className="col-span-7">Nom</div>
              <div className="col-span-4">Prix /m² HT</div>
              <div className="col-span-1" />
            </div>
            {draft.baches.map((b, i) => (
              <div key={b.id} className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-7"
                  value={b.nom}
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.baches];
                      next[i] = { ...next[i]!, nom: e.target.value };
                      return { ...d, baches: next };
                    })
                  }
                />
                <Input
                  className="col-span-4"
                  type="number"
                  min={0}
                  step={0.1}
                  value={b.prix_m2_ht}
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.baches];
                      next[i] = { ...next[i]!, prix_m2_ht: Number(e.target.value) || 0 };
                      return { ...d, baches: next };
                    })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    patch((d) => ({ ...d, baches: d.baches.filter((_, j) => j !== i) }))
                  }
                  aria-label={`Supprimer ${b.nom}`}
                  disabled={draft.baches.length === 1}
                  title={draft.baches.length === 1 ? 'Au moins une bâche requise' : 'Supprimer'}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* === STRUCTURES === */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-xl">Structures</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                patch((d) => ({
                  ...d,
                  structures: [
                    ...d.structures,
                    {
                      id: `structure_${Date.now()}`,
                      nom: 'Nouvelle structure',
                      prix_unitaire_ht: 0,
                    },
                  ],
                }))
              }
            >
              + Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              <div className="col-span-7">Nom</div>
              <div className="col-span-4">Prix /u HT</div>
              <div className="col-span-1" />
            </div>
            {draft.structures.map((s, i) => (
              <div key={s.id} className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-7"
                  value={s.nom}
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.structures];
                      next[i] = { ...next[i]!, nom: e.target.value };
                      return { ...d, structures: next };
                    })
                  }
                />
                <Input
                  className="col-span-4"
                  type="number"
                  min={0}
                  step={1}
                  value={s.prix_unitaire_ht}
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.structures];
                      next[i] = { ...next[i]!, prix_unitaire_ht: Number(e.target.value) || 0 };
                      return { ...d, structures: next };
                    })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    patch((d) => ({
                      ...d,
                      structures: d.structures.filter((_, j) => j !== i),
                    }))
                  }
                  aria-label={`Supprimer ${s.nom}`}
                  disabled={draft.structures.length === 1}
                  title={
                    draft.structures.length === 1
                      ? 'Au moins une structure requise'
                      : 'Supprimer'
                  }
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* === MACHINES === */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-xl">Machines d&apos;impression</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                patch((d) => ({
                  ...d,
                  machines: [
                    ...d.machines,
                    {
                      id: `machine_${Date.now()}`,
                      nom: 'Nouvelle machine',
                      vitesse_m2_h: 10,
                      taux_horaire_ht: 50,
                    },
                  ],
                }))
              }
            >
              + Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              <div className="col-span-5">Nom</div>
              <div className="col-span-3">Vitesse (m²/h)</div>
              <div className="col-span-3">Taux HT (€/h)</div>
              <div className="col-span-1" />
            </div>
            {draft.machines.map((m, i) => (
              <div key={m.id} className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-5"
                  value={m.nom}
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.machines];
                      next[i] = { ...next[i]!, nom: e.target.value };
                      return { ...d, machines: next };
                    })
                  }
                />
                <Input
                  className="col-span-3"
                  type="number"
                  min={0}
                  step={0.5}
                  value={m.vitesse_m2_h}
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.machines];
                      next[i] = { ...next[i]!, vitesse_m2_h: Number(e.target.value) || 0 };
                      return { ...d, machines: next };
                    })
                  }
                />
                <Input
                  className="col-span-3"
                  type="number"
                  min={0}
                  step={1}
                  value={m.taux_horaire_ht}
                  onChange={(e) =>
                    patch((d) => {
                      const next = [...d.machines];
                      next[i] = { ...next[i]!, taux_horaire_ht: Number(e.target.value) || 0 };
                      return { ...d, machines: next };
                    })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    patch((d) => ({
                      ...d,
                      machines: d.machines.filter((_, j) => j !== i),
                    }))
                  }
                  aria-label={`Supprimer ${m.nom}`}
                  disabled={draft.machines.length === 1}
                  title={
                    draft.machines.length === 1 ? 'Au moins une machine requise' : 'Supprimer'
                  }
                >
                  ✕
                </Button>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-1">
              💡 Le calculateur sélectionne automatiquement la machine choisie dans le formulaire.
              Si tu en as plusieurs (ex. Epson + Mimaki), tu peux comparer les coûts.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* === PRIX & MARGES === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Prix généraux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Frais fixes HT (€)" hint="Préparation, calage, etc.">
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.frais_fixes_ht}
                onChange={(e) =>
                  patch((d) => ({ ...d, frais_fixes_ht: Number(e.target.value) || 0 }))
                }
              />
            </Field>
            <Field label="Prix BAT HT (€)">
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.bat_prix_ht}
                onChange={(e) =>
                  patch((d) => ({ ...d, bat_prix_ht: Number(e.target.value) || 0 }))
                }
              />
            </Field>
            <Field label="Marge (%)" hint="Appliquée au coût de revient">
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.marge_pct}
                onChange={(e) =>
                  patch((d) => ({ ...d, marge_pct: Number(e.target.value) || 0 }))
                }
              />
            </Field>
            <Field label="TVA (%)">
              <Input
                type="number"
                min={0}
                step={0.1}
                value={draft.tva_pct}
                onChange={(e) =>
                  patch((d) => ({ ...d, tva_pct: Number(e.target.value) || 0 }))
                }
              />
            </Field>
            <Field
              label="Plancher prix HT (€)"
              hint="Optionnel — le prix HT ne descend jamais en dessous"
              className="md:col-span-2"
            >
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={draft.prix_plancher_ht ?? ''}
                  placeholder="Aucun plancher"
                  onChange={(e) => {
                    const raw = e.target.value;
                    patch((d) => ({
                      ...d,
                      prix_plancher_ht: raw === '' ? undefined : Number(raw) || 0,
                    }));
                  }}
                />
                {draft.prix_plancher_ht !== undefined && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => patch((d) => ({ ...d, prix_plancher_ht: undefined }))}
                  >
                    Désactiver
                  </Button>
                )}
              </div>
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* === DÉGRESSIF === */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-xl">Dégressif quantité</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                patch((d) => ({
                  ...d,
                  degressif: [...d.degressif, { seuil: 1, remise_pct: 0 }],
                }))
              }
            >
              + Ajouter un seuil
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              <div className="col-span-5">À partir de (qté)</div>
              <div className="col-span-6">Remise (%)</div>
              <div className="col-span-1" />
            </div>
            {draft.degressif.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3">
                Aucun seuil — pas de dégressif appliqué.
              </p>
            ) : (
              draft.degressif.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    className="col-span-5"
                    type="number"
                    min={1}
                    step={1}
                    value={row.seuil}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.degressif];
                        next[i] = { ...next[i]!, seuil: Number(e.target.value) || 0 };
                        return { ...d, degressif: next };
                      })
                    }
                  />
                  <Input
                    className="col-span-6"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={row.remise_pct}
                    onChange={(e) =>
                      patch((d) => {
                        const next = [...d.degressif];
                        next[i] = { ...next[i]!, remise_pct: Number(e.target.value) || 0 };
                        return { ...d, degressif: next };
                      })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="col-span-1 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      patch((d) => ({
                        ...d,
                        degressif: d.degressif.filter((_, j) => j !== i),
                      }))
                    }
                    aria-label="Supprimer ce seuil"
                  >
                    ✕
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* === BARRE D'ACTIONS STICKY === */}
      <ActionBar
        dirty={dirty}
        isCustom={isCustom}
        savedAt={savedAt}
        onSave={handleSave}
        onCancel={handleCancel}
        onReset={handleReset}
      />
    </div>
  );
}

function ActionBar({
  dirty,
  isCustom,
  savedAt,
  onSave,
  onCancel,
  onReset,
}: {
  dirty: boolean;
  isCustom: boolean;
  savedAt: number | null;
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
}) {
  const showSavedFlash = savedAt !== null && Date.now() - savedAt < 4000;
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-10">
      <div className="container mx-auto px-4 py-3 max-w-6xl flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-muted-foreground">
          {dirty ? (
            <span className="text-accent font-medium">● Modifications non enregistrées</span>
          ) : showSavedFlash ? (
            <span className="text-green-600 font-medium">✓ Enregistré</span>
          ) : isCustom ? (
            <span>Paramètres personnalisés actifs (stockés localement)</span>
          ) : (
            <span>Paramètres par défaut</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Réinitialiser
          </Button>
          {dirty && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button variant="accent" size="sm" onClick={onSave} disabled={!dirty}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
