import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[/api/banners] Fetching banners...")

    // Always return rich fallback data for production
    const fallbackBanners = [
      {
        id: 1,
        title: "Welcome to Stars2Screen",
        subtitle: "Connect with the best professionals in the film industry",
        image_url: "/bustling-film-set.png",
        link_url: "/profiles",
        button_text: "Browse Profiles",
        is_active: true,
        display_order: 1,
      },
      {
        id: 2,
        title: "Find Your Next Big Role",
        subtitle: "Discover casting opportunities and auditions nationwide",
        image_url: "/confident-actress.png",
        link_url: "/jobs",
        button_text: "View Opportunities",
        is_active: true,
        display_order: 2,
      },
      {
        id: 3,
        title: "Professional Networking",
        subtitle: "Build connections with industry professionals and creators",
        image_url: "/director-in-discussion.png",
        link_url: "/categories",
        button_text: "Start Networking",
        is_active: true,
        display_order: 3,
      },
    ]

    try {
      // Use service role key to bypass RLS
      const supabase = createServerSupabaseClient()

      // Try ordering by display_order first
      let { data: banners, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      // If the column doesn't exist fall back to sort_order
      if (error?.code === "42703") {
        console.warn("[/api/banners] 'display_order' not found, falling back to 'sort_order'")
        const { data: bannersWithSort, error: sortError } = await supabase
          .from("banners")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })

        banners = bannersWithSort
        error = sortError
      }

      // If sort_order also doesn't exist, try created_at
      if (error?.code === "42703") {
        console.warn("[/api/banners] 'sort_order' not found, falling back to 'created_at'")
        const { data: bannersWithCreated, error: createdError } = await supabase
          .from("banners")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        banners = bannersWithCreated
        error = createdError
      }

      // If we have valid data from database, use it
      if (!error && banners && banners.length > 0) {
        console.log(`[/api/banners] Found ${banners.length} banners from database`)
        return NextResponse.json({ banners: banners.slice(0, 5) })
      }

      // If database fails or returns no data, use fallback
      console.log("[/api/banners] Using fallback data")
      return NextResponse.json({ banners: fallbackBanners })
    } catch (dbError) {
      console.error("[/api/banners] Database connection error:", dbError)
      return NextResponse.json({ banners: fallbackBanners })
    }
  } catch (error) {
    console.error("[/api/banners] Unexpected error:", error)

    // Always return fallback data on any error
    const fallbackBanners = [
      {
        id: 1,
        title: "Welcome to Stars2Screen",
        subtitle: "Connect with the best professionals in the film industry",
        image_url: "/bustling-film-set.png",
        link_url: "/profiles",
        button_text: "Browse Profiles",
        is_active: true,
      },
    ]
    return NextResponse.json({ banners: fallbackBanners })
  }
}
