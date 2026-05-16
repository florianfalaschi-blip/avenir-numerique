'use client';

import { useMemo } from 'react';
import { fmtEur } from '../../calculateurs/_shared/format';

export interface DonutChartDatum {
  label: string;
  value: number;
}

const SLICE_COLORS = [
  'hsl(221 83% 53%)', // primary blue
  'hsl(21 90% 48%)', // accent orange
  'hsl(160 84% 39%)', // success green
  'hsl(38 92% 50%)', // warning amber
  'hsl(280 65% 60%)', // purple
  'hsl(330 80% 55%)', // pink
  'hsl(200 80% 50%)', // cyan
];

/**
 * Donut chart SVG natif. Adapté pour 2-8 catégories.
 * Centre vide pour afficher le total.
 */
export function DonutChart({
  data,
  size = 200,
  thickness = 32,
  /** Format des valeurs dans la légende (€ par défaut). */
  formatValue = fmtEur,
  /** Texte central (souvent le total). */
  centerLabel,
  centerValue,
  ariaLabel,
}: {
  data: DonutChartDatum[];
  size?: number;
  thickness?: number;
  formatValue?: (v: number) => string;
  centerLabel?: string;
  centerValue?: string;
  ariaLabel?: string;
}) {
  const total = useMemo(() => data.reduce((acc, d) => acc + d.value, 0), [data]);
  const radius = size / 2 - 2;
  const innerR = radius - thickness;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * radius;

  const slices = useMemo(() => {
    if (total === 0) return [];
    let cum = 0;
    return data.map((d, i) => {
      const fraction = d.value / total;
      const offset = -cum * C;
      const length = fraction * C;
      cum += fraction;
      const color = SLICE_COLORS[i % SLICE_COLORS.length];
      return { ...d, fraction, offset, length, color };
    });
  }, [data, total, C]);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground italic min-h-[200px]">
        Aucune donnée.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={ariaLabel ?? 'Diagramme en anneau'}
        width={size}
        height={size}
        className="shrink-0"
      >
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {slices.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="transparent"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${s.length} ${C - s.length}`}
              strokeDashoffset={s.offset}
              className="transition-opacity hover:opacity-80"
            >
              <title>
                {s.label} : {formatValue(s.value)} ({Math.round(s.fraction * 100)} %)
              </title>
            </circle>
          ))}
        </g>
        {/* Cercle intérieur (masque pour effet donut) */}
        <circle cx={cx} cy={cy} r={innerR} fill="hsl(var(--card))" />

        {centerLabel && (
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="10"
            fontWeight="600"
            style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            {centerLabel}
          </text>
        )}
        {centerValue && (
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            className="fill-foreground"
            fontSize="16"
            fontWeight="700"
          >
            {centerValue}
          </text>
        )}
      </svg>

      {/* Légende */}
      <ul className="space-y-1.5 text-sm min-w-0 flex-1">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-2 min-w-0">
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ background: s.color }}
              aria-hidden
            />
            <span className="flex-1 truncate text-xs">{s.label}</span>
            <span className="text-xs tabular text-muted-foreground shrink-0">
              {formatValue(s.value)}
            </span>
            <span className="text-[10px] tabular text-muted-foreground/70 shrink-0 w-10 text-right">
              {Math.round(s.fraction * 100)} %
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
