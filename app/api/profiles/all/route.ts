import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = 20
    const offset = (page - 1) * limit
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""
    const experience = searchParams.get("experience") || ""
    const profession = searchParams.get("profession") || ""

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from("author_profiles")
      .select(
        `
        id,
        user_id,
        full_name,
        profession,
        location,
        profile_image_url,
        bio,
        experience_years,
        skills,
        created_at,
        user_media!left(
          id,
          file_url,
          file_type,
          is_profile_picture
        )
      `,
        { count: "exact" },
      )
      .eq("is_active", true)

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,bio.ilike.%${search}%,skills.ilike.%${search}%`)
    }

    if (location) {
      query = query.ilike("location", `%${location}%`)
    }

    if (profession) {
      query = query.ilike("profession", `%${profession}%`)
    }

    if (experience) {
      const [min, max] = experience.split("-").map(Number)
      if (max) {
        query = query.gte("experience_years", min).lte("experience_years", max)
      } else if (experience === "10+") {
        query = query.gte("experience_years", 10)
      }
    }

    const {
      data: profiles,
      error,
      count,
    } = await query.range(offset, offset + limit - 1).order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching all profiles:", error)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }

    // Format the data for frontend
    const formattedProfiles =
      profiles?.map((profile) => ({
        id: profile.id,
        name: profile.full_name || "Unknown",
        image:
          profile.profile_image_url ||
          profile.user_media?.find((m) => m.is_profile_picture)?.file_url ||
          "/placeholder.svg?height=400&width=300",
        category: profile.profession || "Professional",
        location: profile.location || "Location not specified",
        experience: profile.experience_years ? `${profile.experience_years}+ years` : "Experience not specified",
        bio: profile.bio,
        skills: profile.skills,
        rating: 4.5 + Math.random() * 0.5, // Temporary until we implement real ratings
        reviewCount: Math.floor(Math.random() * 50) + 5, // Temporary
      })) || []

    return NextResponse.json({
      profiles: formattedProfiles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error in all profiles API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
