import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
      return NextResponse.json(staticNewsData)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // First check if table exists and what columns are available
    const { data: tableInfo, error: tableError } = await supabase.from("news").select("*").limit(1)

    if (tableError) {
      console.error("Error checking news table:", tableError)
      return NextResponse.json(staticNewsData)
    }

    // Build query based on available columns
    let query = supabase.from("news").select("*")

    if (category) {
      query = query.eq("category", category)
    }

    // Only filter by is_featured if the column exists
    if (featured && tableInfo && tableInfo.length > 0 && "is_featured" in tableInfo[0]) {
      query = query.eq("is_featured", true)
    }

    const { data, error } = await query.order("published_at", { ascending: false }).limit(limit)

    if (error) {
      console.error("Error fetching news:", error)
      return NextResponse.json(staticNewsData)
    }

    return NextResponse.json(data && data.length > 0 ? data : staticNewsData)
  } catch (error) {
    console.error("Unexpected error in news API:", error)
    return NextResponse.json(staticNewsData)
  }
}
