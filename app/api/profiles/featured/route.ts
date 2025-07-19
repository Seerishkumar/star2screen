import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[/api/profiles/featured] Starting featured profiles fetch...")
    console.log("[/api/profiles/featured] Environment:", process.env.NODE_ENV)

    // Get all profiles from author_profiles table
    const { data: profiles, error: profilesError } = await supabase.from("author_profiles").select("*").limit(20)

    if (profilesError) {
      console.error("[/api/profiles/featured] Profiles query error:", profilesError)
      return NextResponse.json({
        profiles: [],
        error: profilesError.message,
        code: profilesError.code,
      })
    }

    if (!profiles || profiles.length === 0) {
      console.log("[/api/profiles/featured] No profiles found")
      return NextResponse.json({
        profiles: [],
        count: 0,
        message: "No profiles found in database",
      })
    }

    console.log(`[/api/profiles/featured] Found ${profiles.length} profiles`)

    // Get media for all profiles
    const userIds = profiles.map((p) => p.user_id).filter(Boolean)
    let mediaFiles = []

    if (userIds.length > 0) {
      const { data: mediaData, error: mediaError } = await supabase
        .from("user_media")
        .select("*")
        .in("user_id", userIds)
        .eq("media_type", "image")

      if (mediaError) {
        console.warn("[/api/profiles/featured] Media query failed:", mediaError.message)
      } else {
        mediaFiles = mediaData || []
        console.log(`[/api/profiles/featured] Found ${mediaFiles.length} media files`)
      }
    }

    // Combine profiles with their media
    const profilesWithMedia = profiles.map((profile) => {
      // Find media for this user
      const userMedia = mediaFiles.filter((media) => media.user_id === profile.user_id)

      // Find profile picture or first image
      const profilePicture = userMedia.find((media) => media.is_profile_picture === true)
      const firstImage = userMedia[0]

      // Determine the best image URL
      let imageUrl = null
      if (profilePicture) {
        imageUrl = profilePicture.blob_url || profilePicture.file_url
      } else if (firstImage) {
        imageUrl = firstImage.blob_url || firstImage.file_url
      }

      return {
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name || profile.display_name || profile.stage_name || "Professional",
        bio: profile.bio || "No bio available",
        location: profile.city || profile.location || "Location not specified",
        category: profile.profession || profile.category || "Professional",
        is_verified: Boolean(profile.is_verified),
        profile_image: imageUrl,
        media_count: userMedia.length,
        experience_years: profile.experience_years || 0,
        hourly_rate: profile.hourly_rate,
        availability_status: profile.availability_status || "available",
        created_at: profile.created_at,
      }
    })

    console.log(`[/api/profiles/featured] Returning ${profilesWithMedia.length} profiles with media`)

    return NextResponse.json({
      profiles: profilesWithMedia,
      count: profilesWithMedia.length,
      stats: {
        totalProfiles: profiles.length,
        profilesWithImages: profilesWithMedia.filter((p) => p.profile_image).length,
        totalMediaFiles: mediaFiles.length,
      },
      debug: {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[/api/profiles/featured] Unexpected error:", error)
    return NextResponse.json({
      profiles: [],
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
