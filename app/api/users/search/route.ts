import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 User search API called")

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      console.log("❌ Invalid search query:", query)
      return NextResponse.json({
        users: [],
        count: 0,
        query: query || "",
        error: "Search query must be at least 2 characters",
      })
    }

    console.log("🔍 Searching for:", query)

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase environment variables")
      return NextResponse.json(
        {
          error: "Server configuration error",
          users: [],
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // First, check what columns exist in the table
    console.log("🔍 Checking table structure...")
    const { data: tableStructure, error: structureError } = await supabase.from("author_profiles").select("*").limit(1)

    if (structureError) {
      console.error("❌ Error checking table structure:", structureError)
      return NextResponse.json(
        {
          error: "Database structure error",
          details: structureError.message,
          users: [],
        },
        { status: 500 },
      )
    }

    console.log("✅ Table structure sample:", tableStructure?.[0] ? Object.keys(tableStructure[0]) : "No data")

    // Build dynamic SELECT query based on available columns
    const availableColumns = tableStructure?.[0] ? Object.keys(tableStructure[0]) : []
    const baseColumns = ["id", "user_id", "display_name", "full_name", "bio"]
    const optionalColumns = ["profession", "profile_picture_url", "category", "location"]

    const selectColumns = [
      ...baseColumns.filter((col) => availableColumns.includes(col)),
      ...optionalColumns.filter((col) => availableColumns.includes(col)),
    ]

    console.log("🔍 Using columns:", selectColumns)

    // Search in author_profiles
    const { data: profiles, error } = await supabase
      .from("author_profiles")
      .select(selectColumns.join(", "))
      .or(
        `display_name.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%${
          availableColumns.includes("profession") ? `,profession.ilike.%${query}%` : ""
        }`,
      )
      .limit(10)

    if (error) {
      console.error("❌ Error searching profiles:", error)
      return NextResponse.json(
        {
          error: "Search failed",
          details: error.message,
          users: [],
        },
        { status: 500 },
      )
    }

    console.log("✅ Found profiles:", profiles?.length || 0)

    // Transform profiles to include fallback values for missing columns
    const users = (profiles || []).map((profile) => ({
      id: profile.id,
      user_id: profile.user_id,
      display_name: profile.display_name || profile.full_name || "Unknown User",
      stage_name: profile.display_name,
      full_name: profile.full_name || profile.display_name || "Unknown User",
      bio: profile.bio || "",
      profession: profile.profession || "Not specified",
      profile_picture_url: profile.profile_picture_url || null,
      category: profile.category || "Not specified",
      location: profile.location || "Not specified",
    }))

    console.log("🔄 Transformed users:", users.length)

    return NextResponse.json({
      users,
      count: users.length,
      query,
    })
  } catch (error) {
    console.error("💥 Unexpected error in user search:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        users: [],
      },
      { status: 500 },
    )
  }
}
