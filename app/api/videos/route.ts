import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    console.log("[/api/videos] Starting videos fetch...")
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")

    const supabase = createServerSupabaseClient()

    let query = supabase.from("videos").select("*").eq("is_active", true).order("created_at", { ascending: false })

    if (featured === "true") {
      query = query.eq("is_featured", true)
    }

    const { data, error } = await query

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === "42P01") {
        console.warn("[/api/videos] videos table not found - returning empty array")
        return NextResponse.json({ videos: [] })
      }
      console.error("[/api/videos] database error:", error)
      return NextResponse.json({
        videos: [],
        error: error.message,
        code: error.code,
        environment: process.env.NODE_ENV,
      })
    }

    console.log(`[/api/videos] Successfully fetched ${data?.length || 0} videos (featured: ${featured})`)
    return NextResponse.json({
      videos: data || [],
      count: data?.length || 0,
      featured: featured === "true",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[/api/videos] unexpected error:", error)
    return NextResponse.json({
      videos: [],
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
      environment: process.env.NODE_ENV,
    })
  }
}
