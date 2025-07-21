import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[/api/banners] Fetching banners...")

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

    // Limit results
    if (!error && banners) {
      banners = banners.slice(0, 5)
    }

    if (error) {
      console.error("[/api/banners] Database error:", error)

      // Return static fallback data
      const sampleBanners = [
        {
          id: 1,
          title: "Welcome to Stars2Screen",
          subtitle: "Connect with the best professionals in the film industry",
          image_url: "/bustling-film-set.png",
          link_url: "/profiles",
          button_text: "Browse Profiles",
          is_active: true,
        },
        {
          id: 2,
          title: "Find Your Next Project",
          subtitle: "Discover amazing opportunities and talented individuals",
          image_url: "/director-in-discussion.png",
          link_url: "/jobs",
          button_text: "View Jobs",
          is_active: true,
        },
      ]
      return NextResponse.json({ banners: sampleBanners })
    }

    console.log(`[/api/banners] Found ${banners?.length || 0} banners`)
    return NextResponse.json({ banners: banners || [] })
  } catch (error) {
    console.error("[/api/banners] Unexpected error:", error)

    // Return static fallback
    const sampleBanners = [
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
    return NextResponse.json({ banners: sampleBanners })
  }
}
