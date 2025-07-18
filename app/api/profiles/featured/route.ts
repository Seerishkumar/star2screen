import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Featured profiles API called - Environment:", process.env.NODE_ENV)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: {
            hasSupabaseUrl: !!supabaseUrl,
            hasServiceRoleKey: !!serviceRoleKey,
            environment: process.env.NODE_ENV,
          },
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    console.log("Querying author_profiles table...")

    // Get profiles with better filtering - more robust query
    const { data: profiles, error: profilesError } = await supabase
      .from("author_profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12)

    if (profilesError) {
      console.error("Database error:", profilesError)
      return NextResponse.json(
        {
          error: "Failed to fetch featured profiles",
          details: profilesError.message,
          code: profilesError.code,
          environment: process.env.NODE_ENV,
        },
        { status: 500 },
      )
    }

    console.log(`Found ${profiles?.length || 0} profiles`)

    if (!profiles || profiles.length === 0) {
      console.log("No profiles found in database")
      return NextResponse.json({
        profiles: [],
        message: "No profiles found",
        environment: process.env.NODE_ENV,
      })
    }

    // Process profiles with better error handling
    const profilesWithImages = await Promise.allSettled(
      profiles.map(async (profile) => {
        try {
          const profileName = profile.display_name || profile.stage_name || profile.full_name || "Unknown"
          console.log(`Processing profile: ${profileName} (${profile.user_id})`)

          // Try to get profile picture from user_media
          const { data: profilePictureMedia, error: mediaError } = await supabase
            .from("user_media")
            .select("blob_url, file_url, title, media_type")
            .eq("user_id", profile.user_id)
            .eq("is_profile_picture", true)
            .eq("media_type", "image")
            .single()

          if (mediaError && mediaError.code !== "PGRST116") {
            console.warn(`Media query error for ${profileName}:`, mediaError)
          }

          // If no specific profile picture, get the first image
          let fallbackMedia = null
          if (!profilePictureMedia) {
            const { data: firstImageMedia } = await supabase
              .from("user_media")
              .select("blob_url, file_url, title, media_type")
              .eq("user_id", profile.user_id)
              .eq("media_type", "image")
              .order("created_at", { ascending: false })
              .limit(1)
              .single()

            fallbackMedia = firstImageMedia
          }

          // Get total media count for this user
          const { count: mediaCount } = await supabase
            .from("user_media")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.user_id)

          const mediaFile = profilePictureMedia || fallbackMedia

          // Determine the best image URL to use
          let profileImageUrl = null
          if (mediaFile) {
            profileImageUrl = mediaFile.blob_url || mediaFile.file_url
            console.log(`Found media for ${profileName}: ${profileImageUrl}`)
          } else if (profile.avatar_url) {
            profileImageUrl = profile.avatar_url
            console.log(`Using avatar_url for ${profileName}: ${profileImageUrl}`)
          } else {
            console.log(`No image found for ${profileName}`)
          }

          return {
            id: profile.id || profile.user_id,
            user_id: profile.user_id,
            display_name: profile.display_name,
            stage_name: profile.stage_name,
            full_name: profile.full_name,
            bio: profile.bio,
            city: profile.city,
            location: profile.location,
            experience_years: profile.experience_years,
            primary_roles: profile.primary_roles,
            profession: profile.profession,
            avatar_url: profile.avatar_url,
            profile_picture_url: profileImageUrl,
            is_verified: profile.is_verified,
            verified: profile.is_verified || false,
            created_at: profile.created_at,
            media_count: mediaCount || 0,
            has_profile_picture: !!profilePictureMedia,
            has_fallback_image: !!fallbackMedia,
          }
        } catch (error) {
          console.error(`Error processing profile ${profile.user_id}:`, error)
          // Return profile with minimal data if processing fails
          return {
            id: profile.id || profile.user_id,
            user_id: profile.user_id,
            display_name: profile.display_name,
            stage_name: profile.stage_name,
            full_name: profile.full_name,
            bio: profile.bio,
            city: profile.city,
            location: profile.location,
            experience_years: profile.experience_years,
            primary_roles: profile.primary_roles,
            profession: profile.profession,
            avatar_url: profile.avatar_url,
            profile_picture_url: profile.avatar_url,
            is_verified: profile.is_verified,
            verified: profile.is_verified || false,
            created_at: profile.created_at,
            media_count: 0,
            has_profile_picture: false,
            has_fallback_image: false,
            processing_error: error instanceof Error ? error.message : "Unknown error",
          }
        }
      }),
    )

    // Filter successful results
    const successfulProfiles = profilesWithImages
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
      .map((result) => result.value)

    console.log("Returning profiles with images:", successfulProfiles.length)

    // Log each profile's image status
    successfulProfiles.forEach((profile) => {
      const name = profile.display_name || profile.stage_name || profile.full_name || "Unknown"
      console.log(`${name}: image=${!!profile.profile_picture_url}, media_count=${profile.media_count}`)
    })

    return NextResponse.json({
      profiles: successfulProfiles,
      total: successfulProfiles.length,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
