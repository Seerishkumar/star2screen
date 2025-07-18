import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const results = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        timestamp: new Date().toISOString(),
      },
      banners: { data: [], error: null, count: 0 },
      ads: { data: [], error: null, count: 0 },
      articles: { data: [], error: null, count: 0 },
      videos: { data: [], error: null, count: 0 },
      profiles: { data: [], error: null, count: 0 },
    }

    // Test Banners
    try {
      const { data: banners, error: bannersError } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      results.banners = {
        data: banners || [],
        error: bannersError?.message || null,
        count: banners?.length || 0,
      }
    } catch (err) {
      results.banners.error = `Exception: ${err instanceof Error ? err.message : "Unknown error"}`
    }

    // Test Ads
    try {
      const { data: ads, error: adsError } = await supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      results.ads = {
        data: ads || [],
        error: adsError?.message || null,
        count: ads?.length || 0,
      }
    } catch (err) {
      results.ads.error = `Exception: ${err instanceof Error ? err.message : "Unknown error"}`
    }

    // Test Articles
    try {
      const { data: articles, error: articlesError } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(6)

      results.articles = {
        data: articles || [],
        error: articlesError?.message || null,
        count: articles?.length || 0,
      }
    } catch (err) {
      results.articles.error = `Exception: ${err instanceof Error ? err.message : "Unknown error"}`
    }

    // Test Videos
    try {
      const { data: videos, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)

      results.videos = {
        data: videos || [],
        error: videosError?.message || null,
        count: videos?.length || 0,
      }
    } catch (err) {
      results.videos.error = `Exception: ${err instanceof Error ? err.message : "Unknown error"}`
    }

    // Test Featured Profiles
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("author_profiles")
        .select(`
          id,
          user_id,
          full_name,
          bio,
          category,
          is_verified,
          created_at,
          user_media!inner (
            id,
            file_url,
            blob_url,
            media_type,
            is_profile_picture
          )
        `)
        .eq("is_verified", true)
        .limit(8)

      results.profiles = {
        data: profiles || [],
        error: profilesError?.message || null,
        count: profiles?.length || 0,
      }
    } catch (err) {
      results.profiles.error = `Exception: ${err instanceof Error ? err.message : "Unknown error"}`
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Home page debug error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
        environment: process.env.NODE_ENV,
      },
      { status: 500 },
    )
  }
}
