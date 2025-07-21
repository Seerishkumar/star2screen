import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

// Sample static data as fallback
const staticNewsData = [
  {
    id: "1",
    title: "Major Studio Announces New Film Slate",
    content: "Details about upcoming films and productions...",
    image_url: "/bustling-film-set.png",
    source: "Film Industry News",
    category: "Industry",
    is_featured: true,
    published_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Award-Winning Director Starts Casting for New Project",
    content: "Information about the casting process...",
    image_url: "/director-in-discussion.png",
    source: "Entertainment Weekly",
    category: "Casting",
    is_featured: true,
    published_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Film Festival Announces Lineup",
    content: "Details about this year's selected films...",
    image_url: "/city-cafe-meetup.png",
    source: "Festival Daily",
    category: "Events",
    is_featured: false,
    published_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "New Technology Revolutionizes Post-Production",
    content: "How AI is changing editing workflows...",
    image_url: "/confident-young-professional.png",
    source: "Tech in Film",
    category: "Technology",
    is_featured: false,
    published_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Streaming Platform Signs Major Deal with Indie Filmmakers",
    content: "Details of the new partnership...",
    image_url: "/woman-contemplating-window.png",
    source: "Streaming News",
    category: "Business",
    is_featured: true,
    published_at: new Date().toISOString(),
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured") === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing environment variables for Supabase")
      return NextResponse.json({
        data: staticNewsData,
        isStaticFallback: true,
        error: "Using static fallback data due to missing environment variables",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if the news table exists
    const { error: tableCheckError } = await supabase.from("news").select("id", { count: "exact", head: true })

    if (tableCheckError) {
      console.error("Error checking news table:", tableCheckError)
      return NextResponse.json({
        data: staticNewsData,
        isStaticFallback: true,
        error: "Using static fallback data due to database table issue",
      })
    }

    // Build the query
    let query = supabase.from("news").select("*")

    if (category) {
      query = query.eq("category", category)
    }

    if (featured) {
      query = query.eq("is_featured", true)
    }

    const { data, error } = await query.order("published_at", { ascending: false }).limit(limit)

    if (error) {
      console.error("Error fetching news:", error)
      return NextResponse.json({
        data: staticNewsData,
        isStaticFallback: true,
        error: "Using static fallback data due to database query error",
      })
    }

    return NextResponse.json(data.length > 0 ? data : staticNewsData)
  } catch (error) {
    console.error("Unexpected error in news API:", error)
    return NextResponse.json({
      data: staticNewsData,
      isStaticFallback: true,
      error: "Using static fallback data due to unexpected error",
    })
  }
}
