import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    const { data: presence, error } = await supabase.from("user_presence").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user presence:", error)
      return NextResponse.json({ error: "Failed to fetch presence" }, { status: 500 })
    }

    return NextResponse.json({
      presence: presence || {
        user_id: userId,
        status: "offline",
        last_seen: null,
      },
    })
  } catch (error) {
    console.error("Error in presence API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status } = body
    const userId = params.id

    if (!["online", "away", "busy", "offline"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const { data: presence, error } = await supabase
      .from("user_presence")
      .upsert({
        user_id: userId,
        status,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating user presence:", error)
      return NextResponse.json({ error: "Failed to update presence" }, { status: 500 })
    }

    return NextResponse.json({ presence })
  } catch (error) {
    console.error("Error in update presence API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
