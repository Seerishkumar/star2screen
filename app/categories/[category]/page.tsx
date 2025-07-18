"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search, MapPin, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

interface Profile {
  id: number
  name: string
  image: string
  category: string
  location: string
  experience: string
  bio?: string
  skills?: string
  rating: number
  reviewCount: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Helper function to format category slug to display name
function formatCategoryName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const categoryName = formatCategoryName(params.category)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const [filters, setFilters] = useState({
    search: "",
    location: "",
    experience: "",
  })

  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const router = useRouter()

  useEffect(() => {
    const initialFilters = {
      search: searchParams.get("search") || "",
      location: searchParams.get("location") || "",
      experience: searchParams.get("experience") || "",
    }
    setFilters(initialFilters)

    const page = Number.parseInt(searchParams.get("page") || "1")
    fetchProfiles(page, initialFilters)
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [queryString, params.category]) // stable dependency + category slug

  const fetchProfiles = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true)
      const params_obj = new URLSearchParams({
        page: page.toString(),
        ...Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v)),
      })

      const response = await fetch(`/api/profiles/by-category/${params.category}?${params_obj}`)

      if (!response.ok) {
        throw new Error("Failed to fetch profiles")
      }

      const data = await response.json()
      setProfiles(data.profiles)
      setPagination(data.pagination)
    } catch (err) {
      console.error("Error fetching profiles:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    const params_obj = new URLSearchParams({
      page: "1",
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
    })
    router.push(`/categories/${params.category}?${params_obj}`)
  }

  const handlePageChange = (newPage: number) => {
    const params_obj = new URLSearchParams({
      page: newPage.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
    })
    router.push(`/categories/${params.category}?${params_obj}`)
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">{categoryName}</h1>
        <p className="text-muted-foreground">
          Find the best {categoryName.toLowerCase()} professionals for your project
        </p>
      </div>

      {/* Enhanced Filters */}
      <div className="mb-8 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="search" className="text-sm font-medium">
              Search
            </label>
            <div className="flex items-center rounded-md border px-3 py-2">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={`Search ${categoryName}...`}
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="border-0 p-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="w-full md:w-48 space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <div className="flex items-center rounded-md border px-3 py-2">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
                <SelectTrigger className="border-0 p-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Any Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Location</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="chennai">Chennai</SelectItem>
                  <SelectItem value="hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="kolkata">Kolkata</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                  <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="w-full md:w-48 space-y-2">
            <label htmlFor="experience" className="text-sm font-medium">
              Experience
            </label>
            <Select value={filters.experience} onValueChange={(value) => handleFilterChange("experience", value)}>
              <SelectTrigger id="experience" className="w-full">
                <SelectValue placeholder="Any Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Experience</SelectItem>
                <SelectItem value="1-3">1-3 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="5-10">5-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-auto">
            <Button onClick={applyFilters} className="w-full bg-secondary hover:bg-secondary/90">
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {profiles.length} of {pagination.total} {categoryName.toLowerCase()}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {profiles.map((profile) => (
              <Link key={profile.id} href={`/profiles/${profile.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-[4/3] relative">
                    <Image src={profile.image || "/placeholder.svg"} alt={profile.name} fill className="object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground">{profile.location}</p>
                        <p className="text-sm text-muted-foreground">Experience: {profile.experience}</p>
                        {profile.skills && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Skills: {profile.skills}</p>
                        )}
                      </div>
                      <div className="flex items-center ml-2">
                        <Star className="h-4 w-4 fill-accent-gold text-accent-gold" />
                        <span className="ml-1 text-sm font-medium">{profile.rating.toFixed(1)}</span>
                        <span className="ml-1 text-xs text-muted-foreground">({profile.reviewCount})</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>

                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, pagination.page - 2) + i
                  if (pageNum > pagination.totalPages) return null

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={pageNum === pagination.page ? "bg-primary text-white" : ""}
                    >
                      {pageNum}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
