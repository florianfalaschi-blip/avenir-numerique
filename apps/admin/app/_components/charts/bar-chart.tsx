'use client';

import { useMemo } from 'react';
import { fmtEur } from '../../calculateurs/_shared/format';

/**
 * Bar chart SVG natif — pas de dépendance externe.
 * Rendu déterministe, accessible, imprimable, léger.
 *
 * Design aligné sur le legacy (chart-svg) : axes en gris clair,
 * barres en couleur primary, valeurs affichées au-dessus, labels en bas.
 */
export interface BarChartDatum {
  label: string;
  value: number;
}

export function BarChart({
  data,
  height = 220,
  /** Coloration des barres : 'primary' (bleu) ou 'accent' (orange). */
  color = 'primary',
  /** Affiche les valeurs en € au-dessus des barres si true. */
  showValues = true,
  /** Format des valeurs (€ par défaut). */
  formatValue = fmtEur,
  /** Hauteur minimale d'une barre non nulle (px) pour rester visible. */
  minBarHeight = 2,
  ariaLabel,
}: {
  data: BarChartDatum[];
  height?: number;
  color?: 'primary' | 'accent';
  showValues?: boolean;
  formatValue?: (v: number) => string;
  minBarHeight?: number;
  ariaLabel?: string;
}) {
  const { width, paddingT, paddingB, paddingL, paddingR } = {
    width: 600,
    paddingT: 28,
    paddingB: 28,
    paddingL: 8,
    paddingR: 8,
  };

  const chartH = height - paddingT - paddingB;
  const chartW = width - paddingL - paddingR;

  const max = useMemo(() => {
    const m = Math.max(...data.map((d) => d.value), 0);
    return m === 0 ? 1 : m;
  }, [data]);

  // Gridlines : 4 horizontales
  const gridlines = useMemo(() => {
    const lines: { y: number; value: number }[] = [];
    for (let i = 0; i <= 4; i++) {
      const ratio = i / 4;
      lines.push({ y: paddingT + chartH * (1 - ratio), value: max * ratio });
    }
    return lines;
  }, [chartH, paddingT, max]);

  const barGap = 6;
  const barW = data.length > 0 ? (chartW - barGap * (data.length - 1)) / data.length : 0;

  const fillClass = color === 'accent' ? 'fill-accent' : 'fill-primary';

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground italic min-h-[220px]">
        Aucune donnée.
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel ?? 'Graphique en barres'}
      className="w-full h-auto font-sans"
    >
      {/* Grid horizontal */}
      {gridlines.map((g, i) => (
        <g key={i}>
          <line
            x1={paddingL}
            x2={width - paddingR}
            y1={g.y}
            y2={g.y}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
            strokeDasharray={i === 4 ? '0' : '2 3'}
          />
        </g>
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const ratio = d.value / max;
        const h =
          d.value > 0
            ? Math.max(minBarHeight, chartH * ratio)
            : 0;
        const x = paddingL + i * (barW + barGap);
        const y = paddingT + chartH - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={3}
              className={`${fillClass} transition-opacity hover:opacity-75`}
            >
              <title>
                {d.label} : {formatValue(d.value)}
              </title>
            </rect>
            {showValues && d.value > 0 && (
              <text
                x={x + barW / 2}
                y={y - 4}
                textAnchor="middle"
                className="fill-foreground"
                fontSize="9"
                fontWeight="600"
              >
                {formatValue(d.value).replace(/[€\s,]/g, (m) =>
                  m === ',' ? '.' : m === ' ' ? '' : ''
                )}
              </text>
            )}
            {/* X-axis label */}
            <text
              x={x + barW / 2}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="10"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
