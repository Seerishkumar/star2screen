import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim() || "sud"

    const supabase = createServerSupabaseClient()

    // Test database connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("author_profiles")
      .select("count(*)")
      .limit(1)

    if (connectionError) {
      return NextResponse.json({
        error: "Database connection failed",
        details: connectionError.message,
        debug: {
          query,
          connectionTest: false,
        },
      })
    }

    // Get all profiles for debugging
    const { data: allProfiles, error: allError } = await supabase
      .from("author_profiles")
      .select("user_id, display_name, stage_name, full_name, profession")
      .limit(20)

    // Test search query
    const { data: searchResults, error: searchError } = await supabase
      .from("author_profiles")
      .select(`
        user_id,
        display_name,
        stage_name,
        full_name,
        profession,
        location,
        profile_picture_url,
        is_verified
      `)
      .or(
        `display_name.ilike.%${query}%,stage_name.ilike.%${query}%,full_name.ilike.%${query}%,profession.ilike.%${query}%`,
      )
      .limit(10)

    return NextResponse.json({
      debug: {
        query,
        connectionTest: !connectionError,
        totalProfiles: allProfiles?.length || 0,
        searchResults: searchResults?.length || 0,
        searchError: searchError?.message || null,
      },
      allProfiles: allProfiles || [],
      searchResults: searchResults || [],
      errors: {
        connection: connectionError?.message || null,
        search: searchError?.message || null,
      },
    })
  } catch (error) {
    return NextResponse.json({
      error: "Debug endpoint failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
