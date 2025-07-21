import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[/api/news] Fetching news...")

    const supabase = createServerSupabaseClient()

    // Try with is_featured column first
    let { data: news, error } = await supabase
      .from("news")
      .select("*")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })

    // If is_featured column doesn't exist, try without it
    if (error && error.code === "42703") {
      console.log("[/api/news] is_featured column doesn't exist, trying without it")
      const { data: newsWithoutFeatured, error: fallbackError } = await supabase
        .from("news")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })

      news = newsWithoutFeatured
      error = fallbackError
    }

    // Limit results
    if (!error && news) {
      news = news.slice(0, 10)
    }

    if (error) {
      console.error("[/api/news] Database error:", error)

      // Return static fallback data
      const staticNews = [
        {
          id: "1",
          title: "Film Industry Trends 2024",
          excerpt: "Discover the latest trends shaping the film industry this year",
          featured_image_url: "/bustling-film-set.png",
          author_name: "Industry Expert",
          published_at: new Date().toISOString(),
          status: "published",
        },
        {
          id: "2",
          title: "New Casting Opportunities",
          excerpt: "Exciting new roles available for talented actors",
          featured_image_url: "/confident-actress.png",
          author_name: "Casting Director",
          published_at: new Date().toISOString(),
          status: "published",
        },
      ]

      return NextResponse.json(staticNews)
    }

    console.log(`[/api/news] Found ${news?.length || 0} news items`)
    return NextResponse.json(news || [])
  } catch (error) {
    console.error("[/api/news] Unexpected error:", error)

    // Return static fallback on any error
    const staticNews = [
      {
        id: "1",
        title: "Film Industry Trends 2024",
        excerpt: "Discover the latest trends shaping the film industry this year",
        featured_image_url: "/bustling-film-set.png",
        author_name: "Industry Expert",
        published_at: new Date().toISOString(),
        status: "published",
      },
    ]

    return NextResponse.json(staticNews)
  }
}
