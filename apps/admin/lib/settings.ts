'use client';

/**
 * Persistance des paramètres + collections métier dans Supabase.
 *
 * Phase 3a : localStorage (historique)
 * Phase 3b : Supabase via la table `app_settings` (clé-valeur JSONB)
 *
 * L'API publique du hook `useSettings` reste identique : les pages n'ont
 * rien à modifier. Seul le storage underlying change.
 *
 * Convention de slugs :
 * - `'<calc>'` (rollup, plaques…) : paramètres calculateur
 * - `'shared.<name>'` (shared.papiers…) : catalogue partagé
 * - `'data.<entity>'` (data.clients…) : collections métier
 * - `'config.<name>'` (config.entreprise) : config app
 */

import { useEffect, useRef, useState } from 'react';
import { useAuth } from './auth';
import { getSupabase } from './supabase';

// ============================================================
// Helpers bas niveau (utilisés aussi par la migration)
// ============================================================

export async function loadFromSupabase<T>(slug: string, defaults: T): Promise<{
  value: T;
  isCustom: boolean;
}> {
  try {
    const { data, error } = await getSupabase()
      .from('app_settings')
      .select('value')
      .eq('key', slug)
      .maybeSingle();
    if (error) {
      console.error(`[settings] load failed for "${slug}":`, error.message);
      return { value: defaults, isCustom: false };
    }
    if (!data) return { value: defaults, isCustom: false };
    return { value: data.value as T, isCustom: true };
  } catch (e) {
    console.error(`[settings] load exception for "${slug}":`, e);
    return { value: defaults, isCustom: false };
  }
}

export async function saveToSupabase<T>(slug: string, value: T): Promise<void> {
  try {
    // Cast vers le type Json attendu par Supabase (jsonb)
    const { error } = await getSupabase()
      .from('app_settings')
      .upsert(
        { key: slug, value: value as unknown as never },
        { onConflict: 'key' }
      );
    if (error) {
      console.error(`[settings] save failed for "${slug}":`, error.message);
    }
  } catch (e) {
    console.error(`[settings] save exception for "${slug}":`, e);
  }
}

export async function deleteFromSupabase(slug: string): Promise<void> {
  try {
    const { error } = await getSupabase().from('app_settings').delete().eq('key', slug);
    if (error) {
      console.error(`[settings] delete failed for "${slug}":`, error.message);
    }
  } catch (e) {
    console.error(`[settings] delete exception for "${slug}":`, e);
  }
}

// ============================================================
// Hook public
// ============================================================

interface UseSettingsResult<T> {
  value: T;
  update: (next: T) => void;
  reset: () => void;
  hydrated: boolean;
  isCustom: boolean;
}

/**
 * Lit + écrit un paramètre depuis Supabase (table `app_settings`).
 *
 * - Au montage : charge depuis Supabase ; si pas trouvé, garde les defaults.
 * - update() / reset() : fire-and-forget vers Supabase (état local maj immédiate).
 * - hydrated : true une fois le premier load terminé.
 * - isCustom : true si une valeur est persistée pour cette clé.
 *
 * Si pas authentifié, reste sur les defaults (l'app redirige vers /login).
 */
export function useSettings<T>(slug: string, defaults: T): UseSettingsResult<T> {
  const { user } = useAuth();
  const [value, setValue] = useState<T>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const lastSavedRef = useRef<T>(defaults);

  // Reset hydrated lorsqu'on change de slug (rare)
  useEffect(() => {
    setHydrated(false);
  }, [slug]);

  // Load au montage (et quand user devient connecté)
  useEffect(() => {
    if (!user) {
      // Pas connecté : on garde les defaults, on indique "non hydraté" depuis Supabase
      setValue(defaults);
      setIsCustom(false);
      setHydrated(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await loadFromSupabase(slug, defaults);
      if (cancelled) return;
      setValue(result.value);
      setIsCustom(result.isCustom);
      lastSavedRef.current = result.value;
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, user?.id]);

  const update = (next: T) => {
    setValue(next);
    setIsCustom(true);
    lastSavedRef.current = next;
    void saveToSupabase(slug, next);
  };

  const reset = () => {
    setValue(defaults);
    setIsCustom(false);
    lastSavedRef.current = defaults;
    void deleteFromSupabase(slug);
  };

  return { value, update, reset, hydrated, isCustom };
}

// ============================================================
// API legacy conservée pour compat — ne fait plus rien d'utile
// ============================================================

/** @deprecated — Phase 3b utilise Supabase. Toujours renvoie false. */
export function hasCustomSettings(_slug: string): boolean {
  return false;
}

/** @deprecated — clé de stockage localStorage historique (pour migration uniquement). */
export function legacyLocalStorageKey(slug: string): string {
  const PREFIX_CALC = 'avenir.calc';
  const PREFIX_SHARED = 'avenir.shared';
  const PREFIX_DATA = 'avenir.data';
  const PREFIX_CONFIG = 'avenir.config';
  const VERSIONS: Record<string, string> = {
    rollup: 'v2',
    plaques: 'v2',
    flyers: 'v2',
    bobines: 'v2',
    brochures: 'v2',
    'shared.papiers': 'v1',
    'data.clients': 'v3',
    'data.devis': 'v1',
    'data.commandes': 'v1',
    'data.factures': 'v1',
    'config.entreprise': 'v1',
  };
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

/** Alias historique. */
export const settingsKey = legacyLocalStorageKey;
