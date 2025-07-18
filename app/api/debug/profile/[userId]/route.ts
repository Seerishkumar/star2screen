import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    console.log("Debugging profile for userId:", userId)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from("author_profiles")
      .select("*")
      .eq("user_id", userId)
      .single()

    console.log("Profile data:", profile)
    console.log("Profile error:", profileError)

    // Get all media files for this user
    const { data: mediaFiles, error: mediaError } = await supabase
      .from("user_media")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    console.log("Media files:", mediaFiles)
    console.log("Media error:", mediaError)

    // Get profile picture specifically
    const { data: profilePicture, error: profilePictureError } = await supabase
      .from("user_media")
      .select("*")
      .eq("user_id", userId)
      .eq("is_profile_picture", true)
      .single()

    console.log("Profile picture:", profilePicture)
    console.log("Profile picture error:", profilePictureError)

    // Check if user exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    console.log("Auth user:", authUser)
    console.log("Auth error:", authError)

    return NextResponse.json({
      userId,
      profile,
      profileError,
      mediaFiles,
      mediaError,
      profilePicture,
      profilePictureError,
      authUser: authUser?.user || null,
      authError,
      mediaCount: mediaFiles?.length || 0,
      hasProfilePicture: !!profilePicture,
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
