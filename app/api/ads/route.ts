import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[/api/ads] Starting ads fetch...")
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === "42P01") {
        console.warn("[/api/ads] ads table not found - returning empty array")
        return NextResponse.json({ ads: [] })
      }
      console.error("[/api/ads] database error:", error)
      return NextResponse.json({
        ads: [],
        error: error.message,
        code: error.code,
        environment: process.env.NODE_ENV,
      })
    }

    console.log(`[/api/ads] Successfully fetched ${data?.length || 0} ads`)
    return NextResponse.json({
      ads: data || [],
      count: data?.length || 0,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[/api/ads] unexpected error:", error)
    return NextResponse.json({
      ads: [],
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
      environment: process.env.NODE_ENV,
    })
  }
}
