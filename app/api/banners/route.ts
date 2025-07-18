import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

/**
 * Fetch active banners.
 * Handles both legacy `sort_order` and new `display_order` columns
 * and returns an empty array if the table has not been created yet.
 */
export async function GET() {
  const supabase = createServerSupabaseClient()

  // Helper that executes the query with the specified order column
  const fetchBanners = async (orderColumn: "display_order" | "sort_order") => {
    return supabase.from("banners").select("*").eq("is_active", true).order(orderColumn, { ascending: true })
  }

  try {
    // ❶ — First attempt with the newer `display_order` column
    let { data, error } = await fetchBanners("display_order")

    // ❷ — If the column doesn’t exist, retry with the legacy `sort_order`
    if (error?.code === "42703") {
      ;({ data, error } = await fetchBanners("sort_order"))
    }

    // ❸ — If the table itself is missing, return an empty list
    if (error?.code === "42P01") {
      console.warn("[/api/banners] banners table not found – returning empty array")
      return NextResponse.json({ banners: [] })
    }

    // Any other DB error
    if (error) {
      console.error("[/api/banners] database error:", error)
      return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
    }

    return NextResponse.json({ banners: data ?? [] })
  } catch (err) {
    console.error("[/api/banners] unexpected error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
