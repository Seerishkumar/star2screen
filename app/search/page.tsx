"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MapPin, Calendar, Search } from "lucide-react"

interface Profile {
  id: string
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
  profile_picture_url: string | null
  is_verified: boolean
}

const categories = [
  "All Categories",
  "Actor",
  "Actress",
  "Director",
  "Producer",
  "Cinematographer",
  "Music Director",
  "Art Director",
  "Choreographer",
  "Stunt Director",
  "Technician",
  "Dubbing Artist",
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedLocation, setSelectedLocation] = useState("")

  const handleSearch = async () => {
    if (!searchTerm.trim() && selectedCategory === "All Categories" && !selectedLocation.trim()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (selectedCategory && selectedCategory !== "All Categories") params.append("category", selectedCategory)
      if (selectedLocation.trim()) params.append("location", selectedLocation.trim())

      const response = await fetch(`/api/profiles/all?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setProfiles(Array.isArray(data) ? data : data.profiles || [])
    } catch (err) {
      console.error("Error searching profiles:", err)
      setError(err instanceof Error ? err.message : "Failed to search profiles")
    } finally {
      setLoading(false)
    }
  }

  // Auto-search on initial load if there are search params
  useEffect(() => {
    const initialSearch = searchParams.get("q")
    if (initialSearch) {
      handleSearch()
    }
  }, [])

  const getProfileName = (profile: Profile): string => {
    return profile.display_name || profile.stage_name || profile.full_name || "Unknown Professional"
  }

  const getProfileImage = (profile: Profile): string => {
    return profile.avatar_url || profile.profile_picture_url || "/placeholder.svg?height=400&width=300"
  }

  const getProfileCategory = (profile: Profile): string => {
    if (profile.primary_roles && Array.isArray(profile.primary_roles) && profile.primary_roles.length > 0) {
      return profile.primary_roles[0]
    }
    return profile.profession || "Professional"
  }

  const getProfileLocation = (profile: Profile): string => {
    return profile.city || profile.location || "Location not specified"
  }

  const getExperienceText = (profile: Profile): string => {
    if (profile.experience_years !== null && profile.experience_years !== undefined) {
      return `${profile.experience_years} years experience`
    }
    return "New to industry"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-4">Find Talent</h1>
        <p className="text-muted-foreground mb-6">Search for professionals in the film industry</p>

        {/* Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Location..."
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />

          <Button onClick={handleSearch} className="w-full" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 font-medium">Error searching profiles:</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            {searchTerm || selectedCategory !== "All Categories" || selectedLocation
              ? "No professionals found matching your search criteria."
              : "Enter search terms to find professionals."}
          </p>
          <p className="text-sm text-gray-500 mb-6">Try different keywords or browse all categories.</p>
          <Button asChild variant="outline">
            <Link href="/profiles">Browse All Professionals</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Found {profiles.length} professional{profiles.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <Link key={profile.id} href={`/profiles/${profile.id}`}>
                <Card className="group overflow-hidden border bg-white shadow-sm transition-all hover:shadow-md">
                  <CardContent className="p-6 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <Image
                        src={getProfileImage(profile) || "/placeholder.svg"}
                        alt={getProfileName(profile)}
                        fill
                        className="rounded-full object-cover"
                      />
                      {profile.is_verified && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                          <Star className="h-3 w-3 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary">{getProfileName(profile)}</h3>

                    <Badge variant="secondary" className="mb-2">
                      {getProfileCategory(profile)}
                    </Badge>

                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{getProfileLocation(profile)}</span>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-3 w-3" />
                      <span>{getExperienceText(profile)}</span>
                    </div>

                    {profile.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {profile.bio.length > 80 ? `${profile.bio.substring(0, 80)}...` : profile.bio}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
