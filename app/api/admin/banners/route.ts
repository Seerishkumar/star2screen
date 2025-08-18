import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Fetching banners from database...")
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing Supabase environment variables")
      return NextResponse.json({ 
        error: "Missing Supabase environment variables",
        supabaseUrl: supabaseUrl ? 'SET' : 'NOT_SET',
        supabaseKey: supabaseKey ? 'SET' : 'NOT_SET',
        hint: "Check your production environment variables"
      }, { status: 500 })
    }

    console.log("✅ Environment variables found")
    console.log("🔗 Supabase URL:", supabaseUrl)

    const supabase = createServerSupabaseClient()

    console.log("🔍 Attempting to connect to database...")

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
          details: error.message,
          hint: "Run scripts/36-fix-production-banner-issues.sql in your Supabase SQL editor"
        }, { status: 500 })
      }
      
      if (error.code === "42501") {
        console.error("❌ Permission denied!")
        return NextResponse.json({ 
          error: "Permission denied accessing banners table",
          code: error.code,
          details: error.message,
          hint: "Check RLS policies and user permissions"
        }, { status: 500 })
      }
      
      if (error.code === "08001") {
        console.error("❌ Connection failed!")
        return NextResponse.json({ 
          error: "Database connection failed",
          code: error.code,
          details: error.message,
          hint: "Check Supabase URL and service role key"
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: "Check database connection and table structure"
      }, { status: 500 })
    }

    console.log(`✅ Successfully fetched ${banners?.length || 0} banners`)
    
    // Log banner details for debugging
    if (banners && banners.length > 0) {
      console.log("📊 Banner details:")
      banners.forEach((banner, index) => {
        console.log(`  ${index + 1}. ID: ${banner.id}, Title: ${banner.title}, Active: ${banner.is_active}`)
      })
    } else {
      console.log("⚠️ No banners found in database")
    }

    return NextResponse.json({ 
      banners: banners || [],
      count: banners?.length || 0,
      timestamp: new Date().toISOString(),
      success: true
    })
  } catch (error) {
    console.error("❌ Unexpected error in GET /api/admin/banners:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("🔍 Creating new banner...")
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing Supabase environment variables")
      return NextResponse.json({ 
        error: "Missing Supabase environment variables",
        supabaseUrl: supabaseUrl ? 'SET' : 'NOT_SET',
        supabaseKey: supabaseKey ? 'SET' : 'NOT_SET'
      }, { status: 500 })
    }

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
