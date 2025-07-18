import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Build a **server-side** Supabase client from env vars.
 * Falls back to the public anon key if the Service-Role key is
 * not present (works in local dev as well).
 */
function getSupabaseServer() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(url, key)
}

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    /* ------------------------------------------------------------ */
    /* 1 . Fetch six active profiles (select * to avoid bad columns)*/
    /* ------------------------------------------------------------ */
    const { data: rows, error } = await supabase
      .from("author_profiles")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      console.error("[featured] DB error:", error)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json([]) // no content is a valid response
    }

    /* ------------------------------------------------------------ */
    /* 2 . For each profile pick a photo:
           user_media.is_profile_picture -> avatar_url -> placeholder */
    /* ------------------------------------------------------------ */
    const profiles = await Promise.all(
      rows.map(async (p: Record<string, any>) => {
        // try to find an uploaded profile-picture
        const { data: media } = await supabase
          .from("user_media")
          .select("blob_url, file_url")
          .eq("user_id", p.user_id)
          .eq("is_profile_picture", true)
          .single()

        const image =
          media?.blob_url ||
          media?.file_url ||
          p.avatar_url ||
          p.profile_picture_url || // if such a column exists
          "/placeholder.svg?height=400&width=300"

        return {
          id: p.id,
          name: p.display_name || p.stage_name || p.full_name || "Unknown Professional",
          image,
          category: (Array.isArray(p.primary_roles) && p.primary_roles[0]) || p.profession || "Professional",
          location: p.city || p.location || "—",
          experience:
            p.experience_years !== null && p.experience_years !== undefined ? `${p.experience_years} yrs` : "New",
        }
      }),
    )

    return NextResponse.json(profiles)
  } catch (err) {
    console.error("[featured] Unexpected:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
