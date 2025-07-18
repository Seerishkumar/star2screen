"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Calendar, ChevronLeft, ChevronRight, Eye, Camera, AlertCircle } from "lucide-react"

interface FeaturedProfile {
  id: string
  user_id: string
  display_name: string | null
  stage_name: string | null
  full_name: string | null
  bio: string | null
  city: string | null
  location: string | null
  experience_years: number | null
  primary_roles: string[] | null
  profession: string | null
  avatar_url: string | null
  profile_image: string | null
  is_verified: boolean
  verified: boolean
  created_at: string
  media_count: number
  has_profile_picture: boolean
  has_fallback_image: boolean
  processing_error?: string
}

export function FeaturedActors() {
  const [profiles, setProfiles] = useState<FeaturedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)

  useEffect(() => {
    fetchFeaturedProfiles()
  }, [])

  const fetchFeaturedProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching featured profiles...")

      // Add cache busting and better error handling
      const response = await fetch(
        "/api/profiles/featured?" +
          new URLSearchParams({
            t: Date.now().toString(),
            cache: "no-store",
          }),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        },
      )

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }

        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      console.log("API Response:", data)
      setApiResponse(data)

      const profilesArray = Array.isArray(data) ? data : data.profiles || []
      setProfiles(profilesArray)

      if (profilesArray.length === 0) {
        console.warn("No profiles returned from API")
      }
    } catch (err) {
      console.error("Error fetching featured profiles:", err)
      setError(err instanceof Error ? err.message : "Failed to load featured profiles")
    } finally {
      setLoading(false)
    }
  }

  const getProfileName = (profile: FeaturedProfile): string => {
    return profile.display_name || profile.stage_name || profile.full_name || "Unknown Professional"
  }

  const getProfileImage = (profile: FeaturedProfile): string => {
    // Priority order: profile_picture_url -> avatar_url -> placeholder
    const imageUrl = profile.profile_image || profile.avatar_url

    if (imageUrl) {
      console.log(`Image for ${getProfileName(profile)}: ${imageUrl}`)
      return imageUrl
    }

    console.log(`No image for ${getProfileName(profile)}, using placeholder`)
    return "/placeholder.svg?height=300&width=300"
  }

  const getProfileCategory = (profile: FeaturedProfile): string => {
    if (profile.primary_roles && Array.isArray(profile.primary_roles) && profile.primary_roles.length > 0) {
      return profile.primary_roles[0]
    }
    return profile.profession || "Professional"
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-primary">Featured Professionals</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-primary text-primary bg-transparent">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-primary text-primary bg-transparent">
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mb-6">Loading top talent...</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
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
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Featured Professionals</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-600 font-medium">Error loading profiles:</p>
              </div>
              <p className="text-red-500 text-sm mt-1 break-words">{error}</p>
              <div className="mt-3 space-x-2">
                <Button onClick={fetchFeaturedProfiles} variant="outline" size="sm">
                  Try Again
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/api/profiles/featured" target="_blank" rel="noreferrer">
                    Check API
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/api/debug/environment" target="_blank" rel="noreferrer">
                    Check Environment
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/api/debug/database-connection" target="_blank" rel="noreferrer">
                    Test Database
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
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Featured Professionals</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
              <p className="text-yellow-800 font-medium">No featured professionals found.</p>
              <p className="text-sm text-yellow-700 mt-1">This might be due to:</p>
              <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                <li>No profiles in the database</li>
                <li>Database connection issues</li>
                <li>Environment configuration problems</li>
              </ul>
              <div className="mt-4 space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/profile/edit">Create Profile</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/profiles">View All Profiles</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/api/debug/database-connection" target="_blank" rel="noreferrer">
                    Test Database
                  </a>
                </Button>
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
            <Button variant="outline" size="sm" onClick={() => setDebugMode(!debugMode)} className="text-xs">
              {debugMode ? "Hide Debug" : "Debug"}
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-primary text-primary bg-transparent">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-primary text-primary bg-transparent">
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground mb-6">
          Discover top talent across all categories ({profiles.length} professionals)
        </p>

        {/* Debug Info Panel */}
        {debugMode && apiResponse && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Debug Information</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <strong>Environment:</strong> {apiResponse.environment || "Unknown"}
              </p>
              <p>
                <strong>Total Profiles:</strong> {apiResponse.total || profiles.length}
              </p>
              <p>
                <strong>Timestamp:</strong> {apiResponse.timestamp || "Unknown"}
              </p>
              <div className="mt-2 space-x-2">
                <Button asChild variant="outline" size="sm" className="text-xs bg-transparent">
                  <a href="/api/debug/environment" target="_blank" rel="noreferrer">
                    Environment Check
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="text-xs bg-transparent">
                  <a href="/api/debug/database-connection" target="_blank" rel="noreferrer">
                    Database Test
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {profiles.map((profile) => (
            <div key={profile.id}>
              <Link href={`/profiles/${profile.user_id}`} className="group">
                <Card className="overflow-hidden border bg-white shadow-sm transition-all hover:shadow-lg group-hover:scale-[1.02]">
                  {/* Profile Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={getProfileImage(profile) || "/placeholder.svg"}
                      alt={getProfileName(profile)}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      onError={(e) => {
                        console.error(`Image failed to load for ${getProfileName(profile)}:`, getProfileImage(profile))
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=300&width=300"
                      }}
                    />

                    {/* Processing Error Badge */}
                    {profile.processing_error && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Error
                      </Badge>
                    )}

                    {/* Media Count Badge */}
                    {!profile.processing_error && profile.media_count > 0 && (
                      <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs">
                        <Camera className="h-3 w-3 mr-1" />
                        {profile.media_count}
                      </Badge>
                    )}

                    {/* Verification Badge */}
                    {(profile.is_verified || profile.verified) && (
                      <Badge className="absolute top-2 right-2 bg-blue-500 text-white">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Verified
                      </Badge>
                    )}

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

                  {/* Profile Info */}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {getProfileName(profile)}
                    </h3>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="line-clamp-1">{getProfileLocation(profile)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span>{getExperienceText(profile)}</span>
                    </div>

                    {profile.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {profile.bio.length > 80 ? `${profile.bio.substring(0, 80)}...` : profile.bio}
                      </p>
                    )}

                    {profile.processing_error && (
                      <p className="text-xs text-red-500 mt-2">Processing error: {profile.processing_error}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>

              {/* Debug Info */}
              {debugMode && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                  <p>
                    <strong>User ID:</strong> {profile.user_id}
                  </p>
                  <p>
                    <strong>Media Count:</strong> {profile.media_count}
                  </p>
                  <p>
                    <strong>Has Profile Picture:</strong> {profile.has_profile_picture ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Has Fallback Image:</strong> {profile.has_fallback_image ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Image URL:</strong> {profile.profile_image || "None"}
                  </p>
                  <p>
                    <strong>Avatar URL:</strong> {profile.avatar_url || "None"}
                  </p>
                  {profile.processing_error && (
                    <p>
                      <strong>Error:</strong> {profile.processing_error}
                    </p>
                  )}
                  <div className="mt-1 space-x-1">
                    <Button asChild variant="outline" size="sm" className="text-xs bg-transparent">
                      <a href={`/api/debug/profile/${profile.user_id}`} target="_blank" rel="noreferrer">
                        Debug Profile
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="text-xs bg-transparent">
                      <a href={`/profiles/${profile.user_id}`} target="_blank" rel="noreferrer">
                        View Profile
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            asChild
            variant="outline"
            className="border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
          >
            <Link href="/profiles">View All Professionals</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
