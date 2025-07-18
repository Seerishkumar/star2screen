import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Centralised helpers to work with Supabase on both the client and the server.
 * ---------------------------------------------------------------------------
 * • `supabase`   – singleton client you can import anywhere (browser & server)
 * • `createClient` – factory in case you need an ad-hoc client (e.g. RLS bypass)
 * • `createServerSupabaseClient` – convenience wrapper that uses the Service-Role
 */

// ---------------------------------------------------------------------------
// Environment safety-checks
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY // may be undefined

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars: make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set",
  )
}

// ---------------------------------------------------------------------------
// Universal factory (works in both browser & server contexts)
// ---------------------------------------------------------------------------
export function createClient(url: string = supabaseUrl, key: string = supabaseAnonKey) {
  return createSupabaseClient(url, key)
}

// ---------------------------------------------------------------------------
// Browser singleton – avoids “duplicate connection” warnings
// ---------------------------------------------------------------------------
let _browserClient: ReturnType<typeof createSupabaseClient> | undefined

function getBrowserClient() {
  if (typeof window === "undefined") return null
  if (!_browserClient) _browserClient = createClient()
  return _browserClient
}

// ---------------------------------------------------------------------------
// Exported singleton that Just Works™ everywhere
// ---------------------------------------------------------------------------
export const supabase = getBrowserClient() ?? createClient(supabaseUrl, supabaseAnonKey)

// ---------------------------------------------------------------------------
// Helper for Server Components / API routes needing elevated privileges
// ---------------------------------------------------------------------------
export function createServerSupabaseClient() {
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY – required for server-side admin access")
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
