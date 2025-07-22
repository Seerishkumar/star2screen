import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured") === "true"

    console.log(`[/api/videos] Fetching videos, featured: ${featured}`)

    // Rich fallback data for production
    const fallbackVideos = [
      {
        id: 1,
        title: "Acting Masterclass: Emotional Range and Depth",
        description: "Learn how to expand your emotional range and bring authentic depth to your performances",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "/confident-actress.png",
        is_active: true,
        is_featured: true,
      },
      {
        id: 2,
        title: "Behind the Camera: Cinematography Essentials",
        description: "Essential cinematography techniques every filmmaker and actor should understand",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "/bustling-film-set.png",
        is_active: true,
        is_featured: true,
      },
      {
        id: 3,
        title: "Director's Vision: From Script to Screen",
        description: "How directors bring their creative vision to life and work with actors",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "/director-in-discussion.png",
        is_active: true,
        is_featured: true,
      },
      {
        id: 4,
        title: "Casting Director Insights: What We Look For",
        description: "Industry professionals share what they look for in auditions and headshots",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "/elegant-actress.png",
        is_active: true,
        is_featured: false,
      },
      {
        id: 5,
        title: "Building Your Acting Portfolio",
        description: "Tips for creating a compelling portfolio that gets you noticed",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "/confident-young-professional.png",
        is_active: true,
        is_featured: false,
      },
      {
        id: 6,
        title: "Networking in the Entertainment Industry",
        description: "How to build meaningful professional relationships in Hollywood",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "/bustling-city-street.png",
        is_active: true,
        is_featured: false,
      },
    ]

    try {
      const supabase = createServerSupabaseClient()

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

      // If we have valid data from database, use it
      if (!error && videos && videos.length > 0) {
        console.log(`[/api/videos] Found ${videos.length} videos from database`)
        return NextResponse.json({ videos })
      }

      // If database fails or returns no data, use fallback
      console.log("[/api/videos] Using fallback data")
      const filteredVideos = featured ? fallbackVideos.filter((v) => v.is_featured) : fallbackVideos

      return NextResponse.json({ videos: filteredVideos.slice(0, 6) })
    } catch (dbError) {
      console.error("[/api/videos] Database connection error:", dbError)
      const filteredVideos = featured ? fallbackVideos.filter((v) => v.is_featured) : fallbackVideos

      return NextResponse.json({ videos: filteredVideos.slice(0, 6) })
    }
  } catch (error) {
    console.error("[/api/videos] Unexpected error:", error)

    // Always return fallback data on any error
    const sampleVideos = [
      {
        id: 1,
        title: "Acting Masterclass: Emotional Range",
        description: "Learn how to expand your emotional range as an actor",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "/confident-actress.png",
      },
    ]
    return NextResponse.json({ videos: sampleVideos })
  }
}
