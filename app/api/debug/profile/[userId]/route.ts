import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId
    console.log(`Debug profile API called for user: ${userId}`)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error: "Missing environment variables",
          details: {
            hasSupabaseUrl: !!supabaseUrl,
            hasServiceRoleKey: !!serviceRoleKey,
          },
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from("author_profiles")
      .select("*")
      .eq("user_id", userId)
      .single()

    // Get all media files for this user
    const { data: mediaFiles, error: mediaError } = await supabase
      .from("user_media")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // Get auth user data
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)

    const debugInfo = {
      userId,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      profile: {
        found: !!profile,
        data: profile,
        error: profileError,
      },
      media: {
        count: mediaFiles?.length || 0,
        files: mediaFiles,
        error: mediaError,
      },
      authUser: {
        found: !!authUser.user,
        email: authUser.user?.email,
        error: authError,
      },
      analysis: {
        hasProfilePicture: mediaFiles?.some((m) => m.is_profile_picture && m.media_type === "image") || false,
        hasAnyImages: mediaFiles?.some((m) => m.media_type === "image") || false,
        profilePictureUrl:
          mediaFiles?.find((m) => m.is_profile_picture && m.media_type === "image")?.blob_url ||
          mediaFiles?.find((m) => m.is_profile_picture && m.media_type === "image")?.file_url,
        firstImageUrl:
          mediaFiles?.find((m) => m.media_type === "image")?.blob_url ||
          mediaFiles?.find((m) => m.media_type === "image")?.file_url,
        avatarUrl: profile?.avatar_url,
      },
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error("Profile debug error:", error)
    return NextResponse.json(
      {
        error: "Profile debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
        userId: params.userId,
        environment: process.env.NODE_ENV,
      },
      { status: 500 },
    )
  }
}
