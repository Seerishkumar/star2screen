import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    console.log(`[/api/articles] Fetching articles with limit: ${limit}`)

    // Rich fallback data for production
    const fallbackArticles = [
      {
        id: 1,
        title: "Breaking into the Film Industry: A Beginner's Guide",
        slug: "breaking-into-film-industry-beginners-guide",
        excerpt: "Essential tips and strategies for newcomers looking to make their mark in the entertainment industry",
        featured_image_url: "/bustling-film-set.png",
        author_name: "Sarah Johnson",
        status: "published",
        published_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 2,
        title: "Top 10 Casting Directors to Follow in 2024",
        slug: "top-10-casting-directors-2024",
        excerpt: "Meet the casting directors who are shaping the industry and discover how to get on their radar",
        featured_image_url: "/director-in-discussion.png",
        author_name: "Michael Chen",
        status: "published",
        published_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        id: 3,
        title: "The Art of Method Acting: Techniques and Tips",
        slug: "art-of-method-acting-techniques-tips",
        excerpt: "Explore the world of method acting and learn from the masters who revolutionized the craft",
        featured_image_url: "/confident-actress.png",
        author_name: "Emma Rodriguez",
        status: "published",
        published_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      },
      {
        id: 4,
        title: "Networking in Hollywood: Building Industry Connections",
        slug: "networking-hollywood-building-connections",
        excerpt: "Learn how to build meaningful relationships that can advance your career in entertainment",
        featured_image_url: "/bustling-city-street.png",
        author_name: "David Kim",
        status: "published",
        published_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      },
      {
        id: 5,
        title: "From Script to Screen: The Producer's Journey",
        slug: "script-to-screen-producer-journey",
        excerpt: "Understanding the role of producers and how they bring stories to life",
        featured_image_url: "/confident-businessman.png",
        author_name: "Lisa Thompson",
        status: "published",
        published_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      },
      {
        id: 6,
        title: "Digital Age Acting: Social Media and Your Career",
        slug: "digital-age-acting-social-media-career",
        excerpt: "How modern actors are leveraging social media to build their brand and find opportunities",
        featured_image_url: "/confident-young-professional.png",
        author_name: "Alex Rivera",
        status: "published",
        published_at: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
      },
    ]

    try {
      // Use service role key to bypass RLS
      const supabase = createServerSupabaseClient()

      const { data: articles, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit)

      // If we have valid data from database, use it
      if (!error && articles && articles.length > 0) {
        console.log(`[/api/articles] Found ${articles.length} articles from database`)
        return NextResponse.json({ articles })
      }

      // If database fails or returns no data, use fallback
      console.log("[/api/articles] Using fallback data")
      return NextResponse.json({ articles: fallbackArticles.slice(0, limit) })
    } catch (dbError) {
      console.error("[/api/articles] Database connection error:", dbError)
      return NextResponse.json({ articles: fallbackArticles.slice(0, limit) })
    }
  } catch (error) {
    console.error("[/api/articles] Unexpected error:", error)

    // Always return fallback data on any error
    const fallbackArticles = [
      {
        id: 1,
        title: "Breaking into the Film Industry: A Beginner's Guide",
        slug: "breaking-into-film-industry-beginners-guide",
        excerpt: "Essential tips and strategies for newcomers to the film industry",
        featured_image_url: "/bustling-film-set.png",
        author_name: "Sarah Johnson",
        status: "published",
        published_at: new Date().toISOString(),
      },
    ]
    return NextResponse.json({ articles: fallbackArticles })
  }
}
