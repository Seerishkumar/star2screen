import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

/**
 * GET /api/profiles/featured
 *
 * Fetches up to 16 recent author profiles and resolves a display image for each
 * without relying on PostgREST relationships (which do **not** exist in
 * production and caused: “Could not find a relationship between
 * 'author_profiles' and 'user_media' in the schema cache”).
 *
 * Resolution order per profile:
 * 1. First media row marked is_profile_picture && media_type='image'
 * 2. First media row with media_type='image'
 * 3. profile.avatar_url
 * 4. null  ➜  the client will render a placeholder
 */
export async function GET() {
  try {
    // --- Initialise Supabase -------------------------------------------------
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // --- Fetch profiles ------------------------------------------------------
    const { data: profiles, error: profilesErr } = await supabase
      .from("author_profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(16)

    if (profilesErr) {
      console.error("[featured-profiles] DB error (profiles):", profilesErr)
      return NextResponse.json({ error: profilesErr.message }, { status: 500 })
    }

    // --- For each profile resolve an image & media count ---------------------
    const processed = await Promise.all(
      (profiles || []).map(async (p) => {
        // 1️⃣ explicit profile picture
        const { data: pic } = await supabase
          .from("user_media")
          .select("blob_url,file_url")
          .eq("user_id", p.user_id)
          .eq("is_profile_picture", true)
          .eq("media_type", "image")
          .limit(1)
          .maybeSingle()

        // 2️⃣ first image if no explicit picture
        let fallback: { blob_url: string | null; file_url: string | null } | null = null
        if (!pic) {
          const { data } = await supabase
            .from("user_media")
            .select("blob_url,file_url")
            .eq("user_id", p.user_id)
            .eq("media_type", "image")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
          fallback = data
        }

        // media count (for badge)
        const { count: mediaCount } = await supabase
          .from("user_media")
          .select("*", { count: "exact", head: true })
          .eq("user_id", p.user_id)

        const resolvedImage =
          pic?.blob_url || pic?.file_url || fallback?.blob_url || fallback?.file_url || p.avatar_url || null

        return {
          ...p,
          profile_image: resolvedImage,
          media_count: mediaCount ?? 0,
          has_profile_picture: !!pic,
          has_fallback_image: !!fallback,
        }
      }),
    )

    return NextResponse.json({
      profiles: processed,
      total: processed.length,
      environment: process.env.NODE_ENV,
      generated_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[featured-profiles] unexpected:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
