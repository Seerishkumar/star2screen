import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === "42P01") {
        console.warn("Ads table not found - returning empty array")
        return NextResponse.json({ ads: [] })
      }
      console.error("Error fetching ads:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Fetched ads:", data?.length || 0, "ads")
    return NextResponse.json({ ads: data || [] })
  } catch (error) {
    console.error("Unexpected error in /api/ads:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
