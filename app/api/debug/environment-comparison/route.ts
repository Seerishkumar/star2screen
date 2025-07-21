import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get all environment variables related to Supabase
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "***SET***" : "NOT_SET",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "***SET***" : "NOT_SET",
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL: process.env.VERCEL,
    }

    // Extract project ID from Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const projectId = supabaseUrl?.match(/https:\/\/([^.]+)/)?.[1] || "unknown"

    return NextResponse.json({
      success: true,
      environment: {
        current: process.env.NODE_ENV,
        vercel: process.env.VERCEL_ENV,
        isProduction: process.env.NODE_ENV === "production",
        isVercel: !!process.env.VERCEL,
      },
      database: {
        projectId: projectId,
        url: supabaseUrl,
        urlPreview: supabaseUrl?.substring(0, 30) + "...",
      },
      environmentVariables: envVars,
      instructions: {
        checkSameDatabase: "If the projectId is the same in dev and production, you're using the same database",
        separateDatabases:
          "To use separate databases, create different Supabase projects and update environment variables",
        currentSetup: projectId === "unknown" ? "Database URL not configured" : "Single database setup detected",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check environment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
