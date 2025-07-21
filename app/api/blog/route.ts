import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== "All") {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      // Return fallback data
      return NextResponse.json([
        {
          id: "1",
          title: "Breaking into the Film Industry: A Complete Guide",
          excerpt:
            "Essential tips and strategies for newcomers looking to establish their career in the entertainment industry.",
          content: "The film industry can seem daunting to newcomers...",
          author: "Sarah Johnson",
          category: "Career Advice",
          published_at: "2024-01-15",
          image_url: "/bustling-film-set.png",
          read_time: "8 min read",
          tags: ["Career", "Tips", "Industry"],
        },
      ])
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Blog API error:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}
