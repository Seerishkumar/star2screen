import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Production environment variables - no local setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Universal factory for creating Supabase clients
export function createClient(url: string = supabaseUrl, key: string = supabaseAnonKey) {
  return createSupabaseClient(url, key, {
    auth: {
      persistSession: typeof window !== "undefined", // Only persist in browser
      autoRefreshToken: typeof window !== "undefined",
      detectSessionInUrl: typeof window !== "undefined",
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "X-Client-Info": "stars2screen-app",
      },
    },
  })
}

// Browser client singleton
let browserClient: ReturnType<typeof createSupabaseClient> | null = null

export function getBrowserClient() {
  if (typeof window === "undefined") {
    return null
  }

  if (!browserClient) {
    browserClient = createClient()
  }

  return browserClient
}

// Default export for client-side usage
export const supabase = getBrowserClient() ?? createClient()

// Server-side client with service role key for admin operations
export function createServerSupabaseClient() {
  if (!serviceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not found, using anon key")
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

// Admin client for database operations that require elevated permissions
export function createAdminClient() {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations")
  }

  return createClient(supabaseUrl, serviceRoleKey)
}
