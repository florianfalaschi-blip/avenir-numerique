import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

/**
 * Client Supabase côté serveur (service role — jamais exposé au client)
 */
export function createServerClient() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY']

  if (!url || !key) {
    throw new Error('Variables SUPABASE manquantes dans .env')
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  })
}

/**
 * Client Supabase côté navigateur (anon key)
 */
export function createBrowserClient() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const key = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!url || !key) {
    throw new Error('Variables SUPABASE manquantes dans .env')
  }

  return createClient<Database>(url, key)
}
