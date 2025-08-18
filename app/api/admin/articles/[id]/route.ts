import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: article, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error("Error fetching article:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    // Set published_at if is_published is true and not already set
    if (data.is_published && !data.published_at) {
      data.published_at = new Date().toISOString()
    }

    const { data: article, error } = await supabase
      .from("articles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error("Error updating article:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting article:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
