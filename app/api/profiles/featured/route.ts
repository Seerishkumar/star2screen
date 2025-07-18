import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Featured profiles API called")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    console.log("Querying author_profiles table...")

    // Get profiles with better filtering
    const { data: profiles, error: profilesError } = await supabase
      .from("author_profiles")
      .select("*")
      .not("full_name", "is", null)
      .order("created_at", { ascending: false })
      .limit(12)

    if (profilesError) {
      console.error("Database error:", profilesError)
      return NextResponse.json(
        { error: "Failed to fetch featured profiles", details: profilesError.message },
        { status: 500 },
      )
    }

    console.log(`Found ${profiles?.length || 0} profiles`)

    if (!profiles || profiles.length === 0) {
      console.log("No profiles found in database")
      return NextResponse.json({ profiles: [] })
    }

    // Get profile pictures from user_media for each profile
    const profilesWithImages = await Promise.all(
      profiles.map(async (profile) => {
        console.log(`Processing profile: ${profile.full_name} (${profile.user_id})`)

        // Try to get profile picture from user_media - check multiple conditions
        const { data: profilePictureMedia } = await supabase
          .from("user_media")
          .select("blob_url, file_url, title, media_type")
          .eq("user_id", profile.user_id)
          .eq("is_profile_picture", true)
          .eq("media_type", "image")
          .single()

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

        const mediaFile = profilePictureMedia || fallbackMedia

        // Determine the best image URL to use
        let profileImageUrl = null
        if (mediaFile) {
          profileImageUrl = mediaFile.blob_url || mediaFile.file_url
          console.log(`Found media for ${profile.full_name}: ${profileImageUrl}`)
        } else {
          profileImageUrl = profile.avatar_url
          console.log(`Using avatar_url for ${profile.full_name}: ${profileImageUrl}`)
        }

        // Get all media count for this user
        const { count: mediaCount } = await supabase
          .from("user_media")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.user_id)

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
          debug_info: {
            profile_picture_media: profilePictureMedia,
            fallback_media: fallbackMedia,
            final_image_url: profileImageUrl,
          },
        }
      }),
    )

    console.log("Returning profiles with images:", profilesWithImages.length)

    // Log each profile's image status
    profilesWithImages.forEach((profile) => {
      console.log(`${profile.full_name}: image=${!!profile.profile_picture_url}, media_count=${profile.media_count}`)
    })

    return NextResponse.json({ profiles: profilesWithImages })
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
