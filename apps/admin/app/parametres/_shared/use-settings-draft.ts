'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/lib/settings';

/**
 * Hook applicatif d'édition de paramètres calculateurs.
 *
 * Sépare l'état "draft" (en cours d'édition) de la valeur persistée :
 * - patch() : modifie le draft, lève le flag dirty
 * - save() : pousse le draft vers le storage (localStorage)
 * - cancel() : annule les modifs en cours
 * - reset() : revient aux defaults (efface le storage)
 *
 * Renvoie aussi `savedAt` (timestamp du dernier save, pour flash UI)
 * et `isCustom` (true si une version custom est persistée).
 */
export function useSettingsDraft<T>(
  slug: string,
  defaults: T,
  options: { resetConfirmMessage?: string } = {}
) {
  const {
    value: persisted,
    update,
    reset,
    hydrated,
    isCustom,
  } = useSettings(slug, defaults);

  const [draft, setDraft] = useState<T>(persisted);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Sync draft with persisted when hydration completes or external change.
  useEffect(() => {
    if (hydrated && !dirty) setDraft(persisted);
  }, [persisted, hydrated, dirty]);

  const patch = (updater: (d: T) => T) => {
    setDraft(updater);
    setDirty(true);
    setSavedAt(null);
  };

  const save = () => {
    update(draft);
    setDirty(false);
    setSavedAt(Date.now());
  };

  const cancel = () => {
    setDraft(persisted);
    setDirty(false);
    setSavedAt(null);
  };

  const resetToDefaults = () => {
    const msg =
      options.resetConfirmMessage ?? 'Réinitialiser tous les paramètres aux valeurs par défaut ?';
    if (confirm(msg)) {
      reset();
      setDraft(defaults);
      setDirty(false);
      setSavedAt(null);
    }
  };

  return {
    draft,
    patch,
    save,
    cancel,
    reset: resetToDefaults,
    dirty,
    savedAt,
    isCustom,
    hydrated,
  };
}
