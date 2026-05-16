/**
 * Helpers pour mettre à jour des items en tableau tout en marquant
 * leur `lastModifiedAt` automatiquement.
 *
 * Pattern d'usage dans une page parametres :
 *   patch((d) => ({ ...d, baches: stampRow(d.baches, i, { nom: e.target.value }) }))
 *
 * Au lieu de :
 *   patch((d) => {
 *     const next = [...d.baches];
 *     next[i] = { ...next[i]!, nom: e.target.value };
 *     return { ...d, baches: next };
 *   })
 */

/**
 * Renvoie un nouveau tableau où l'item à `index` reçoit les `changes` PLUS
 * un timestamp `lastModifiedAt` à `Date.now()`. Le reste du tableau est
 * inchangé (référentiellement stable pour les autres items).
 */
export function stampRow<T extends { lastModifiedAt?: number }>(
  arr: T[],
  index: number,
  changes: Partial<T>
): T[] {
  const next = [...arr];
  next[index] = { ...next[index]!, ...changes, lastModifiedAt: Date.now() } as T;
  return next;
}

/**
 * Renvoie un item avec un timestamp `lastModifiedAt` posé à `Date.now()`.
 * Pratique pour les nouveaux items qu'on ajoute :
 *   patch((d) => ({ ...d, baches: [...d.baches, stamped({ id: ..., nom: 'X', prix_m2_ht: 0 })] }))
 *
 * Note : utilise un type générique souple pour préserver les types exacts
 * passés en argument (TypeScript widening peut être trop strict sinon).
 */
export function stamped<T extends object>(item: T): T & { lastModifiedAt: number } {
  return { ...item, lastModifiedAt: Date.now() };
}

/**
 * Met à jour un champ scalaire d'un objet "params" et trace le timestamp
 * de modification dans `params.meta[fieldKey]`.
 *
 * Pattern :
 *   onPatch((d) => stampScalar(d, 'marge_pct', { marge_pct: 50 }))
 */
export function stampScalar<T extends { meta?: Record<string, number> }>(
  params: T,
  fieldKey: string,
  changes: Partial<T>
): T {
  return {
    ...params,
    ...changes,
    meta: {
      ...(params.meta ?? {}),
      [fieldKey]: Date.now(),
    },
  };
}
