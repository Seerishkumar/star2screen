import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { category: string } }) {
  try {
    const { category } = params
    console.log("Fetching profiles for category:", category)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Query author_profiles only, no joins to avoid relationship errors
    let query = supabase.from("author_profiles").select("*").order("created_at", { ascending: false }).limit(20)

    // Filter by category in primary_roles array
    if (category && category !== "all") {
      query = query.contains("primary_roles", [category])
    }

    const { data: profiles, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch profiles", details: error.message }, { status: 500 })
    }

    console.log(`Found ${profiles?.length || 0} profiles for category: ${category}`)

    // Transform data to match expected frontend format
    const transformedProfiles = (profiles || []).map((profile) => ({
      id: profile.id || profile.user_id,
      full_name: profile.display_name || profile.stage_name || profile.full_name || "Unknown Professional",
      category: profile.primary_roles?.[0] || profile.profession || category,
      location: profile.city || profile.location || "Location not specified",
      experience_years: profile.experience_years || 0,
      bio: profile.bio || "No bio available",
      profile_image_url: profile.avatar_url || profile.profile_picture_url || null,
      rating: profile.average_rating || null,
      verified: profile.is_verified || false,
    }))

    return NextResponse.json({ profiles: transformedProfiles })
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
