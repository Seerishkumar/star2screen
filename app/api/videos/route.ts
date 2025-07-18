import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
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
        console.warn("Videos table not found - returning empty array")
        return NextResponse.json({ videos: [] })
      }
      console.error("Error fetching videos:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Fetched videos:", data?.length || 0, "videos")
    return NextResponse.json({ videos: data || [] })
  } catch (error) {
    console.error("Unexpected error in /api/videos:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
