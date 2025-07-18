import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[/api/banners] Fetching banners...")

    // Try ordering by display_order first
    let { data: banners, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    // If the column doesn't exist fall back to sort_order
    if (error?.code === "42703") {
      console.warn("[/api/banners] 'display_order' not found, falling back to 'sort_order'")
      ;({ data: banners, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }))
    }

    // …after the second query succeeds (or if no error) add limit
    if (!error && banners) {
      banners = banners.slice(0, 5) // cap at 5 client-side
    }

    if (error) {
      console.error("[/api/banners] Database error:", error)
      if (error.code === "42P01") {
        // Table doesn't exist, return sample data
        const sampleBanners = [
          {
            id: 1,
            title: "Welcome to Stars2Screen",
            subtitle: "Connect with the best professionals in the film industry",
            image_url: "/bustling-film-set.png",
            link_url: "/profiles",
            button_text: "Browse Profiles",
          },
          {
            id: 2,
            title: "Find Your Next Project",
            subtitle: "Discover amazing opportunities and talented individuals",
            image_url: "/director-in-discussion.png",
            link_url: "/jobs",
            button_text: "View Jobs",
          },
        ]
        return NextResponse.json({ banners: sampleBanners })
      }
      return NextResponse.json({ banners: [] })
    }

    console.log(`[/api/banners] Found ${banners?.length || 0} banners`)
    return NextResponse.json({ banners: banners || [] })
  } catch (error) {
    console.error("[/api/banners] Unexpected error:", error)
    return NextResponse.json({ banners: [] })
  }
}
