import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[/api/profiles/featured] Starting featured profiles fetch...")

    // Get ALL profiles from the database (not just verified ones)
    const { data: profiles, error: profilesError } = await supabase
      .from("author_profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20) // Increased limit to show more profiles

    if (profilesError) {
      console.error("[/api/profiles/featured] Profile query error:", profilesError)
      if (profilesError.code === "42P01") {
        console.log("[/api/profiles/featured] author_profiles table doesn't exist")
        return NextResponse.json({ profiles: [] })
      }
      return NextResponse.json(
        {
          error: profilesError.message,
          code: profilesError.code,
          details: profilesError,
        },
        { status: 500 },
      )
    }

    console.log(`[/api/profiles/featured] Found ${profiles?.length || 0} total profiles`)

    if (!profiles || profiles.length === 0) {
      console.log("[/api/profiles/featured] No profiles found in database")
      return NextResponse.json({
        profiles: [],
        message: "No profiles found in database",
        debug: {
          query: "SELECT * FROM author_profiles ORDER BY created_at DESC LIMIT 20",
          error: null,
        },
      })
    }

    // Get media for all profiles in one efficient query
    const userIds = profiles.map((p) => p.user_id)
    console.log(`[/api/profiles/featured] Fetching media for ${userIds.length} users`)

    const { data: mediaFiles, error: mediaError } = await supabase
      .from("user_media")
      .select("user_id, file_url, blob_url, media_type, is_profile_picture, created_at")
      .in("user_id", userIds)
      .eq("media_type", "image")
      .order("created_at", { ascending: false })

    if (mediaError) {
      console.error("[/api/profiles/featured] Media query error:", mediaError)
      // Continue without media if table doesn't exist or has issues
    }

    console.log(`[/api/profiles/featured] Found ${mediaFiles?.length || 0} media files`)

    // Process each profile and attach their media
    const profilesWithMedia = profiles.map((profile) => {
      const userMedia = mediaFiles?.filter((media) => media.user_id === profile.user_id) || []

      // Find profile picture first, then any image
      const profilePicture = userMedia.find((media) => media.is_profile_picture === true)
      const anyImage = userMedia[0] // First image if no profile picture

      // Determine the best image URL
      let imageUrl = null
      if (profilePicture) {
        imageUrl = profilePicture.blob_url || profilePicture.file_url
      } else if (anyImage) {
        imageUrl = anyImage.blob_url || anyImage.file_url
      } else if (profile.avatar_url) {
        imageUrl = profile.avatar_url
      }

      const processedProfile = {
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        display_name: profile.display_name,
        stage_name: profile.stage_name,
        bio: profile.bio,
        category: profile.category,
        profession: profile.profession,
        primary_roles: profile.primary_roles,
        location: profile.location,
        city: profile.city,
        experience_years: profile.experience_years,
        is_verified: profile.is_verified || false,
        avatar_url: profile.avatar_url,
        profile_image: imageUrl,
        media_count: userMedia.length,
        has_profile_picture: !!profilePicture,
        has_any_image: !!anyImage,
        created_at: profile.created_at,
      }

      console.log(
        `[/api/profiles/featured] Processed ${profile.full_name || profile.display_name || "Unknown"}: image=${!!imageUrl}, media_count=${userMedia.length}`,
      )

      return processedProfile
    })

    console.log(`[/api/profiles/featured] Successfully processed ${profilesWithMedia.length} profiles`)

    return NextResponse.json({
      profiles: profilesWithMedia,
      count: profilesWithMedia.length,
      total_in_db: profiles.length,
      profiles_with_images: profilesWithMedia.filter((p) => p.profile_image).length,
      profiles_without_images: profilesWithMedia.filter((p) => !p.profile_image).length,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      debug: {
        total_profiles_queried: profiles.length,
        total_media_files: mediaFiles?.length || 0,
        user_ids_searched: userIds.length,
      },
    })
  } catch (error) {
    console.error("[/api/profiles/featured] Unexpected error:", error)
    return NextResponse.json(
      {
        profiles: [],
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}
