'use client';

import { createSupabaseBrowserClient, type AvenirSupabaseClient } from '@avenir/db';

let client: AvenirSupabaseClient | null = null;

/**
 * Renvoie le client Supabase singleton côté navigateur.
 *
 * Le SDK Supabase gère la session auth en localStorage automatiquement
 * (clé `sb-<project-ref>-auth-token`). Pas de besoin de cookies pour
 * cette MVP — auth purement client-side.
 *
 * Throws si les variables d'environnement ne sont pas définies.
 */
export function getSupabase(): AvenirSupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Variables Supabase manquantes. Vérifie apps/admin/.env.local : ' +
        'NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  client = createSupabaseBrowserClient(url, key);
  return client;
}
