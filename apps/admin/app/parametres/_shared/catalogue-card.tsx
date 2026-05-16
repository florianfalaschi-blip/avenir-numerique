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
 * label de confirmation. Si `T` a aussi `lastModifiedAt?: number`, la date est
 * affichée dans une petite colonne à droite (avant le bouton supprimer).
 *
 * Layout d'une row : [inputs (flex-1 12-col grid) | date (w-14) | delete (w-7)]
 */
export function CatalogueCard<
  T extends { id: string; nom: string; lastModifiedAt?: number }
>({
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
      <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm">{title}</CardTitle>
          <Button variant="outline" size="sm" className="h-6 px-2 text-[11px]" onClick={onAdd}>
            {addLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2.5 pt-0">
        {/* [&_input]:h-7 réduit la hauteur des Input dans les rows (compact) */}
        <div className="space-y-0.5 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2">
          {/* === En-tête de colonnes === */}
          <div className="flex items-center gap-1.5 text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wide px-1 pb-0.5">
            <div className="flex-1 grid grid-cols-12 gap-1.5">
              {columns.map((c) => (
                <div key={c.label} className={spanClass(c.span)}>
                  {c.label}
                </div>
              ))}
            </div>
            <div className="w-14 shrink-0 text-right">Modifié</div>
            <div className="w-7 shrink-0" aria-hidden />
          </div>

          {/* === Rows === */}
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              Aucun élément. Clique « {addLabel} » pour en créer un.
            </p>
          ) : (
            items.map((item, i) => (
              <div key={item.id} className="flex items-center gap-1.5">
                <div className="flex-1 grid grid-cols-12 gap-1.5 items-center">
                  {renderRow(item, i)}
                </div>
                <span
                  className="w-14 shrink-0 text-[10px] text-muted-foreground/70 text-right whitespace-nowrap tabular-nums"
                  title={
                    item.lastModifiedAt
                      ? new Date(item.lastModifiedAt).toLocaleString('fr-FR')
                      : 'Jamais modifié'
                  }
                >
                  {fmtModifiedShort(item.lastModifiedAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
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
          {hint && <div className="text-[11px] text-muted-foreground pt-1">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Format compact pour la colonne "Modifié" (max 5-6 chars).
 * - undefined → "—"
 * - < 1h → "Xmin"
 * - < 24h → "Xh"
 * - < 30j → "Xj"
 * - sinon → "DD/MM"
 */
function fmtModifiedShort(ts: number | undefined): string {
  if (!ts) return '—';
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMin / 60);
  const diffJ = Math.floor(diffH / 24);
  if (diffMin < 1) return 'à l’inst.';
  if (diffMin < 60) return `${diffMin} min`;
  if (diffH < 24) return `${diffH} h`;
  if (diffJ < 30) return `${diffJ} j`;
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
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
