import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

// Sample static data as fallback
const staticReviewsData = [
  {
    id: "1",
    reviewer_name: "Sarah Johnson",
    reviewer_title: "Casting Director",
    reviewer_image: "/confident-actress.png",
    content:
      "This platform has completely transformed how I find talent for my productions. The quality of profiles and the ease of communication make it my go-to resource.",
    rating: 5,
    is_featured: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    reviewer_name: "Michael Chen",
    reviewer_title: "Independent Filmmaker",
    reviewer_image: "/confident-young-professional.png",
    content:
      "As an indie director, I've found incredible collaborators through this platform. The categorization by specialty makes it easy to find exactly who I need.",
    rating: 5,
    is_featured: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    reviewer_name: "Priya Patel",
    reviewer_title: "Producer",
    reviewer_image: "/elegant-woman-blue.png",
    content:
      "The messaging system and profile verification give me confidence when reaching out to new talent. Highly recommended for serious industry professionals.",
    rating: 4,
    is_featured: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    reviewer_name: "James Wilson",
    reviewer_title: "Actor",
    reviewer_image: "/confident-businessman.png",
    content:
      "I've landed three roles through connections made on this platform. The interface is intuitive and the community is supportive and professional.",
    rating: 5,
    is_featured: false,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    reviewer_name: "Emma Rodriguez",
    reviewer_title: "Cinematographer",
    reviewer_image: "/woman-contemplating-window.png",
    content:
      "Great platform for networking and showcasing my portfolio. I appreciate the industry-specific features that other platforms lack.",
    rating: 4,
    is_featured: false,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured") === "true"
    const verified = searchParams.get("verified") === "true"
    const minRating = Number.parseInt(searchParams.get("minRating") || "0")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing environment variables for Supabase")
      return NextResponse.json({
        data: staticReviewsData,
        isStaticFallback: true,
        error: "Using static fallback data due to missing environment variables",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if the reviews table exists
    const { error: tableCheckError } = await supabase.from("reviews").select("id", { count: "exact", head: true })

    if (tableCheckError) {
      console.error("Error checking reviews table:", tableCheckError)
      return NextResponse.json({
        data: staticReviewsData,
        isStaticFallback: true,
        error: "Using static fallback data due to database table issue",
      })
    }

    // Build the query
    let query = supabase.from("reviews").select("*")

    if (featured) {
      query = query.eq("is_featured", true)
    }

    if (verified) {
      query = query.eq("is_verified", true)
    }

    if (minRating > 0) {
      query = query.gte("rating", minRating)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit)

    if (error) {
      console.error("Error fetching reviews:", error)
      return NextResponse.json({
        data: staticReviewsData,
        isStaticFallback: true,
        error: "Using static fallback data due to database query error",
      })
    }

    return NextResponse.json(data.length > 0 ? data : staticReviewsData)
  } catch (error) {
    console.error("Unexpected error in reviews API:", error)
    return NextResponse.json({
      data: staticReviewsData,
      isStaticFallback: true,
      error: "Using static fallback data due to unexpected error",
    })
  }
}
