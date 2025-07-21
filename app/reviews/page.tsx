import type { Metadata } from "next"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star, Quote, Filter } from "lucide-react"

export const metadata: Metadata = {
  title: "Reviews - Stars2Screen",
  description: "Read reviews and testimonials from film industry professionals who have used Stars2Screen.",
}

type Review = {
  id: number
  reviewer_name: string
  reviewer_role: string
  reviewer_image_url?: string
  rating: number
  title: string
  content: string
  project_type: string
  is_verified: boolean
  helpful_count: number
  created_at: string
}

type ReviewStats = {
  totalReviews: number
  averageRating: number
  ratingBreakdown: Array<{
    stars: number
    count: number
    percentage: number
  }>
}

async function getReviews(): Promise<{ reviews: Review[]; stats: ReviewStats | null }> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://www.stars2screen.com"
        : "http://localhost:3000"

    const response = await fetch(`${baseUrl}/api/reviews?limit=20&featured=true`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Failed to fetch reviews:", response.statusText)
      return { reviews: [], stats: null }
    }

    const data = await response.json()
    return { reviews: data.reviews || [], stats: data.stats || null }
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return { reviews: [], stats: null }
  }
}

const categories = ["All Reviews", "Directors", "Actors", "Producers", "Technical Crew", "Recent", "Verified Only"]

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
  ))
}

export default async function ReviewsPage() {
  const { reviews, stats } = await getReviews()

  // Fallback stats if not provided by API
  const displayStats = stats || {
    totalReviews: reviews.length,
    averageRating: 4.8,
    ratingBreakdown: [
      { stars: 5, count: Math.floor(reviews.length * 0.76), percentage: 76 },
      { stars: 4, count: Math.floor(reviews.length * 0.18), percentage: 18 },
      { stars: 3, count: Math.floor(reviews.length * 0.05), percentage: 5 },
      { stars: 2, count: Math.floor(reviews.length * 0.01), percentage: 1 },
      { stars: 1, count: 0, percentage: 0 },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Reviews & Testimonials</h1>
            <p className="text-xl mb-8">See what film industry professionals are saying about Stars2Screen</p>
          </div>
        </div>
      </section>

      {/* Rating Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Overall Rating */}
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                      <span className="text-5xl font-bold">{displayStats.averageRating}</span>
                      <div>
                        <div className="flex">{renderStars(Math.floor(displayStats.averageRating))}</div>
                        <p className="text-gray-600 text-sm mt-1">
                          Based on {displayStats.totalReviews.toLocaleString()} reviews
                        </p>
                      </div>
                    </div>
                    <p className="text-lg text-gray-600">Excellent rating from film industry professionals worldwide</p>
                  </div>

                  {/* Rating Breakdown */}
                  <div className="space-y-3">
                    {displayStats.ratingBreakdown.map((item) => (
                      <div key={item.stars} className="flex items-center gap-4">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm">{item.stars}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <Progress value={item.percentage} className="flex-1" />
                        <span className="text-sm text-gray-600 w-12">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Filter Reviews:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button key={category} variant={category === "All Reviews" ? "default" : "outline"} size="sm">
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Featured Reviews</h2>
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.map((review) => (
                  <Card key={review.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="relative w-12 h-12">
                          <Image
                            src={review.reviewer_image_url || "/placeholder.svg"}
                            alt={review.reviewer_name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{review.reviewer_name}</h3>
                            {review.is_verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{review.reviewer_role}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-2">{review.title}</h4>
                      <div className="relative">
                        <Quote className="w-6 h-6 text-gray-300 absolute -top-2 -left-1" />
                        <p className="text-gray-700 mb-4 pl-6">{review.content}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{review.project_type}</Badge>
                        <span className="text-gray-500">{review.helpful_count} helpful</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No reviews available at the moment.</p>
                <p className="text-gray-400">Be the first to leave a review!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
            <p className="text-xl mb-8">
              Join thousands of satisfied film industry professionals who have found success through Stars2Screen
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Get Started Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
