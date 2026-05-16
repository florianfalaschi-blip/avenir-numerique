'use client';

import { getSupabase } from './supabase';
import { legacyLocalStorageKey, saveToSupabase } from './settings';

const MIGRATION_FLAG = 'avenir.migration.v1.done';
const TABLE_MIGRATION_FLAG = 'avenir.migration.tables.v1.done';

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

/** Entités métier qui ont leur propre table dédiée (Phase 4). */
const ENTITY_MIGRATIONS: {
  appSettingsKey: string;
  table: 'clients' | 'devis' | 'commandes' | 'factures';
  /** Convertit un item de `app_settings.data.<entity>` en row INSERT pour la table dédiée. */
  toRow: (item: Record<string, unknown>) => Record<string, unknown>;
}[] = [
  {
    appSettingsKey: 'data.clients',
    table: 'clients',
    toRow: (c) => ({
      id: c.id,
      data: c,
      created_at:
        typeof c.created_at === 'number' ? new Date(c.created_at).toISOString() : undefined,
      updated_at:
        typeof c.updated_at === 'number' ? new Date(c.updated_at).toISOString() : undefined,
    }),
  },
  {
    appSettingsKey: 'data.devis',
    table: 'devis',
    toRow: (d) => {
      const {
        id,
        numero,
        client_id,
        prix_ht,
        prix_ttc,
        statut,
        date_creation,
        ...rest
      } = d as Record<string, unknown>;
      return {
        id,
        numero,
        client_id: (client_id as string) || null,
        prix_ht: prix_ht ?? 0,
        prix_ttc: prix_ttc ?? 0,
        statut: statut ?? 'brouillon',
        date_creation:
          typeof date_creation === 'number'
            ? new Date(date_creation).toISOString()
            : new Date().toISOString(),
        data: rest,
      };
    },
  },
  {
    appSettingsKey: 'data.commandes',
    table: 'commandes',
    toRow: (c) => {
      const {
        id,
        numero,
        devis_id,
        client_id,
        snapshot_prix_ht,
        statut,
        date_creation,
        date_livraison_prevue,
        ...rest
      } = c as Record<string, unknown>;
      return {
        id,
        numero,
        devis_id: (devis_id as string) || null,
        client_id: (client_id as string) || null,
        prix_ht: snapshot_prix_ht ?? 0,
        statut: statut ?? 'en_preparation',
        date_creation:
          typeof date_creation === 'number'
            ? new Date(date_creation).toISOString()
            : new Date().toISOString(),
        date_livraison_prevue:
          typeof date_livraison_prevue === 'number'
            ? new Date(date_livraison_prevue).toISOString()
            : null,
        data: rest,
      };
    },
  },
  {
    appSettingsKey: 'data.factures',
    table: 'factures',
    toRow: (f) => {
      const {
        id,
        numero,
        commande_id,
        client_id,
        montant_ht,
        montant_ttc,
        statut,
        date_creation,
        date_emission,
        date_echeance,
        ...rest
      } = f as Record<string, unknown>;
      return {
        id,
        numero,
        commande_id: (commande_id as string) || null,
        client_id: (client_id as string) || null,
        montant_ht: montant_ht ?? 0,
        montant_ttc: montant_ttc ?? 0,
        statut: statut ?? 'brouillon',
        date_creation:
          typeof date_creation === 'number'
            ? new Date(date_creation).toISOString()
            : new Date().toISOString(),
        date_emission:
          typeof date_emission === 'number'
            ? new Date(date_emission).toISOString()
            : null,
        date_echeance:
          typeof date_echeance === 'number'
            ? new Date(date_echeance).toISOString()
            : null,
        data: rest,
      };
    },
  },
];

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
    // localStorage déjà migré — on enchaîne sur la migration vers les tables dédiées
    await migrateAppSettingsDataToTables();
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
    await migrateAppSettingsDataToTables();
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

  // Phase 4 : enchaîne sur la migration vers les tables dédiées
  await migrateAppSettingsDataToTables();

  return { migrated, skipped, migratedSlugs, alreadyDone: false };
}

/**
 * Phase 4 — Migration data.{clients,devis,commandes,factures} stocké dans
 * `app_settings` (JSONB array unique) → tables dédiées (1 row par entité,
 * avec colonnes plates indexées + JSONB pour le reste).
 *
 * Idempotente :
 * - Si flag posé → no-op
 * - Si la table cible contient déjà ≥ 1 row → considère que la migration
 *   est déjà faite (ou les données ont été créées via le nouveau hook)
 * - Sinon : copie chaque item depuis `app_settings.data.<entity>` vers
 *   la table, puis SUPPRIME la clé app_settings (sinon double source de vérité)
 */
export async function migrateAppSettingsDataToTables(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.localStorage.getItem(TABLE_MIGRATION_FLAG) === 'true') return;

  const supabase = getSupabase();
  let totalMigrated = 0;

  for (const { appSettingsKey, table, toRow } of ENTITY_MIGRATIONS) {
    // 1. La table dédiée a-t-elle déjà des données ?
    const { count, error: countErr } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    if (countErr) {
      console.error(`[migration/${table}] count failed:`, countErr.message);
      continue;
    }
    if ((count ?? 0) > 0) {
      // Déjà alimentée — purge l'ancienne clé app_settings et passe au suivant
      await supabase.from('app_settings').delete().eq('key', appSettingsKey);
      continue;
    }

    // 2. Récupère l'array depuis app_settings
    const { data: settingsRow, error: getErr } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', appSettingsKey)
      .maybeSingle();
    if (getErr) {
      console.error(`[migration/${table}] read app_settings failed:`, getErr.message);
      continue;
    }
    if (!settingsRow) continue;

    const items = settingsRow.value as unknown;
    if (!Array.isArray(items) || items.length === 0) {
      // Vide → supprime juste la clé
      await supabase.from('app_settings').delete().eq('key', appSettingsKey);
      continue;
    }

    // 3. Insère chaque item dans la table dédiée
    const rows = items
      .map((item) => {
        try {
          return toRow(item as Record<string, unknown>);
        } catch (e) {
          console.error(`[migration/${table}] toRow failed for item:`, item, e);
          return null;
        }
      })
      .filter((r): r is Record<string, unknown> => r !== null);

    if (rows.length === 0) continue;

    const { error: insertErr } = await supabase.from(table).insert(rows as never);
    if (insertErr) {
      console.error(`[migration/${table}] insert failed:`, insertErr.message);
      continue;
    }

    // 4. Succès → supprime la clé app_settings pour éviter double source
    await supabase.from('app_settings').delete().eq('key', appSettingsKey);
    totalMigrated += rows.length;
    console.log(`[migration/${table}] ${rows.length} item(s) migré(s) depuis app_settings`);
  }

  window.localStorage.setItem(TABLE_MIGRATION_FLAG, 'true');

  if (totalMigrated > 0) {
    console.log(
      `[migration] Phase 4 OK — ${totalMigrated} item(s) métier transférés vers tables dédiées.`
    );
  }
}
