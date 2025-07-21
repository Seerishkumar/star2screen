import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[/api/ads] Fetching ads...")

    // Use service role key to bypass RLS
    const supabase = createServerSupabaseClient()

    // First, try to get ads with sort_order column
    let { data: ads, error } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    // If sort_order column doesn't exist, try without it
    if (error && error.code === "42703") {
      console.log("[/api/ads] sort_order column doesn't exist, trying with created_at")
      const { data: adsWithoutSort, error: fallbackError } = await supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      ads = adsWithoutSort
      error = fallbackError
    }

    // Limit results
    if (!error && ads) {
      ads = ads.slice(0, 10)
    }

    if (error) {
      console.error("[/api/ads] Database error:", error)

      // Return static fallback data
      const staticAds = [
        {
          id: "1",
          title: "Premium Casting Opportunities",
          description: "Get featured in top film projects",
          image_url: "/confident-actress.png",
          link_url: "/categories/actress",
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Director Spotlight",
          description: "Showcase your directorial vision",
          image_url: "/director-in-discussion.png",
          link_url: "/categories/director",
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Producer Network",
          description: "Connect with industry producers",
          image_url: "/confident-businessman.png",
          link_url: "/categories/producer",
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ]

      return NextResponse.json(staticAds)
    }

    console.log(`[/api/ads] Found ${ads?.length || 0} ads`)
    return NextResponse.json(ads || [])
  } catch (error) {
    console.error("[/api/ads] Unexpected error:", error)

    // Return static fallback on any error
    const staticAds = [
      {
        id: "1",
        title: "Premium Casting Opportunities",
        description: "Get featured in top film projects",
        image_url: "/confident-actress.png",
        link_url: "/categories/actress",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json(staticAds)
  }
}
