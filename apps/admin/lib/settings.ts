'use client';

/**
 * Persistance des paramètres calculateurs (papiers, machines, marges…).
 *
 * Phase 3a : on utilise localStorage côté client.
 * Phase 3b (à venir) : remplacer par lecture/écriture Supabase
 * (table `app_settings`, clé `calc_<slug>_settings_v1`) sans changer
 * l'API publique de ce module.
 *
 * SSR-safe : le premier rendu serveur/hydratation utilise les
 * `defaults` ; les valeurs persistées sont chargées dans un useEffect
 * après montage.
 */

import { useEffect, useState } from 'react';

const PREFIX_CALC = 'avenir.calc';
const PREFIX_SHARED = 'avenir.shared';
const PREFIX_DATA = 'avenir.data';
const PREFIX_CONFIG = 'avenir.config';

/**
 * Version du shape des paramètres par slug.
 * À bumper quand on change la forme des données pour invalider
 * silencieusement les anciennes valeurs stockées en localStorage.
 *
 * Conventions :
 * - `'<calc>'` : settings spécifiques à un calculateur (PREFIX_CALC).
 * - `'shared.<name>'` : catalogues partagés entre plusieurs calcs (PREFIX_SHARED).
 * - `'data.<entity>'` : collections métier (clients, devis…) (PREFIX_DATA).
 */
const VERSIONS: Record<string, string> = {
  rollup: 'v2',
  plaques: 'v2',
  flyers: 'v2',
  bobines: 'v2',
  brochures: 'v2',
  'shared.papiers': 'v1',
  'data.clients': 'v3', // v3 : carnet d'adresses unifié (adresses[] avec usages multiples)
  'data.devis': 'v1',
  'data.commandes': 'v1',
  'config.entreprise': 'v1',
};

export function settingsKey(slug: string): string {
  let prefix: string;
  let cleanSlug: string;
  if (slug.startsWith('shared.')) {
    prefix = PREFIX_SHARED;
    cleanSlug = slug.replace(/^shared\./, '');
  } else if (slug.startsWith('data.')) {
    prefix = PREFIX_DATA;
    cleanSlug = slug.replace(/^data\./, '');
  } else if (slug.startsWith('config.')) {
    prefix = PREFIX_CONFIG;
    cleanSlug = slug.replace(/^config\./, '');
  } else {
    prefix = PREFIX_CALC;
    cleanSlug = slug;
  }
  const version = VERSIONS[slug] ?? 'v1';
  return `${prefix}.${cleanSlug}.${version}`;
}

export function loadSettings<T>(slug: string, defaults: T): T {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(settingsKey(slug));
    if (!raw) return defaults;
    return JSON.parse(raw) as T;
  } catch {
    return defaults;
  }
}

export function saveSettings<T>(slug: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(settingsKey(slug), JSON.stringify(value));
  } catch {
    /* quota ou navigation privée — on ignore silencieusement */
  }
}

export function resetSettings(slug: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(settingsKey(slug));
  } catch {
    /* ignore */
  }
}

/**
 * Indique si une configuration custom est présente en local pour ce
 * calculateur (utile pour afficher un badge "modifié").
 */
export function hasCustomSettings(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(settingsKey(slug)) !== null;
  } catch {
    return false;
  }
}

/**
 * Hook React : lit + écrit les paramètres avec persistance localStorage.
 *
 * - Premier rendu : renvoie `defaults` (cohérent SSR/CSR).
 * - Après montage : remplace par la version persistée s'il y en a une.
 * - `update(next)` met à jour l'état ET persiste.
 * - `reset()` supprime la version persistée et revient aux defaults.
 * - Sync cross-tab : un changement dans un autre onglet est répercuté.
 */
export function useSettings<T>(
  slug: string,
  defaults: T
): {
  value: T;
  update: (next: T) => void;
  reset: () => void;
  hydrated: boolean;
  isCustom: boolean;
} {
  const [value, setValue] = useState<T>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  // Hydratation initiale depuis localStorage après montage
  useEffect(() => {
    const loaded = loadSettings(slug, defaults);
    setValue(loaded);
    setIsCustom(hasCustomSettings(slug));
    setHydrated(true);
    // On ne ré-hydrate que si le slug change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Synchronisation cross-tab via l'événement `storage`
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = settingsKey(slug);
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (e.newValue === null) {
        setValue(defaults);
        setIsCustom(false);
      } else {
        try {
          setValue(JSON.parse(e.newValue) as T);
          setIsCustom(true);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const update = (next: T) => {
    setValue(next);
    saveSettings(slug, next);
    setIsCustom(true);
  };

  const reset = () => {
    setValue(defaults);
    resetSettings(slug);
    setIsCustom(false);
  };

  return { value, update, reset, hydrated, isCustom };
}
