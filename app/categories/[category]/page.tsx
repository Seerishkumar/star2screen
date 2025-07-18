"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Profile {
  id: string
  full_name: string
  category: string
  location: string
  experience_years: number
  bio: string
  profile_image_url?: string
  rating?: number
  verified: boolean
}

export default function CategoryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const category = params.category as string

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")

  const locations = [
    { value: "mumbai", label: "Mumbai" },
    { value: "delhi", label: "Delhi" },
    { value: "bangalore", label: "Bangalore" },
    { value: "chennai", label: "Chennai" },
    { value: "hyderabad", label: "Hyderabad" },
    { value: "pune", label: "Pune" },
  ]

  useEffect(() => {
    const location = searchParams.get("location")
    const search = searchParams.get("search")

    if (location) setSelectedLocation(location)
    if (search) setSearchTerm(search)
  }, [searchParams.toString()])

  useEffect(() => {
    if (category) {
      fetchProfiles()
    }
  }, [category, selectedLocation, searchTerm])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedLocation) params.append("location", selectedLocation)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/profiles/by-category/${category}?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch profiles")
      }
      const data = await response.json()
      setProfiles(data.profiles || [])
    } catch (error) {
      console.error("Error fetching profiles:", error)
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchProfiles()
  }

  const categoryLabel = category?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || ""

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{categoryLabel}</h1>

        {/* Search Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 rounded-md border px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 p-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="flex items-center gap-2 rounded-md border px-3 py-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="border-0 p-0 shadow-none focus:ring-0">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSearch} className="bg-secondary hover:bg-secondary/90">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <Link key={profile.id} href={`/profiles/${profile.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    {profile.profile_image_url ? (
                      <Image
                        src={profile.profile_image_url || "/placeholder.svg"}
                        alt={profile.full_name}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-400">{profile.full_name.charAt(0)}</span>
                      </div>
                    )}
                    {profile.verified && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                        <Star className="h-3 w-3 text-white fill-current" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-1">{profile.full_name}</h3>
                  <Badge variant="secondary" className="mb-2">
                    {profile.category}
                  </Badge>

                  <p className="text-sm text-muted-foreground mb-2">
                    {profile.location} • {profile.experience_years} years exp.
                  </p>

                  {profile.rating && (
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{profile.rating}</span>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-muted-foreground">
              No {categoryLabel.toLowerCase()} found matching your criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedLocation("")
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
