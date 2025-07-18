import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: articles, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ articles: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ articles: articles || [] })
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    // Set published_at if is_published is true
    if (data.is_published && !data.published_at) {
      data.published_at = new Date().toISOString()
    }

    const { data: article, error } = await supabase.from("articles").insert([data]).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
