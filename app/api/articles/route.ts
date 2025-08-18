import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    console.log("🔍 Fetching public articles...")
    
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

    // Fetch only published articles for public display
    const { data: articles, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("❌ Error fetching public articles:", error)
      
      if (error.code === "42P01") {
        console.error("❌ Table 'articles' does not exist!")
        return NextResponse.json({ 
          error: "Articles table does not exist. Please run the database setup script.",
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

    console.log(`✅ Successfully fetched ${articles?.length || 0} published articles`)
    
    // Log article details for debugging
    if (articles && articles.length > 0) {
      console.log("📊 Published article details:")
      articles.forEach((article, index) => {
        console.log(`  ${index + 1}. ID: ${article.id}, Title: ${article.title}, Status: ${article.status}`)
      })
    } else {
      console.log("⚠️ No published articles found in database")
    }

    return NextResponse.json({ 
      articles: articles || [],
      count: articles?.length || 0,
      timestamp: new Date().toISOString(),
      success: true
    })
  } catch (error) {
    console.error("❌ Unexpected error in GET /api/articles:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
