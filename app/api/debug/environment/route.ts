import { NextResponse } from "next/server"

export async function GET() {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "...",
      timestamp: new Date().toISOString(),
      deployment: {
        isProduction: process.env.NODE_ENV === "production",
        isVercel: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION,
      },
    }

    return NextResponse.json(envCheck)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Environment check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
