import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: ads, error } = await supabase.from("ads").select("*").order("created_at", { ascending: false })

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ ads: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ads: ads || [] })
  } catch (error) {
    console.error("Error fetching ads:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    const { data: ad, error } = await supabase.from("ads").insert([data]).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ad })
  } catch (error) {
    console.error("Error creating ad:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
