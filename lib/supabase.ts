import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Environment safety-checks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:", {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!serviceRoleKey,
  })
  throw new Error(
    "Missing Supabase env vars: make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set",
  )
}

// Universal factory (works in both browser & server contexts)
export function createClient(url: string = supabaseUrl, key: string = supabaseAnonKey) {
  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false, // Important for server-side usage
    },
  })
}

// Browser singleton – avoids "duplicate connection" warnings
let _browserClient: ReturnType<typeof createSupabaseClient> | undefined

function getBrowserClient() {
  if (typeof window === "undefined") return null
  if (!_browserClient) {
    _browserClient = createClient()
  }
  return _browserClient
}

// Exported singleton that Just Works™ everywhere
export const supabase = getBrowserClient() ?? createClient(supabaseUrl, supabaseAnonKey)

// Helper for Server Components / API routes needing elevated privileges
export function createServerSupabaseClient() {
  if (!serviceRoleKey) {
    console.warn("Missing SUPABASE_SERVICE_ROLE_KEY – using anon key instead")
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
