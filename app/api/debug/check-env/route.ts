import { NextResponse } from "next/server"

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return NextResponse.json({
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "MISSING",
    supabaseKey: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : "MISSING",
    allEnvVars: Object.keys(process.env).filter((key) => key.includes("SUPABASE")),
  })
}
