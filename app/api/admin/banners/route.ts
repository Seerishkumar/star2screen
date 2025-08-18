import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Fetching banners from database...")
    const supabase = createServerSupabaseClient()

    const { data: banners, error } = await supabase
      .from("banners")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) {
      console.error("❌ Error fetching banners:", error)
      if (error.code === "42P01") {
        console.error("❌ Table 'banners' does not exist!")
        return NextResponse.json({ 
          error: "Banners table does not exist. Please run the database setup script.",
          code: error.code,
          details: error.message 
        }, { status: 500 })
      }
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details 
      }, { status: 500 })
    }

    console.log(`✅ Successfully fetched ${banners?.length || 0} banners`)
    return NextResponse.json({ banners: banners || [] })
  } catch (error) {
    console.error("❌ Unexpected error in GET /api/admin/banners:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("🔍 Creating new banner...")
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    console.log("📝 Banner data received:", JSON.stringify(data, null, 2))

    // Validate required fields
    if (!data.title || !data.image_url) {
      console.error("❌ Missing required fields:", { title: !!data.title, image_url: !!data.image_url })
      return NextResponse.json({ 
        error: "Title and image_url are required fields" 
      }, { status: 400 })
    }

    // Set default values
    const bannerData = {
      ...data,
      is_active: data.is_active ?? true,
      display_order: data.display_order ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log("📝 Inserting banner data:", JSON.stringify(bannerData, null, 2))

    const { data: banner, error } = await supabase
      .from("banners")
      .insert([bannerData])
      .select()
      .single()

    if (error) {
      console.error("❌ Error creating banner:", error)
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: "Check if the banners table exists and has the correct structure"
      }, { status: 500 })
    }

    console.log("✅ Banner created successfully:", banner.id)
    return NextResponse.json({ banner })
  } catch (error) {
    console.error("❌ Unexpected error in POST /api/admin/banners:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
