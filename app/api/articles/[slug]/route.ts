import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: article, error } = await supabase
      .from("articles")
      .select(`
        *,
        category:categories(*),
        author:author_profiles(*)
      `)
      .eq("slug", params.slug)
      .single()

    if (error) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    // Increment view count
    await supabase
      .from("articles")
      .update({ view_count: (article.view_count || 0) + 1 })
      .eq("id", article.id)

    // Track view for analytics
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from("article_views").insert({
      article_id: article.id,
      user_id: user?.id || null,
      ip_address: request.headers.get("x-forwarded-for") || null,
      user_agent: request.headers.get("user-agent") || null,
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error("Error fetching article:", error)
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const updates = await request.json()

  // Check if user is the author or admin
  const { data: article } = await supabase.from("articles").select("author_id").eq("slug", params.slug).single()

  if (!article || article.author_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Update published_at if status changed to published
  if (updates.status === "published" && !updates.published_at) {
    updates.published_at = new Date().toISOString()
  }

  // Update reading time if content changed
  if (updates.content) {
    const words = updates.content.trim().split(/\s+/).length
    updates.reading_time = Math.ceil(words / 200)
  }

  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from("articles").update(updates).eq("slug", params.slug).select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is the author or admin
  const { data: article } = await supabase.from("articles").select("author_id").eq("slug", params.slug).single()

  if (!article || article.author_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase.from("articles").delete().eq("slug", params.slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
