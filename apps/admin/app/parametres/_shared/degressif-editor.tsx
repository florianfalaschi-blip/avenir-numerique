'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { fmtModifiedShort } from './fmt-modified';

export interface DegressifRow {
  seuil: number;
  remise_pct: number;
  /** Timestamp Unix ms de dernière modification (optionnel). */
  lastModifiedAt?: number;
}

/**
 * Tableau d'édition d'un dégressif quantité (réutilisable entre calcs).
 * Le calculateur sous-jacent trie automatiquement par seuil, donc l'ordre
 * d'entrée importe peu.
 *
 * Layout aligné sur CatalogueCard : [inputs (flex-1) | date (w-14) | delete (w-7)]
 */
export function DegressifEditor({
  value,
  onChange,
}: {
  value: DegressifRow[];
  onChange: (next: DegressifRow[]) => void;
}) {
  const stampUpdate = (i: number, changes: Partial<DegressifRow>) => {
    const next = [...value];
    next[i] = { ...next[i]!, ...changes, lastModifiedAt: Date.now() };
    onChange(next);
  };

  return (
    <Card>
      <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm">Dégressif quantité</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[11px]"
            onClick={() =>
              onChange([...value, { seuil: 1, remise_pct: 0, lastModifiedAt: Date.now() }])
            }
          >
            + Ajouter un seuil
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2.5 pt-0">
        <div className="space-y-0.5 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2">
          {/* En-tête de colonnes */}
          <div className="flex items-center gap-1.5 text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wide px-1 pb-0.5">
            <div className="flex-1 grid grid-cols-12 gap-1.5">
              <div className="col-span-6">À partir de (qté)</div>
              <div className="col-span-6">Remise (%)</div>
            </div>
            <div className="w-14 shrink-0 text-right">Modifié</div>
            <div className="w-7 shrink-0" aria-hidden />
          </div>

          {value.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              Aucun seuil — pas de dégressif appliqué.
            </p>
          ) : (
            value.map((row, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="flex-1 grid grid-cols-12 gap-1.5 items-center">
                  <Input
                    className="col-span-6"
                    type="number"
                    min={1}
                    step={1}
                    value={row.seuil}
                    onChange={(e) => stampUpdate(i, { seuil: Number(e.target.value) || 0 })}
                  />
                  <Input
                    className="col-span-6"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={row.remise_pct}
                    onChange={(e) => stampUpdate(i, { remise_pct: Number(e.target.value) || 0 })}
                  />
                </div>
                <span
                  className="w-14 shrink-0 text-[10px] text-muted-foreground/70 text-right whitespace-nowrap tabular-nums"
                  title={
                    row.lastModifiedAt
                      ? new Date(row.lastModifiedAt).toLocaleString('fr-FR')
                      : 'Jamais modifié'
                  }
                >
                  {fmtModifiedShort(row.lastModifiedAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
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

