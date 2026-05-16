'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';

export interface DegressifRow {
  seuil: number;
  remise_pct: number;
}

/**
 * Tableau d'édition d'un dégressif quantité (réutilisable entre calcs).
 * Le calculateur sous-jacent trie automatiquement par seuil, donc l'ordre
 * d'entrée importe peu.
 */
export function DegressifEditor({
  value,
  onChange,
}: {
  value: DegressifRow[];
  onChange: (next: DegressifRow[]) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-xl">Dégressif quantité</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange([...value, { seuil: 1, remise_pct: 0 }])}
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
          {value.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3">
              Aucun seuil — pas de dégressif appliqué.
            </p>
          ) : (
            value.map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-5"
                  type="number"
                  min={1}
                  step={1}
                  value={row.seuil}
                  onChange={(e) => {
                    const next = [...value];
                    next[i] = { ...next[i]!, seuil: Number(e.target.value) || 0 };
                    onChange(next);
                  }}
                />
                <Input
                  className="col-span-6"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={row.remise_pct}
                  onChange={(e) => {
                    const next = [...value];
                    next[i] = { ...next[i]!, remise_pct: Number(e.target.value) || 0 };
                    onChange(next);
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1 text-muted-foreground hover:text-destructive"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
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
  );
}
