'use client';

import { getSupabase } from './supabase';
import { legacyLocalStorageKey, saveToSupabase } from './settings';

const MIGRATION_FLAG = 'avenir.migration.v1.done';

/** Toutes les clés Avenir potentiellement présentes en localStorage. */
const KNOWN_SLUGS = [
  // Paramètres calculateurs
  'rollup',
  'plaques',
  'flyers',
  'bobines',
  'brochures',
  // Catalogues partagés
  'shared.papiers',
  // Collections métier
  'data.clients',
  'data.devis',
  'data.commandes',
  'data.factures',
  // Config app
  'config.entreprise',
] as const;

export interface MigrationReport {
  /** Nombre de clés migrées avec succès. */
  migrated: number;
  /** Nombre de clés ignorées (vides en localStorage ou erreur). */
  skipped: number;
  /** Liste des slugs migrés. */
  migratedSlugs: string[];
  /** Vrai si la migration a déjà été faite avant. */
  alreadyDone: boolean;
}

/**
 * Migre les données localStorage existantes vers Supabase.
 *
 * À appeler après login. Idempotent :
 * - Si déjà migré (flag localStorage) → no-op
 * - Si Supabase contient déjà des données → marque comme migré, no-op
 *
 * Sinon : pour chaque clé Avenir trouvée en localStorage, upsert dans
 * `app_settings`. À la fin, pose un flag local pour ne pas recommencer.
 */
export async function migrateLocalStorageToSupabase(): Promise<MigrationReport> {
  if (typeof window === 'undefined') {
    return { migrated: 0, skipped: 0, migratedSlugs: [], alreadyDone: true };
  }

  if (window.localStorage.getItem(MIGRATION_FLAG) === 'true') {
    return { migrated: 0, skipped: 0, migratedSlugs: [], alreadyDone: true };
  }

  const supabase = getSupabase();

  // Évite d'écraser Supabase si une autre source a déjà rempli les données
  const { data: existing, error: errCheck } = await supabase
    .from('app_settings')
    .select('key')
    .limit(1);

  if (errCheck) {
    console.error('[migration] Vérification Supabase échouée :', errCheck.message);
    return { migrated: 0, skipped: 0, migratedSlugs: [], alreadyDone: false };
  }

  if (existing && existing.length > 0) {
    // Supabase contient déjà des données, on n'écrase pas
    window.localStorage.setItem(MIGRATION_FLAG, 'true');
    return { migrated: 0, skipped: 0, migratedSlugs: [], alreadyDone: true };
  }

  let migrated = 0;
  let skipped = 0;
  const migratedSlugs: string[] = [];

  for (const slug of KNOWN_SLUGS) {
    const storageKey = legacyLocalStorageKey(slug);
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      skipped++;
      continue;
    }
    try {
      const value = JSON.parse(raw);
      await saveToSupabase(slug, value);
      migrated++;
      migratedSlugs.push(slug);
    } catch (e) {
      console.error(`[migration] JSON invalide pour "${slug}":`, e);
      skipped++;
    }
  }

  window.localStorage.setItem(MIGRATION_FLAG, 'true');

  if (migrated > 0) {
    console.log(
      `[migration] ${migrated} clé(s) migrée(s) depuis localStorage vers Supabase : ${migratedSlugs.join(', ')}`
    );
  }

  return { migrated, skipped, migratedSlugs, alreadyDone: false };
}
