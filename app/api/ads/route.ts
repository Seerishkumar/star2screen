import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[/api/ads] Fetching ads...")

    const { data: ads, error } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(10)

    if (error) {
      console.error("[/api/ads] Database error:", error)
      if (error.code === "42P01") {
        // Table doesn't exist, return sample data
        const sampleAds = [
          {
            id: 1,
            title: "Professional Headshots",
            description: "Get stunning headshots from top photographers",
            image_url: "/elegant-actress.png",
            link_url: "/categories/photographer",
          },
          {
            id: 2,
            title: "Casting Call Alert",
            description: "Never miss an audition with our premium service",
            image_url: "/confident-actress.png",
            link_url: "/jobs",
          },
          {
            id: 3,
            title: "Film Equipment Rental",
            description: "Rent professional equipment at affordable rates",
            image_url: "/bustling-film-set.png",
            link_url: "/categories/technician",
          },
        ]
        return NextResponse.json({ ads: sampleAds })
      }
      return NextResponse.json({ ads: [] })
    }

    console.log(`[/api/ads] Found ${ads?.length || 0} ads`)
    return NextResponse.json({ ads: ads || [] })
  } catch (error) {
    console.error("[/api/ads] Unexpected error:", error)
    return NextResponse.json({ ads: [] })
  }
}
