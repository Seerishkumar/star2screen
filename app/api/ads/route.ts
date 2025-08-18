import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    console.log("🔍 Fetching public ads...")
    
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

    // Fetch only active ads for public display
    const { data: ads, error } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("❌ Error fetching public ads:", error)
      
      if (error.code === "42P01") {
        console.error("❌ Table 'ads' does not exist!")
        return NextResponse.json({ 
          error: "Ads table does not exist. Please run the database setup script.",
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

    console.log(`✅ Successfully fetched ${ads?.length || 0} active ads`)
    
    // Log ad details for debugging
    if (ads && ads.length > 0) {
      console.log("📊 Active ad details:")
      ads.forEach((ad, index) => {
        console.log(`  ${index + 1}. ID: ${ad.id}, Title: ${ad.title}, Active: ${ad.is_active}`)
      })
    } else {
      console.log("⚠️ No active ads found in database")
    }

    return NextResponse.json({ 
      ads: ads || [],
      count: ads?.length || 0,
      timestamp: new Date().toISOString(),
      success: true
    })
  } catch (error) {
    console.error("❌ Unexpected error in GET /api/ads:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
