/**
 * Formatage des valeurs monétaires en euros (FR).
 * Ex: 1234.5 → "1 234,50 €"
 */
export const fmtEur = (v: number) =>
  v.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

/** Formatage en pourcentage entier. */
export const fmtPct = (v: number) => `${v.toLocaleString('fr-FR')} %`;

/** Formatage d'un nombre entier avec espace de groupe. */
export const fmtInt = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

/**
 * Formatage relatif d'un timestamp Unix ms de modification.
 * - < 1 min : "à l'instant"
 * - < 1 h   : "il y a X min"
 * - < 24 h  : "aujourd'hui à HH:mm"
 * - sinon   : "DD/MM/YYYY"
 */
export function fmtModifiedAt(ts: number | undefined | null): string {
  if (!ts) return '—';
  const date = new Date(ts);
  const diffMs = Date.now() - ts;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) return "à l'instant";
  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return `il y a ${minutes} min`;
  }
  if (diffMs < day) {
    return `aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('fr-FR');
}
