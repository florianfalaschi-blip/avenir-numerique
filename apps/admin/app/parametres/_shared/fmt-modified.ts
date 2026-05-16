/**
 * Format compact pour la colonne "Modifié" des tableaux (max 6 chars).
 * - undefined → "—"
 * - < 1 min → "à l'inst."
 * - < 1 h → "X min"
 * - < 24 h → "X h"
 * - < 30 j → "X j"
 * - sinon → "DD/MM"
 */
export function fmtModifiedShort(ts: number | undefined): string {
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
