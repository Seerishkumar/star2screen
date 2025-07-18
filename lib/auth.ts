import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Create a Supabase client for server-side operations
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL")
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// Get current user on server side
export const getCurrentUser = async () => {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get author profile
    const { data: profile } = await supabase.from("author_profiles").select("*").eq("user_id", user.id).single()

    return {
      ...user,
      profile,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Check if user is admin
export const isAdmin = async (userId?: string) => {
  if (!userId) return false

  try {
    const supabase = createServerSupabaseClient()

    const { data } = await supabase.from("author_profiles").select("is_admin").eq("user_id", userId).single()

    return data?.is_admin || false
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
