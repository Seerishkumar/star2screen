import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    console.log("🔍 Fetching public videos...")
    
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

    // Fetch only active videos for public display
    const { data: videos, error } = await supabase
      .from("videos")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("❌ Error fetching public videos:", error)
      
      if (error.code === "42P01") {
        console.error("❌ Table 'videos' does not exist!")
        return NextResponse.json({ 
          error: "Videos table does not exist. Please run the database setup script.",
          code: error.code,
          details: error.message,
          hint: "Run scripts/36-fix-production-banner-issues.sql in your Supabase SQL editor"
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: "Check database connection and table structure"
      }, { status: 500 })
    }

    console.log(`✅ Successfully fetched ${videos?.length || 0} active videos`)
    
    // Log video details for debugging
    if (videos && videos.length > 0) {
      console.log("📊 Active video details:")
      videos.forEach((video, index) => {
        console.log(`  ${index + 1}. ID: ${video.id}, Title: ${video.title}, Active: ${video.is_active}`)
      })
    } else {
      console.log("⚠️ No active videos found in database")
    }

    return NextResponse.json({ 
      videos: videos || [],
      count: videos?.length || 0,
      timestamp: new Date().toISOString(),
      success: true
    })
  } catch (error) {
    console.error("❌ Unexpected error in GET /api/videos:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
