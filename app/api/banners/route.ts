import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    console.log("🔍 Fetching public banners...")
    
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

    console.log("✅ Environment variables found")
    console.log("🔗 Supabase URL:", supabaseUrl)

    // Create client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log("🔍 Attempting to connect to database with service role...")

    // Fetch only active banners for public display
    const { data: banners, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("❌ Error fetching public banners:", error)
      
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

    console.log(`✅ Successfully fetched ${banners?.length || 0} active banners`)
    
    // Log banner details for debugging
    if (banners && banners.length > 0) {
      console.log("📊 Active banner details:")
      banners.forEach((banner, index) => {
        console.log(`  ${index + 1}. ID: ${banner.id}, Title: ${banner.title}, Active: ${banner.is_active}`)
      })
    } else {
      console.log("⚠️ No active banners found in database")
    }

    return NextResponse.json({ 
      banners: banners || [],
      count: banners?.length || 0,
      timestamp: new Date().toISOString(),
      success: true
    })
  } catch (error) {
    console.error("❌ Unexpected error in GET /api/banners:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
