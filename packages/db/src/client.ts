import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

export type AvenirSupabaseClient = SupabaseClient<Database>;

/**
 * Factory client Supabase typé — côté navigateur (anon key).
 *
 * Usage :
 * ```ts
 * const supabase = createSupabaseBrowserClient(
 *   process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 * );
 * ```
 */
export function createSupabaseBrowserClient(
  url: string,
  anonKey: string
): AvenirSupabaseClient {
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Factory client Supabase — côté serveur (service role key).
 * NE JAMAIS exposer côté client/navigateur.
 */
export function createSupabaseServerClient(
  url: string,
  serviceRoleKey: string
): AvenirSupabaseClient {
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
