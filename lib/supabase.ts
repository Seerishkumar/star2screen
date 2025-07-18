import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Get environment variables with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// Create a single supabase client for the browser
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Create a helper for server components
export const createServerSupabaseClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Re-export the factory so other modules can create ad-hoc clients if needed
export const createClient = createSupabaseClient
