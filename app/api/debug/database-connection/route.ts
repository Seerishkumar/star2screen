import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[Database Connection] Starting check...")

    // Environment info
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      isProduction: process.env.NODE_ENV === "production",
      timestamp: new Date().toISOString(),
    }

    // Database connection info
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return NextResponse.json({
        success: false,
        error: "Missing NEXT_PUBLIC_SUPABASE_URL environment variable",
        environment,
      })
    }

    const database = {
      url: supabaseUrl.substring(0, 40) + "...",
      project: supabaseUrl.match(/https:\/\/([^.]+)/)?.[1] || "unknown",
      hasAnonKey,
      hasServiceKey,
    }

    // Create Supabase client with service role key for admin access
    const supabase = createServerSupabaseClient()

    // Test basic connection and get table counts
    const tables = [
      "author_profiles",
      "user_media",
      "banners",
      "ads",
      "articles",
      "videos",
      "news",
      "reviews",
      "conversations",
      "messages",
    ]

    const tableCounts: Record<string, number | string> = {}

    for (const tableName of tables) {
      try {
        const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

        if (error) {
          tableCounts[tableName] = `Error: ${error.message}`
        } else {
          tableCounts[tableName] = count || 0
        }
      } catch (err) {
        tableCounts[tableName] = `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      environment,
      database,
      tableCounts,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Database Connection] Error:", error)

    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      },
      timestamp: new Date().toISOString(),
    })
  }
}
