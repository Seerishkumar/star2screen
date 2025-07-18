import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const offset = (page - 1) * limit

  try {
    const supabase = createServerSupabaseClient()

    // A very plain query – no joins – to avoid missing-relation errors
    const { data: articles, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1)

    /* ---------------------------------------------------------- */
    /* Handle "relation does not exist" (PG code 42P01)           */
    /* ---------------------------------------------------------- */
    if (error) {
      if (error.code === "42P01") {
        // Table not created yet: return empty list, 200 OK
        return NextResponse.json({ articles: [] })
      }
      // Other DB errors → 500
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Total count (optional; ignore failures)
    const { count } = await supabase.from("articles").select("*", { count: "exact", head: true })

    return NextResponse.json({
      articles: articles ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        pages: count ? Math.ceil(count / limit) : 0,
      },
    })
  } catch (err) {
    console.error("Unhandled error in /api/articles:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
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
