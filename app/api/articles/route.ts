import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const offset = (page - 1) * limit

  try {
    console.log(`[/api/articles] Starting articles fetch (page: ${page}, limit: ${limit})...`)
    const supabase = createServerSupabaseClient()

    const { data: articles, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      if (error.code === "42P01") {
        console.warn("[/api/articles] articles table not found - returning empty array")
        return NextResponse.json({ articles: [] })
      }
      console.error("[/api/articles] database error:", error)
      return NextResponse.json({
        articles: [],
        error: error.message,
        code: error.code,
        environment: process.env.NODE_ENV,
      })
    }

    // Get total count (optional; ignore failures)
    const { count } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")

    console.log(`[/api/articles] Successfully fetched ${articles?.length || 0} articles`)
    return NextResponse.json({
      articles: articles ?? [],
      count: articles?.length || 0,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        pages: count ? Math.ceil(count / limit) : 0,
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[/api/articles] unexpected error:", err)
    return NextResponse.json({
      articles: [],
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error",
      environment: process.env.NODE_ENV,
    })
  }
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const article = await request.json()

  // Generate slug from title if not provided
  if (!article.slug) {
    article.slug = article.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
  }

  // Set author_id to current user
  article.author_id = user.id

  // Calculate reading time if content is provided
  if (article.content) {
    const words = article.content.trim().split(/\s+/).length
    article.reading_time = Math.ceil(words / 200) // Assuming 200 words per minute
  }

  // Set published_at if status is published
  if (article.status === "published" && !article.published_at) {
    article.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase.from("articles").insert(article).select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}
