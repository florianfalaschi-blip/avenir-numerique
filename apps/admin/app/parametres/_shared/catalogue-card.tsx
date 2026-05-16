'use client';

import * as React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@avenir/ui';

export interface CatalogueColumn {
  label: string;
  /** Largeur en unités CSS grid (sur 12). Doit correspondre aux col-span utilisés dans renderRow. */
  span: number;
}

/**
 * Composant générique de catalogue éditable.
 *
 * Affiche un tableau de lignes (ex. liste de papiers, machines, finitions…)
 * avec un en-tête de colonnes, des boutons +Ajouter et ✕ par ligne.
 *
 * `T` doit avoir au moins { id: string; nom: string } pour la clé React et le
 * label de confirmation.
 */
export function CatalogueCard<T extends { id: string; nom: string }>({
  title,
  items,
  onAdd,
  onRemove,
  minItems = 0,
  columns,
  renderRow,
  hint,
  addLabel = '+ Ajouter',
}: {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  minItems?: number;
  columns: CatalogueColumn[];
  renderRow: (item: T, index: number) => React.ReactNode;
  hint?: React.ReactNode;
  addLabel?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Button variant="outline" size="sm" onClick={onAdd}>
            {addLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
            {columns.map((c) => (
              <div key={c.label} className={spanClass(c.span)}>
                {c.label}
              </div>
            ))}
            <div className="col-span-1" />
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3">
              Aucun élément. Clique « {addLabel} » pour en créer un.
            </p>
          ) : (
            items.map((item, i) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                {renderRow(item, i)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(i)}
                  aria-label={`Supprimer ${item.nom}`}
                  disabled={items.length <= minItems}
                  title={
                    items.length <= minItems
                      ? `Au moins ${minItems} élément(s) requis`
                      : 'Supprimer'
                  }
                >
                  ✕
                </Button>
              </div>
            ))
          )}
          {hint && <div className="text-xs text-muted-foreground pt-1">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Mapping statique span → classe Tailwind, pour s'assurer que les classes
 * sont extraites au build (les noms construits dynamiquement ne le seraient pas).
 */
function spanClass(span: number): string {
  switch (span) {
    case 1:
      return 'col-span-1';
    case 2:
      return 'col-span-2';
    case 3:
      return 'col-span-3';
    case 4:
      return 'col-span-4';
    case 5:
      return 'col-span-5';
    case 6:
      return 'col-span-6';
    case 7:
      return 'col-span-7';
    case 8:
      return 'col-span-8';
    case 9:
      return 'col-span-9';
    case 10:
      return 'col-span-10';
    case 11:
      return 'col-span-11';
    case 12:
      return 'col-span-12';
    default:
      return 'col-span-1';
  }
}
