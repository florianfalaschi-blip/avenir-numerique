'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { fmtModifiedShort } from './fmt-modified';

export interface ScalarRow {
  /** Clé interne du champ (sert pour le meta[fieldKey] timestamp) */
  key: string;
  /** Label visible à gauche */
  label: string;
  /** Hint optionnel sous l'input (1 ligne) */
  hint?: string;
  /** Suffixe affiché à droite (ex: '€', '%') — purement visuel */
  suffix?: string;
  /** Type input : 'number' (par défaut) ou 'text' */
  type?: 'number' | 'text';
  /** Valeur courante */
  value: number | string | undefined;
  /** Placeholder optionnel */
  placeholder?: string;
  /** Min (pour type=number) */
  min?: number;
  /** Step (pour type=number) */
  step?: number;
  /** Callback de changement — reçoit la valeur typée */
  onChange: (next: string) => void;
  /** Timestamp de dernière modif (depuis params.meta[key]) */
  modifiedAt?: number;
  /** Action additionnelle à droite (ex: bouton "Désactiver" pour plancher) */
  action?: React.ReactNode;
}

/**
 * Éditeur de paramètres scalaires en tableau (visuellement cohérent avec
 * CatalogueCard).
 *
 * Layout par ligne : [label (flex-1) | input (w-28) | suffix (w-6) | date (w-14)]
 * Chaque ligne montre sa propre date de modif si fournie via `modifiedAt`.
 */
export function ScalarsEditor({
  title,
  rows,
}: {
  title: string;
  rows: ScalarRow[];
}) {
  return (
    <Card>
      <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-2.5 pt-0">
        <div className="space-y-0.5 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2">
          {/* En-tête colonnes */}
          <div className="flex items-center gap-1.5 text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wide px-1 pb-0.5">
            <div className="flex-1">Paramètre</div>
            <div className="w-28 shrink-0 text-right">Valeur</div>
            <div className="w-6 shrink-0" aria-hidden />
            <div className="w-14 shrink-0 text-right">Modifié</div>
          </div>

          {rows.map((row) => (
            <div key={row.key} className="flex items-start gap-1.5">
              <div className="flex-1 min-w-0 pt-1">
                <div className="text-xs font-medium leading-tight">{row.label}</div>
                {row.hint && (
                  <div className="text-[10px] text-muted-foreground/80 leading-tight mt-0.5">
                    {row.hint}
                  </div>
                )}
              </div>
              <div className="w-28 shrink-0 flex items-center gap-1">
                <Input
                  type={row.type ?? 'number'}
                  min={row.min}
                  step={row.step}
                  value={row.value ?? ''}
                  placeholder={row.placeholder}
                  onChange={(e) => row.onChange(e.target.value)}
                />
              </div>
              <div className="w-6 shrink-0 text-xs text-muted-foreground/80 pt-1.5">
                {row.suffix ?? ''}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className="w-14 text-[10px] text-muted-foreground/70 text-right whitespace-nowrap tabular-nums pt-1.5"
                  title={
                    row.modifiedAt
                      ? new Date(row.modifiedAt).toLocaleString('fr-FR')
                      : 'Jamais modifié'
                  }
                >
                  {fmtModifiedShort(row.modifiedAt)}
                </span>
                {row.action && <div className="ml-1">{row.action}</div>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
