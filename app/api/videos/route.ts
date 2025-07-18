import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured") === "true"

    console.log(`[/api/videos] Fetching videos, featured: ${featured}`)

    let query = supabase
      .from("videos")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6)

    if (featured) {
      query = query.eq("is_featured", true)
    }

    const { data: videos, error } = await query

    if (error) {
      console.error("[/api/videos] Database error:", error)
      if (error.code === "42P01") {
        // Table doesn't exist, return sample data
        const sampleVideos = [
          {
            id: 1,
            title: "Acting Masterclass: Emotional Range",
            description: "Learn how to expand your emotional range as an actor",
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            thumbnail_url: "/confident-actress.png",
          },
          {
            id: 2,
            title: "Behind the Camera: Cinematography Basics",
            description: "Essential cinematography techniques every filmmaker should know",
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            thumbnail_url: "/bustling-film-set.png",
          },
          {
            id: 3,
            title: "Director's Vision: From Script to Screen",
            description: "How directors bring their creative vision to life",
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            thumbnail_url: "/director-in-discussion.png",
          },
        ]
        return NextResponse.json({ videos: sampleVideos })
      }
      return NextResponse.json({ videos: [] })
    }

    console.log(`[/api/videos] Found ${videos?.length || 0} videos`)
    return NextResponse.json({ videos: videos || [] })
  } catch (error) {
    console.error("[/api/videos] Unexpected error:", error)
    return NextResponse.json({ videos: [] })
  }
}
