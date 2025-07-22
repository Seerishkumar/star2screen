import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[/api/ads] Fetching ads...")

    // Rich fallback data for production
    const fallbackAds = [
      {
        id: 1,
        title: "Professional Headshots",
        description: "Get stunning headshots from top photographers in your area",
        image_url: "/elegant-actress.png",
        link_url: "/categories/photographer",
        is_active: true,
        display_order: 1,
      },
      {
        id: 2,
        title: "Casting Opportunities",
        description: "Find your next big role in upcoming film and TV productions",
        image_url: "/confident-actress.png",
        link_url: "/jobs",
        is_active: true,
        display_order: 2,
      },
      {
        id: 3,
        title: "Acting Workshops & Classes",
        description: "Improve your craft with professional acting coaches and workshops",
        image_url: "/bustling-film-set.png",
        link_url: "/categories/acting-coach",
        is_active: true,
        display_order: 3,
      },
      {
        id: 4,
        title: "Film Equipment Rental",
        description: "Professional camera and lighting equipment for your next project",
        image_url: "/director-in-discussion.png",
        link_url: "/categories/technician",
        is_active: true,
        display_order: 4,
      },
      {
        id: 5,
        title: "Voice Over Services",
        description: "Professional voice over artists for commercials, films, and more",
        image_url: "/confident-businessman.png",
        link_url: "/categories/dubbing",
        is_active: true,
        display_order: 5,
      },
    ]

    try {
      // Use service role key to bypass RLS
      const supabase = createServerSupabaseClient()

      // Try ordering by display_order first
      let { data: ads, error } = await supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      // If the column doesn't exist fall back to sort_order
      if (error?.code === "42703") {
        console.warn("[/api/ads] 'display_order' not found, falling back to 'sort_order'")
        const { data: adsWithSort, error: sortError } = await supabase
          .from("ads")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })

        ads = adsWithSort
        error = sortError
      }

      // If sort_order also doesn't exist, try created_at
      if (error?.code === "42703") {
        console.warn("[/api/ads] 'sort_order' not found, falling back to 'created_at'")
        const { data: adsWithCreated, error: createdError } = await supabase
          .from("ads")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        ads = adsWithCreated
        error = createdError
      }

      // If we have valid data from database, use it
      if (!error && ads && ads.length > 0) {
        console.log(`[/api/ads] Found ${ads.length} ads from database`)
        return NextResponse.json({ ads: ads.slice(0, 10) })
      }

      // If database fails or returns no data, use fallback
      console.log("[/api/ads] Using fallback data")
      return NextResponse.json({ ads: fallbackAds })
    } catch (dbError) {
      console.error("[/api/ads] Database connection error:", dbError)
      return NextResponse.json({ ads: fallbackAds })
    }
  } catch (error) {
    console.error("[/api/ads] Unexpected error:", error)

    // Always return fallback data on any error
    const fallbackAds = [
      {
        id: 1,
        title: "Professional Headshots",
        description: "Get stunning headshots from top photographers",
        image_url: "/elegant-actress.png",
        link_url: "/categories/photographer",
        is_active: true,
      },
    ]
    return NextResponse.json({ ads: fallbackAds })
  }
}
