import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    console.log("🔍 User search API called")
    console.log("🔍 Search query:", query)

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          error: "Search query must be at least 2 characters",
          users: [],
        },
        { status: 400 },
      )
    }

    // Check what columns exist in the table
    console.log("📊 Checking table structure...")
    const { data: tableInfo, error: tableError } = await supabase
      .rpc("get_table_columns", { table_name: "author_profiles" })
      .single()

    if (tableError) {
      console.log("⚠️ Could not check table structure, using basic columns")
    }

    // Build dynamic SELECT query based on available columns
    let selectColumns = `
      user_id,
      display_name,
      full_name,
      bio
    `

    // Add optional columns if they exist
    const { data: columnCheck } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "author_profiles")
      .in("column_name", ["profile_picture_url", "category", "location"])

    if (columnCheck && columnCheck.length > 0) {
      const availableColumns = columnCheck.map((col) => col.column_name)
      if (availableColumns.includes("profile_picture_url")) {
        selectColumns += ", profile_picture_url"
      }
      if (availableColumns.includes("category")) {
        selectColumns += ", category"
      }
      if (availableColumns.includes("location")) {
        selectColumns += ", location"
      }
    }

    console.log("📊 Using SELECT columns:", selectColumns)

    // Search for users
    const { data: profiles, error: searchError } = await supabase
      .from("author_profiles")
      .select(selectColumns)
      .or(`display_name.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10)

    if (searchError) {
      console.error("❌ Search error:", searchError)
      return NextResponse.json(
        {
          error: "Search failed",
          details: searchError.message,
          users: [],
        },
        { status: 500 },
      )
    }

    console.log("✅ Found profiles:", profiles?.length || 0)

    // Transform the results to ensure consistent structure
    const transformedUsers = (profiles || []).map((profile) => ({
      user_id: profile.user_id,
      display_name: profile.display_name || profile.full_name || "Unknown User",
      full_name: profile.full_name || profile.display_name || "Unknown User",
      bio: profile.bio || "",
      profile_picture_url: profile.profile_picture_url || null,
      category: profile.category || "Not specified",
      location: profile.location || "Not specified",
    }))

    console.log("🔄 Transformed users:", transformedUsers.length)

    return NextResponse.json({
      users: transformedUsers,
      query: query,
    })
  } catch (error) {
    console.error("❌ Search API error:", error)
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
