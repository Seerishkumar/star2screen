"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

interface Profile {
  id: string
  name: string
  image: string
  category: string
  location: string
  experience: string
}

export function FeaturedActors() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeaturedProfiles()
  }, [])

  const fetchFeaturedProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching featured profiles...")
      const response = await fetch("/api/profiles/featured", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)
      console.log("Response content-type:", response.headers.get("content-type"))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)

        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.details || errorMessage
          console.error("Parsed error:", errorData)
        } catch (parseError) {
          console.error("Could not parse error as JSON:", parseError)
          errorMessage = errorText.substring(0, 200)
        }

        throw new Error(errorMessage)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("Non-JSON response:", responseText)
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      console.log("Successfully fetched profiles:", data)

      if (Array.isArray(data)) {
        setProfiles(data)
      } else {
        console.error("Data is not an array:", data)
        throw new Error("Invalid data format received")
      }
    } catch (err) {
      console.error("Error fetching featured profiles:", err)
      setError(err instanceof Error ? err.message : "Failed to load featured profiles")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-primary">Featured Professionals</h2>
          </div>
          <p className="text-muted-foreground mb-6">Loading top talent...</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Featured Professionals</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
              <p className="text-red-600 font-medium">Error loading profiles:</p>
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
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (profiles.length === 0) {
    return (
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Featured Professionals</h2>
            <p className="text-muted-foreground mb-4">No professionals found.</p>
            <p className="text-sm text-gray-500">Create some profiles to see them here.</p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/profile/edit">Create Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
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
        <p className="text-muted-foreground mb-6">Discover top talent across all categories</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {profiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/profiles/${profile.id}`}
              className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <Image
                  src={profile.image || "/placeholder.svg"}
                  alt={profile.name}
                  width={300}
                  height={400}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm">{profile.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {profile.category} • {profile.location}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{profile.experience}</p>
              </div>
            </Link>
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
