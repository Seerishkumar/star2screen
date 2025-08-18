import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Testing banner database connection...")
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing Supabase environment variables")
      return NextResponse.json({
        success: false,
        error: "Missing Supabase environment variables",
        supabaseUrl: supabaseUrl ? 'SET' : 'NOT_SET',
        supabaseKey: supabaseKey ? 'SET' : 'NOT_SET'
      }, { status: 500 })
    }

    console.log("✅ Environment variables found")
    console.log("🔗 Supabase URL:", supabaseUrl)

    // Test database connection
    const supabase = createServerSupabaseClient()
    
    console.log("🔍 Attempting to connect to database...")
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('banners')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error("❌ Database connection failed:", connectionError)
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: connectionError.message,
        code: connectionError.code,
        hint: connectionError.hint
      }, { status: 500 })
    }

    console.log("✅ Database connection successful")

    // Test actual banner fetch
    const { data: banners, error: fetchError } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true })

    if (fetchError) {
      console.error("❌ Banner fetch failed:", fetchError)
      return NextResponse.json({
        success: false,
        error: "Banner fetch failed",
        details: fetchError.message,
        code: fetchError.code,
        hint: fetchError.hint
      }, { status: 500 })
    }

    console.log(`✅ Successfully fetched ${banners?.length || 0} banners`)

    return NextResponse.json({
      success: true,
      message: "Banner database connection test successful",
      bannerCount: banners?.length || 0,
      banners: banners || [],
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: supabaseUrl,
        supabaseKey: supabaseKey ? 'SET' : 'NOT_SET',
        nodeEnv: process.env.NODE_ENV || 'NOT_SET'
      }
    })

  } catch (error) {
    console.error("❌ Unexpected error in banner test:", error)
    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 