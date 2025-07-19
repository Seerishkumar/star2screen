"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Camera, User, AlertCircle, RefreshCw } from "lucide-react"

interface FeaturedProfile {
  id: string
  user_id: string
  full_name: string
  bio: string
  location: string
  category: string
  is_verified: boolean
  profile_image: string | null
  media_count: number
  experience_years: number
  hourly_rate: number | null
  availability_status: string
  created_at: string
}

interface ApiResponse {
  profiles: FeaturedProfile[]
  count: number
  stats: {
    totalProfiles: number
    profilesWithImages: number
    totalMediaFiles: number
  }
  error?: string
  debug?: any
}

export function FeaturedActors() {
  const [profiles, setProfiles] = useState<FeaturedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching featured profiles...")

      const response = await fetch("/api/profiles/featured", {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: ApiResponse = await response.json()
      console.log("Featured profiles API response:", data)

      setApiResponse(data)

      if (data.error) {
        setError(data.error)
        setProfiles([])
      } else {
        setProfiles(data.profiles || [])
      }
    } catch (err) {
      console.error("Error fetching profiles:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch profiles")
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-primary">Featured Professionals</h2>
            <div className="animate-spin">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
          <p className="text-muted-foreground mb-6">Loading professionals from database...</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-primary">Featured Professionals</h2>
            <p className="text-muted-foreground mt-2">
              {profiles.length > 0
                ? `Discover top talent across all categories (${profiles.length} professionals found)`
                : "Loading professional profiles..."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setDebugMode(!debugMode)}>
              {debugMode ? "Hide Debug" : "Show Debug"}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchProfiles}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {profiles.length > 0 && (
              <Button variant="outline" asChild>
                <Link href="/profiles">View All ({profiles.length})</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Debug Information */}
        {debugMode && apiResponse && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <h3 className="font-semibold text-blue-800 mb-3">🔧 Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
              <div>
                <p>
                  <strong>API Response:</strong>
                </p>
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Profiles Returned: {apiResponse.count}</li>
                  <li>• Environment: {apiResponse.debug?.environment}</li>
                  <li>• Timestamp: {new Date(apiResponse.debug?.timestamp).toLocaleTimeString()}</li>
                  {apiResponse.error && <li className="text-red-600">• Error: {apiResponse.error}</li>}
                </ul>
              </div>
              {apiResponse.stats && (
                <div>
                  <p>
                    <strong>Database Stats:</strong>
                  </p>
                  <ul className="mt-1 space-y-1 ml-4">
                    <li>• Total Profiles: {apiResponse.stats.totalProfiles}</li>
                    <li>• Profiles with Images: {apiResponse.stats.profilesWithImages}</li>
                    <li>• Total Media Files: {apiResponse.stats.totalMediaFiles}</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-3 space-x-2">
              <Button asChild variant="outline" size="sm">
                <a href="/api/profiles/featured" target="_blank" rel="noopener noreferrer">
                  View Raw API Response
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle className="h-5 w-5" />
              <strong>Unable to Load Professionals</strong>
            </div>
            <p className="text-red-700 mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchProfiles} className="bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Profiles Grid */}
        {profiles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {profiles.map((profile) => (
                <Link key={profile.id} href={`/profiles/${profile.user_id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      {profile.profile_image ? (
                        <Image
                          src={profile.profile_image || "/placeholder.svg"}
                          alt={profile.full_name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
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
                      <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-xs">
                        {profile.category}
                      </Badge>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-center text-white">
                          <User className="h-6 w-6 mx-auto mb-1" />
                          <span className="text-sm font-medium">View Profile</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {profile.full_name}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="line-clamp-1">{profile.location}</span>
                      </div>

                      {/* Experience & Rate */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span>
                          {profile.experience_years > 0 ? `${profile.experience_years} years exp` : "New to industry"}
                        </span>
                        {profile.hourly_rate && (
                          <span className="font-medium">₹{profile.hourly_rate.toLocaleString()}/day</span>
                        )}
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {profile.bio && profile.bio.length > 80 ? `${profile.bio.substring(0, 80)}...` : profile.bio}
                      </p>

                      {/* Availability Status */}
                      <div className="mt-3">
                        <Badge
                          variant={profile.availability_status === "available" ? "default" : "secondary"}
                          className={`text-xs ${
                            profile.availability_status === "available" ? "bg-green-500 text-white" : ""
                          }`}
                        >
                          {profile.availability_status === "available" ? "Available" : "Busy"}
                        </Badge>
                      </div>

                      {/* Debug Info for Individual Profile */}
                      {debugMode && (
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                          <p>
                            <strong>User ID:</strong> {profile.user_id.slice(0, 8)}...
                          </p>
                          <p>
                            <strong>Has Image:</strong> {profile.profile_image ? "✅ Yes" : "❌ No"}
                          </p>
                          <p>
                            <strong>Media Count:</strong> {profile.media_count}
                          </p>
                          <p>
                            <strong>Created:</strong> {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-8">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-transparent border-primary text-primary hover:bg-primary/10"
              >
                <Link href="/profiles">View All {profiles.length} Professionals</Link>
              </Button>
            </div>
          </>
        ) : !loading && !error ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Professionals Found</h3>
            <p className="text-muted-foreground mb-4">No professional profiles are available in the database yet.</p>
            <div className="space-x-2">
              <Button variant="outline" onClick={fetchProfiles}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild variant="outline">
                <Link href="/profile/edit">Create Profile</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
