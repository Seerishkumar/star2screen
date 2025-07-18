import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: banners, error } = await supabase
      .from("banners")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ banners: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ banners: banners || [] })
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    const { data: banner, error } = await supabase.from("banners").insert([data]).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ banner })
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
