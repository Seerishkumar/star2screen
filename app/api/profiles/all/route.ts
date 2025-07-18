import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const location = searchParams.get("location")

    console.log("All profiles API called with params:", { search, category, location })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    let query = supabase.from("author_profiles").select("*").order("created_at", { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,stage_name.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    if (category && category !== "All Categories") {
      query = query.contains("primary_roles", [category])
    }

    if (location) {
      query = query.or(`city.ilike.%${location}%,location.ilike.%${location}%`)
    }

    const { data: profiles, error } = await query.limit(50)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch profiles", details: error.message }, { status: 500 })
    }

    console.log(`Found ${profiles?.length || 0} profiles`)
    return NextResponse.json(profiles || [])
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
