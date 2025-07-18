"use client"
import { createServerSupabaseClient } from "@/lib/supabase"
import { FilmIndustryProfileView } from "@/components/profile/film-industry-profile-view"
import { notFound } from "next/navigation"

interface ProfileData {
  id: string
  user_id: string
  full_name: string
  stage_name: string
  display_name: string
  bio: string
  resume_bio: string
  avatar_url?: string
  blob_url?: string
  gender: string
  date_of_birth: string
  nationality: string
  city: string
  known_for: string
  height: string
  body_type: string
  age_range: string
  representation: string
  contact_email: string
  contact_phone: string
  profile_video_url: string
  demo_reel_url: string
  imdb_url: string
  hourly_rate?: number
  experience_years?: number
  availability_status: string
  primary_roles: string[]
  skills: string[]
  languages: string[]
  tags: string[]
  social_media_links: any
  demo_scenes: any[]
  is_verified: boolean
  is_premium: boolean
  booking_enabled: boolean
  public_contact: boolean
  profile_views: number
  average_rating: number
  total_reviews: number
  education: any[]
  experience: any[]
  awards: any[]
  reviews: any[]
  user_media: any[]
}

interface MediaFile {
  id: string
  title: string
  description: string
  media_type: "image" | "video"
  file_url: string
  blob_url: string
  thumbnail_url?: string
  is_featured: boolean
  is_profile_picture: boolean
  tags: string[]
  file_size: number
  created_at: string
}

async function fetchProfile(userId: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Query by user_id instead of id, and use maybeSingle() to handle missing profiles gracefully
    const { data: profile, error } = await supabase
      .from("author_profiles")
      .select(`
        *,
        user_media (
          id,
          file_url,
          blob_url,
          media_type,
          is_profile_picture
        )
      `)
      .eq("user_id", userId)
      .maybeSingle()

    if (error) {
      console.error("Profile fetch error:", error)
      return null
    }

    return profile
  } catch (error) {
    console.error("Profile fetch error:", error)
    return null
  }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const profile = await fetchProfile(params.id)

  if (!profile) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FilmIndustryProfileView profile={profile} />
    </div>
  )
}
