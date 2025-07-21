"use server"

/**
 * Light-weight endpoint that checks if the app can talk to Supabase
 * and reports how many rows each table contains.
 *
 *   GET /api/debug/database-connection
 *
 * – Returns 200 OK with JSON on success
 * – Returns 500 on any fatal error
 */
import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  const startedAt = Date.now()

  try {
    const supabase = createServerSupabaseClient()

    // Quick smoke-test: run `select 1`
    const { error: pingError } = await supabase.rpc("int4range", { lower: 1, upper: 1 }).single().limit(1) // harmless RPC
    if (pingError && pingError.code !== "42883") {
      /* 42883 = function does not exist → means ping RPC is absent but connection works.
         Anything else is a real connection failure. */
      throw pingError
    }

    // Check a handful of important tables (add more if you need)
    const mustHave = [
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

    const tableCounts: Record<string, number | "Missing"> = {}

    for (const table of mustHave) {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

      tableCounts[table] = error ? "Missing" : (count ?? 0)
    }

    return NextResponse.json(
      {
        ok: true,
        env: {
          node: process.env.NODE_ENV,
          vercel: process.env.VERCEL_ENV ?? "local",
        },
        databaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40) + "…",
        tableCounts,
        elapsedMs: Date.now() - startedAt,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[database-connection] fatal", error)
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
