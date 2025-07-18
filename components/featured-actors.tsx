"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Camera, User, AlertCircle, Eye, Calendar } from "lucide-react"

interface FeaturedProfile {
  id: string
  user_id: string
  full_name: string | null
  display_name: string | null
  stage_name: string | null
  bio: string | null
  category: string | null
  profession: string | null
  primary_roles: string[] | null
  location: string | null
  city: string | null
  experience_years: number | null
  is_verified: boolean
  avatar_url: string | null
  profile_image: string | null
  media_count: number
  has_profile_picture: boolean
  has_any_image: boolean
  created_at: string
}

interface ApiResponse {
  profiles: FeaturedProfile[]
  count: number
  total_in_db: number
  profiles_with_images: number
  profiles_without_images: number
  environment: string
  timestamp: string
  debug: {
    total_profiles_queried: number
    total_media_files: number
    user_ids_searched: number
  }
  error?: string
  message?: string
}

export function FeaturedActors() {
  const [profiles, setProfiles] = useState<FeaturedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)

  useEffect(() => {
    async function fetchFeaturedProfiles() {
      try {
        console.log("Fetching featured profiles...")
        setLoading(true)
        setError(null)

        const response = await fetch("/api/profiles/featured", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        console.log("Response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error Response:", errorText)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data: ApiResponse = await response.json()
        console.log("Featured profiles response:", data)
        setApiResponse(data)

        if (data.error) {
          throw new Error(data.error)
        }

        const profilesArray = data.profiles || []
        console.log(`Received ${profilesArray.length} profiles from API`)

        setProfiles(profilesArray)
      } catch (err) {
        console.error("Featured profiles fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load profiles")
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProfiles()
  }, [])

  const getProfileName = (profile: FeaturedProfile): string => {
    return profile.display_name || profile.stage_name || profile.full_name || "Unknown Professional"
  }

  const getProfileImage = (profile: FeaturedProfile): string => {
    return profile.profile_image || profile.avatar_url || "/placeholder.svg?height=300&width=300"
  }

  const getProfileCategory = (profile: FeaturedProfile): string => {
    if (profile.primary_roles && Array.isArray(profile.primary_roles) && profile.primary_roles.length > 0) {
      return profile.primary_roles[0]
    }
    return profile.profession || profile.category || "Professional"
  }

  const getProfileLocation = (profile: FeaturedProfile): string => {
    return profile.city || profile.location || "Location not specified"
  }

  const getExperienceText = (profile: FeaturedProfile): string => {
    if (profile.experience_years !== null && profile.experience_years !== undefined) {
      return `${profile.experience_years} years experience`
    }
    return "New to industry"
  }

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-2xl font-bold text-center text-primary">Featured Professionals</h2>
          <p className="text-center text-muted-foreground mb-6">Loading professionals from database...</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-2xl font-bold text-center text-primary">Featured Professionals</h2>
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Profiles</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={() => window.location.reload()} variant="outline">
                  Retry
                </Button>
                <Button asChild variant="outline">
                  <a href="/api/profiles/featured" target="_blank" rel="noopener noreferrer">
                    Check API
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (profiles.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-2xl font-bold text-center text-primary">Featured Professionals</h2>
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <User className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Professionals Found</h3>
              <p className="text-yellow-700 mb-4">
                {apiResponse?.message || "No professional profiles are available in the database at the moment."}
              </p>
              <div className="space-x-2">
                <Button asChild variant="outline">
                  <Link href="/profile/edit">Create Profile</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/profiles">Browse All Profiles</Link>
                </Button>
                {apiResponse?.debug && (
                  <Button asChild variant="outline">
                    <a href="/api/profiles/featured" target="_blank" rel="noopener noreferrer">
                      Check Database
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-primary">Featured Professionals</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setDebugMode(!debugMode)}>
              {debugMode ? "Hide Debug" : "Debug"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profiles">View All ({profiles.length})</Link>
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">
          Discover top talent across all categories ({profiles.length} professionals found)
        </p>

        {/* Debug Information Panel */}
        {debugMode && apiResponse && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Database Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <p>
                  <strong>Total in Database:</strong> {apiResponse.total_in_db}
                </p>
                <p>
                  <strong>Profiles Returned:</strong> {apiResponse.count}
                </p>
                <p>
                  <strong>With Images:</strong> {apiResponse.profiles_with_images}
                </p>
                <p>
                  <strong>Without Images:</strong> {apiResponse.profiles_without_images}
                </p>
              </div>
              <div>
                <p>
                  <strong>Environment:</strong> {apiResponse.environment}
                </p>
                <p>
                  <strong>Media Files Found:</strong> {apiResponse.debug.total_media_files}
                </p>
                <p>
                  <strong>Users Searched:</strong> {apiResponse.debug.user_ids_searched}
                </p>
                <p>
                  <strong>Last Updated:</strong> {new Date(apiResponse.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="mt-3 space-x-2">
              <Button asChild variant="outline" size="sm">
                <a href="/api/profiles/featured" target="_blank" rel="noopener noreferrer">
                  View Raw API Response
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/api/debug/database-connection" target="_blank" rel="noopener noreferrer">
                  Test Database Connection
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <Link key={profile.id} href={`/profiles/${profile.user_id}`} className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                <div className="relative h-48 overflow-hidden">
                  {profile.profile_image || profile.avatar_url ? (
                    <Image
                      src={getProfileImage(profile) || "/placeholder.svg"}
                      alt={getProfileName(profile)}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=300&width=300"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                  {/* Verification Badge */}
                  {profile.is_verified && (
                    <Badge className="absolute top-2 right-2 bg-blue-500 text-white">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Verified
                    </Badge>
                  )}

                  {/* Media Count Badge */}
                  <Badge className="absolute bottom-2 left-2 bg-black/70 text-white text-xs">
                    {profile.media_count > 0 ? (
                      <>
                        <Camera className="h-3 w-3 mr-1" />
                        {profile.media_count}
                      </>
                    ) : (
                      "No Media"
                    )}
                  </Badge>

                  {/* Category Badge */}
                  <Badge className="absolute bottom-2 right-2 bg-secondary text-secondary-foreground text-xs">
                    {getProfileCategory(profile)}
                  </Badge>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center text-white">
                      <Eye className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm font-medium">View Profile</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {getProfileName(profile)}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-1">{getProfileLocation(profile)}</span>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>{getExperienceText(profile)}</span>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {profile.bio
                      ? profile.bio.length > 80
                        ? `${profile.bio.substring(0, 80)}...`
                        : profile.bio
                      : "No bio available"}
                  </p>

                  {/* Debug Info for Individual Profile */}
                  {debugMode && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                      <p>
                        <strong>User ID:</strong> {profile.user_id.slice(0, 8)}...
                      </p>
                      <p>
                        <strong>Has Profile Pic:</strong> {profile.has_profile_picture ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>Has Any Image:</strong> {profile.has_any_image ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>Image URL:</strong> {profile.profile_image ? "✓" : "✗"}
                      </p>
                      <p>
                        <strong>Media Count:</strong> {profile.media_count}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-8 text-center">
          <Button
            asChild
            variant="outline"
            className="border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
          >
            <Link href="/profiles">View All {profiles.length} Professionals</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
