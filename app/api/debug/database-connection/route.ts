import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Testing database connection...")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing environment variables",
          details: {
            hasSupabaseUrl: !!supabaseUrl,
            hasServiceRoleKey: !!serviceRoleKey,
          },
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from("author_profiles")
      .select("count", { count: "exact", head: true })

    if (testError) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: testError,
          environment: process.env.NODE_ENV,
        },
        { status: 500 },
      )
    }

    // Test specific tables
    const tableTests = await Promise.allSettled([
      supabase.from("author_profiles").select("count", { count: "exact", head: true }),
      supabase.from("user_media").select("count", { count: "exact", head: true }),
      supabase.from("banners").select("count", { count: "exact", head: true }),
      supabase.from("ads").select("count", { count: "exact", head: true }),
      supabase.from("articles").select("count", { count: "exact", head: true }),
      supabase.from("videos").select("count", { count: "exact", head: true }),
    ])

    const tableResults = {
      author_profiles: tableTests[0].status === "fulfilled" ? tableTests[0].value.count : "Error",
      user_media: tableTests[1].status === "fulfilled" ? tableTests[1].value.count : "Error",
      banners: tableTests[2].status === "fulfilled" ? tableTests[2].value.count : "Error",
      ads: tableTests[3].status === "fulfilled" ? tableTests[3].value.count : "Error",
      articles: tableTests[4].status === "fulfilled" ? tableTests[4].value.count : "Error",
      videos: tableTests[5].status === "fulfilled" ? tableTests[5].value.count : "Error",
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      tableCounts: tableResults,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database connection test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        environment: process.env.NODE_ENV,
      },
      { status: 500 },
    )
  }
}
