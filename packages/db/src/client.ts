import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

export type AvenirSupabaseClient = SupabaseClient<Database>;

/**
 * Factory client Supabase typé pour la base Avenir Numérique.
 *
 * Usage typique côté navigateur :
 * ```ts
 * const supabase = createSupabaseBrowserClient(
 *   process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 * );
 * ```
 *
 * La session auth est persistée automatiquement (localStorage) par le SDK.
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
