import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  const supabase = createServerSupabaseClient()

  try {
    console.log("[/api/banners] Starting banner fetch...")

    // Try with display_order first
    let { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    // If display_order column doesn't exist, try sort_order
    if (error?.code === "42703") {
      console.log("[/api/banners] display_order column not found, trying sort_order...")
      ;({ data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }))
    }

    // If table doesn't exist at all
    if (error?.code === "42P01") {
      console.warn("[/api/banners] banners table not found – returning empty array")
      return NextResponse.json({ banners: [] })
    }

    // Any other error
    if (error) {
      console.error("[/api/banners] database error:", error)
      return NextResponse.json({
        banners: [],
        error: error.message,
        code: error.code,
        environment: process.env.NODE_ENV,
      })
    }

    console.log(`[/api/banners] Successfully fetched ${data?.length || 0} banners`)
    return NextResponse.json({
      banners: data || [],
      count: data?.length || 0,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[/api/banners] unexpected error:", err)
    return NextResponse.json({
      banners: [],
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error",
      environment: process.env.NODE_ENV,
    })
  }
}
