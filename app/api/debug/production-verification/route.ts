import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[Production Verification] Starting comprehensive database check...")

    const results = {
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        isProduction: process.env.NODE_ENV === "production",
        timestamp: new Date().toISOString(),
      },
      database: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40) + "...",
        project: process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] || "unknown",
      },
      tables: {} as Record<string, any>,
      apis: {} as Record<string, any>,
      errors: [] as string[],
    }

    // Test each table individually
    const tablesToCheck = [
      "banners",
      "articles",
      "news",
      "reviews",
      "ads",
      "videos",
      "author_profiles",
      "conversations",
      "messages",
    ]

    for (const tableName of tablesToCheck) {
      try {
        const { data, error, count } = await supabase.from(tableName).select("*", { count: "exact" }).limit(5)

        if (error) {
          results.tables[tableName] = {
            exists: false,
            error: error.message,
            code: error.code,
          }
          results.errors.push(`Table ${tableName}: ${error.message}`)
        } else {
          results.tables[tableName] = {
            exists: true,
            count: count || 0,
            hasData: (count || 0) > 0,
            sampleData: data?.slice(0, 2) || [],
          }
        }
      } catch (err) {
        results.tables[tableName] = {
          exists: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }
        results.errors.push(`Table ${tableName}: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }

    // Test API endpoints
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://www.stars2screen.com"
        : "http://localhost:3000"

    const apisToTest = [
      { name: "banners", url: `${baseUrl}/api/banners` },
      { name: "articles", url: `${baseUrl}/api/articles` },
      { name: "news", url: `${baseUrl}/api/news` },
      { name: "reviews", url: `${baseUrl}/api/reviews` },
    ]

    for (const api of apisToTest) {
      try {
        const response = await fetch(api.url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (response.ok) {
          const data = await response.json()
          results.apis[api.name] = {
            status: "success",
            statusCode: response.status,
            hasData:
              Object.values(data)[0] &&
              Array.isArray(Object.values(data)[0]) &&
              (Object.values(data)[0] as any[]).length > 0,
            dataCount: Array.isArray(Object.values(data)[0]) ? (Object.values(data)[0] as any[]).length : 0,
          }
        } else {
          results.apis[api.name] = {
            status: "error",
            statusCode: response.status,
            error: response.statusText,
          }
          results.errors.push(`API ${api.name}: ${response.status} ${response.statusText}`)
        }
      } catch (err) {
        results.apis[api.name] = {
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        }
        results.errors.push(`API ${api.name}: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }

    // Overall health check
    const totalTables = Object.keys(results.tables).length
    const existingTables = Object.values(results.tables).filter((t) => t.exists).length
    const tablesWithData = Object.values(results.tables).filter((t) => t.exists && t.hasData).length

    const workingApis = Object.values(results.apis).filter((a) => a.status === "success").length
    const apisWithData = Object.values(results.apis).filter((a) => a.status === "success" && a.hasData).length

    const healthScore = {
      tablesExist: `${existingTables}/${totalTables}`,
      tablesWithData: `${tablesWithData}/${totalTables}`,
      apisWorking: `${workingApis}/${apisToTest.length}`,
      apisWithData: `${apisWithData}/${apisToTest.length}`,
      overallHealth: results.errors.length === 0 ? "HEALTHY" : results.errors.length < 5 ? "PARTIAL" : "UNHEALTHY",
    }

    console.log("[Production Verification] Check completed:", healthScore)

    return NextResponse.json({
      ...results,
      healthScore,
      summary: {
        isFullyOperational: results.errors.length === 0 && tablesWithData >= 4 && apisWithData >= 3,
        needsSetup: existingTables < totalTables * 0.7,
        recommendations: generateRecommendations(results),
      },
    })
  } catch (error) {
    console.error("[Production Verification] Failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Production verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

function generateRecommendations(results: any): string[] {
  const recommendations: string[] = []

  // Check for missing tables
  const missingTables = Object.entries(results.tables)
    .filter(([_, table]: [string, any]) => !table.exists)
    .map(([name, _]) => name)

  if (missingTables.length > 0) {
    recommendations.push(`Run database script to create missing tables: ${missingTables.join(", ")}`)
  }

  // Check for empty tables
  const emptyTables = Object.entries(results.tables)
    .filter(([_, table]: [string, any]) => table.exists && !table.hasData)
    .map(([name, _]) => name)

  if (emptyTables.length > 0) {
    recommendations.push(`Add sample data to empty tables: ${emptyTables.join(", ")}`)
  }

  // Check for failing APIs
  const failingApis = Object.entries(results.apis)
    .filter(([_, api]: [string, any]) => api.status === "error")
    .map(([name, _]) => name)

  if (failingApis.length > 0) {
    recommendations.push(`Fix failing API endpoints: ${failingApis.join(", ")}`)
  }

  if (recommendations.length === 0) {
    recommendations.push("All systems operational! 🎉")
  }

  return recommendations
}
