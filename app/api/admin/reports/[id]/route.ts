import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { action } = await request.json()

    let status = "reviewed"
    if (action === "resolve") {
      status = "resolved"
    } else if (action === "dismiss") {
      status = "dismissed"
    }

    const { data: report, error } = await supabase
      .from("reports")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error updating report:", error)
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
      .from("reports")
      .delete()
      .eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting report:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 