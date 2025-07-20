"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageButton } from "@/components/messaging/message-button"
import { MapPin, Briefcase, Star, User, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Profile {
  id: string
  user_id: string
  full_name: string | null
  display_name: string | null
  stage_name: string | null
  bio: string | null
  city: string | null
  location: string | null
  experience_years: number | null
  is_verified: boolean
  category: string | null
  availability_status: string | null
  profile_image: string | null
  media_count: number
  created_at: string
}

interface FeaturedActorsProps {
  limit?: number
  showDebug?: boolean
}

export function FeaturedActors({ limit = 8, showDebug = false }: FeaturedActorsProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebugPanel, setShowDebugPanel] = useState(false)

  useEffect(() => {
    fetchProfiles()
  }, [limit])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[FeaturedActors] Fetching profiles...")

      const response = await fetch(`/api/profiles/featured?limit=${limit}`)
      const data = await response.json()

      console.log("[FeaturedActors] API Response:", data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      setProfiles(data.profiles || [])
      setDebugInfo(data.stats)
    } catch (err) {
      console.error("[FeaturedActors] Error:", err)
      setError(err instanceof Error ? err.message : "Failed to load profiles")
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (profile: Profile) => {
    return profile.display_name || profile.stage_name || profile.full_name || "Professional"
  }

  const getLocation = (profile: Profile) => {
    return profile.city || profile.location || "Location not specified"
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Professionals</h2>
            <p className="text-muted-foreground">Loading top talent...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
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
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Professionals</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">Error loading profiles: {error}</p>
              <Button onClick={fetchProfiles} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-12">
          <div className="text-center flex-1">
            <h2 className="text-3xl font-bold mb-4">Featured Professionals</h2>
            <p className="text-muted-foreground">
              Discover top talent across all categories ({profiles.length} professionals found)
            </p>
          </div>

          {showDebug && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDebugPanel(!showDebugPanel)}>
                {showDebugPanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showDebugPanel ? "Hide" : "Show"} Debug
              </Button>
              <Link href="/profiles">
                <Button variant="outline" size="sm">
                  View All {profiles.length} Professionals
                </Button>
              </Link>
            </div>
          )}
        </div>

        {showDebugPanel && debugInfo && (
          <Card className="mb-8 bg-gray-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Debug Information</h3>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Total Profiles:</strong> {debugInfo.totalProfiles}
                </p>
                <p>
                  <strong>Profiles with Images:</strong> {debugInfo.profilesWithImages}
                </p>
                <p>
                  <strong>Total Media Files:</strong> {debugInfo.totalMediaFiles}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Professionals Found</h3>
            <p className="text-muted-foreground mb-4">There are no featured professionals available at the moment.</p>
            <Link href="/register">
              <Button>Join as a Professional</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {profiles.map((profile) => {
                const displayName = getDisplayName(profile)
                const location = getLocation(profile)

                return (
                  <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <Link href={`/profiles/${profile.user_id}`}>
                      <div className="relative aspect-square overflow-hidden">
                        {profile.profile_image ? (
                          <Image
                            src={profile.profile_image || "/placeholder.svg"}
                            alt={displayName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <User className="h-16 w-16 text-gray-400" />
                          </div>
                        )}

                        {/* Overlay with badges */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Status badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {!profile.profile_image && (
                            <Badge variant="secondary" className="bg-gray-500/80 text-white text-xs">
                              No Photo
                            </Badge>
                          )}
                          {profile.is_verified && (
                            <Badge variant="secondary" className="bg-blue-500/80 text-white text-xs">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        {/* Availability status */}
                        <div className="absolute top-3 right-3">
                          {profile.availability_status === "available" && (
                            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>

                        {/* Name overlay */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-white font-semibold text-lg leading-tight">{displayName}</h3>
                        </div>
                      </div>
                    </Link>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Location and Experience */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{location}</span>
                          </div>
                          {profile.experience_years && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              <span>{profile.experience_years}y exp</span>
                            </div>
                          )}
                        </div>

                        {/* Category */}
                        {profile.category && (
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {profile.category}
                            </Badge>
                          </div>
                        )}

                        {/* Bio */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {profile.bio || "No bio available"}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Link href={`/profiles/${profile.user_id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              View Profile
                            </Button>
                          </Link>
                          <MessageButton
                            recipientId={profile.user_id}
                            recipientName={displayName}
                            variant="default"
                            size="sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="text-center">
              <Link href="/profiles">
                <Button variant="outline" size="lg">
                  View All Professionals
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
