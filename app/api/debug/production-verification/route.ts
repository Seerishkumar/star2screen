"use server"

/**
 * Comprehensive production health-check.
 *
 *   GET /api/debug/production-verification
 *
 *  – Verifies required tables exist & have data
 *  – Calls the public API routes to be sure they answer with DB data
 *  – Never throws: always responds with JSON { ok: boolean, … }
 */

import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const REQUIRED_TABLES = [
  "author_profiles",
  "banners",
  "ads",
  "articles",
  "news",
  "reviews",
  "videos",
  "conversations",
  "messages",
] as const

const PUBLIC_APIS = ["/api/banners", "/api/ads", "/api/articles", "/api/news", "/api/reviews"] as const

export async function GET() {
  const startedAt = Date.now()
  const result: any = {
    ok: true,
    env: {
      node: process.env.NODE_ENV,
      vercel: process.env.VERCEL_ENV ?? "local",
    },
    database: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40) + "…",
    },
    tables: {},
    apis: {},
  }

  try {
    /* ---------- 1) DATABASE CHECK ---------- */
    const supabase = createServerSupabaseClient()

    for (const table of REQUIRED_TABLES) {
      try {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

        result.tables[table] = {
          exists: !error,
          rows: error ? 0 : (count ?? 0),
        }
      } catch (err) {
        // Table definitely missing
        result.tables[table] = { exists: false, rows: 0, error: (err as Error).message }
      }
    }

    /* ---------- 2) API ROUTE CHECK ---------- */
    // Derive base URL safely (works locally, in preview & prod)
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT ?? 3000}`

    for (const route of PUBLIC_APIS) {
      try {
        const res = await fetch(base + route, { cache: "no-store" })
        const json = await res.json().catch(() => ({}))

        result.apis[route] = {
          status: res.status,
          ok: res.ok,
          dataCount: Array.isArray(json) ? json.length : Array.isArray(json?.data) ? json.data.length : 0,
          staticFallback: json?.isStaticFallback ?? false,
        }
      } catch (err) {
        result.apis[route] = { status: 599, ok: false, error: (err as Error).message }
      }
    }

    /* ---------- 3) SUMMARY ---------- */
    const missingTables = Object.entries(result.tables)
      .filter(([, v]: any) => !v.exists)
      .map(([k]) => k)

    const emptyTables = Object.entries(result.tables)
      .filter(([, v]: any) => v.exists && v.rows === 0)
      .map(([k]) => k)

    const failingApis = Object.entries(result.apis)
      .filter(([, v]: any) => !v.ok)
      .map(([k]) => k)

    result.summary = {
      missingTables,
      emptyTables,
      failingApis,
      healthy: missingTables.length === 0 && failingApis.length === 0,
    }

    result.elapsedMs = Date.now() - startedAt
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("[production-verification] fatal", error)
    return NextResponse.json(
      {
        ok: false,
        error: (error as Error).message ?? "Unknown failure",
        elapsedMs: Date.now() - startedAt,
      },
      { status: 500 },
    )
  }
}
