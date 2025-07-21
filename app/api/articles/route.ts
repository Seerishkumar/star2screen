import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    console.log(`[/api/articles] Fetching articles with limit: ${limit}`)

    // Use service role key to bypass RLS
    const supabase = createServerSupabaseClient()

    const { data: articles, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[/api/articles] Database error:", error)

      // Return static fallback data
      const sampleArticles = [
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
        {
          id: 2,
          title: "Top 10 Casting Directors to Follow in 2024",
          slug: "top-10-casting-directors-2024",
          excerpt: "Meet the casting directors who are shaping the industry this year",
          featured_image_url: "/director-in-discussion.png",
          author_name: "Michael Chen",
          status: "published",
          published_at: new Date().toISOString(),
        },
        {
          id: 3,
          title: "The Art of Method Acting: Techniques and Tips",
          slug: "art-of-method-acting-techniques-tips",
          excerpt: "Explore the world of method acting and learn from the masters",
          featured_image_url: "/confident-actress.png",
          author_name: "Emma Rodriguez",
          status: "published",
          published_at: new Date().toISOString(),
        },
      ]
      return NextResponse.json({ articles: sampleArticles })
    }

    console.log(`[/api/articles] Found ${articles?.length || 0} articles`)
    return NextResponse.json({ articles: articles || [] })
  } catch (error) {
    console.error("[/api/articles] Unexpected error:", error)

    // Return static fallback
    const sampleArticles = [
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
    return NextResponse.json({ articles: sampleArticles })
  }
}
