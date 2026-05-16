/**
 * @avenir/db — Couche d'accès Supabase / Postgres pour Avenir Numérique.
 *
 * Conventions :
 * - Types Database / Tables dans `./types`
 * - Factory client browser dans `./client`
 * - Pas de logique métier ici (juste accès données) — la logique vit dans
 *   `apps/admin/lib/` (hooks, transformations…)
 */

export {
  createSupabaseBrowserClient,
  type AvenirSupabaseClient,
} from './client';

export type { Database } from './types';
