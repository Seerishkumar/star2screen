import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const category = searchParams.get("category")
  const tag = searchParams.get("tag")
  const search = searchParams.get("search")

  const offset = (page - 1) * limit

  try {
    const supabase = createServerSupabaseClient()

    let query = supabase
      .from("articles")
      .select(`
        *,
        category:categories(*),
        author:author_profiles(*)
      `)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq("categories.slug", category)
    }

    if (tag) {
      query = query.contains("tags", [tag])
    }

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    const { data: articles, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount! / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 })
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
