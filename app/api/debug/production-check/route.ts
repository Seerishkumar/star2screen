import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    tests: {} as any,
  }

  // Test 1: Basic Supabase connection
  try {
    const { data, error } = await supabase.from("author_profiles").select("count", { count: "exact", head: true })
    debug.tests.supabaseConnection = {
      success: !error,
      error: error?.message,
      profileCount: data || 0,
    }
  } catch (err) {
    debug.tests.supabaseConnection = {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }

  // Test 2: Check each table
  const tables = ["banners", "ads", "articles", "videos", "author_profiles"]
  debug.tests.tables = {}

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("count", { count: "exact", head: true }).limit(1)
      debug.tests.tables[table] = {
        exists: !error || error.code !== "42P01",
        count: data || 0,
        error: error?.message,
        code: error?.code,
      }
    } catch (err) {
      debug.tests.tables[table] = {
        exists: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }
    }
  }

  // Test 3: Sample data fetch
  try {
    const { data: profiles, error } = await supabase
      .from("author_profiles")
      .select("id, full_name, category, location")
      .limit(3)

    debug.tests.sampleData = {
      success: !error,
      error: error?.message,
      profiles: profiles || [],
      count: profiles?.length || 0,
    }
  } catch (err) {
    debug.tests.sampleData = {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }

  return NextResponse.json(debug, { status: 200 })
}
