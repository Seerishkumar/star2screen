import { SearchForm } from "@/components/search-form"
import { CategoryGrid } from "@/components/category-grid"
import { StatisticsSection } from "@/components/statistics-section"
import { FeaturedActors } from "@/components/featured-actors"
import { BannerCarousel } from "@/components/home/banner-carousel"
import { AdsScroller } from "@/components/home/ads-scroller"
import { ArticlesSection } from "@/components/home/articles-section"
import { VideoShowcase } from "@/components/home/video-showcase"

type Banner = {
  id: number
  image_url: string
  title?: string
  subtitle?: string
  link_url?: string
  button_text?: string
  is_active?: boolean
}

type Ad = {
  id: number
  image_url: string
  title: string
  link_url: string
  description?: string
  is_active?: boolean
}

type Article = {
  id: number
  title: string
  slug: string
  featured_image_url?: string
  excerpt?: string
  author_name?: string
  published_at?: string
  status?: string
}

type Video = {
  id: number
  video_url: string
  thumbnail_url: string
  title: string
  description?: string
  is_active?: boolean
  is_featured?: boolean
}

async function fetchFromAPI<T>(endpoint: string, fallbackData: T[] = []): Promise<T[]> {
  try {
    console.log(`[fetchFromAPI] Fetching ${endpoint}...`)

    // Use absolute URL for production
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://www.stars2screen.com"
        : "http://localhost:3000"

    const url = `${baseUrl}${endpoint}`
    console.log(`[fetchFromAPI] Full URL: ${url}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
      next: { revalidate: 0 },
    })

    console.log(`[fetchFromAPI] Response status: ${response.status}`)

    if (!response.ok) {
      console.error(`[fetchFromAPI] HTTP error ${response.status} for ${endpoint}`)
      return fallbackData
    }

    const data = await response.json()
    console.log(`[fetchFromAPI] Raw response for ${endpoint}:`, data)

    // Handle different response formats
    let items: T[] = []

    if (Array.isArray(data)) {
      items = data
    } else if (data && typeof data === "object") {
      // Look for common array property names
      const arrayKeys = ["banners", "ads", "articles", "videos", "data", "items"]
      for (const key of arrayKeys) {
        if (Array.isArray(data[key])) {
          items = data[key]
          break
        }
      }

      // If no array found, try the first array property
      if (items.length === 0) {
        const firstArrayKey = Object.keys(data).find((key) => Array.isArray(data[key]))
        if (firstArrayKey) {
          items = data[firstArrayKey]
        }
      }
    }

    console.log(`[fetchFromAPI] Processed ${items.length} items from ${endpoint}`)
    return items.length > 0 ? items : fallbackData
  } catch (error) {
    console.error(`[fetchFromAPI] Error fetching ${endpoint}:`, error)
    return fallbackData
  }
}

const getBanners = () =>
  fetchFromAPI<Banner>("/api/banners", [
    {
      id: 1,
      title: "Welcome to Stars2Screen",
      subtitle: "Connect with the best professionals in the film industry",
      image_url: "/bustling-film-set.png",
      link_url: "/profiles",
      button_text: "Browse Profiles",
    },
  ])

const getAds = () =>
  fetchFromAPI<Ad>("/api/ads", [
    {
      id: 1,
      title: "Professional Headshots",
      description: "Get stunning headshots from top photographers",
      image_url: "/elegant-actress.png",
      link_url: "/categories/photographer",
    },
    {
      id: 2,
      title: "Casting Opportunities",
      description: "Find your next big role in upcoming productions",
      image_url: "/confident-actress.png",
      link_url: "/jobs",
    },
  ])

const getArticles = () =>
  fetchFromAPI<Article>("/api/articles", [
    {
      id: 1,
      title: "Breaking into the Film Industry: A Beginner's Guide",
      slug: "breaking-into-film-industry",
      excerpt: "Essential tips and strategies for newcomers to the film industry",
      featured_image_url: "/bustling-film-set.png",
      author_name: "Industry Expert",
    },
  ])

const getVideos = () =>
  fetchFromAPI<Video>("/api/videos", [
    {
      id: 1,
      title: "Acting Masterclass: Emotional Range",
      description: "Learn how to expand your emotional range as an actor",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail_url: "/confident-actress.png",
    },
  ])

export default async function Home() {
  console.log("[Home] Starting page render...")
  console.log("[Home] Environment:", process.env.NODE_ENV)
  console.log("[Home] Vercel URL:", process.env.VERCEL_URL)

  // Fetch all data in parallel
  const [banners, ads, articles, videos] = await Promise.allSettled([
    getBanners(),
    getAds(),
    getArticles(),
    getVideos(),
  ])

  // Extract successful results or use empty arrays
  const bannersData = banners.status === "fulfilled" ? banners.value : []
  const adsData = ads.status === "fulfilled" ? ads.value : []
  const articlesData = articles.status === "fulfilled" ? articles.value : []
  const videosData = videos.status === "fulfilled" ? videos.value : []

  console.log("[Home] Final data counts:", {
    banners: bannersData.length,
    ads: adsData.length,
    articles: articlesData.length,
    videos: videosData.length,
  })

  return (
    <div className="flex flex-col min-h-screen">
      {/* Debug Info - Only in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-100 border-b border-yellow-200 p-4 text-sm">
          <div className="container px-4 md:px-6">
            <strong>🔧 Debug Info:</strong> Banners: {bannersData.length}, Ads: {adsData.length}, Articles:{" "}
            {articlesData.length}, Videos: {videosData.length}
            <br />
            <strong>Environment:</strong> {process.env.NODE_ENV} | <strong>Base URL:</strong>{" "}
            {process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "localhost:3000"}
          </div>
        </div>
      )}

      {/* Banner Carousel */}
      <BannerCarousel banners={bannersData} />

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary mb-4">Find Your Perfect Match</h2>
            <p className="text-lg text-muted-foreground mb-8">Search for professionals, services, and opportunities</p>
          </div>
          <div className="mx-auto max-w-md">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <StatisticsSection />

      {/* Ads Scroller */}
      <AdsScroller ads={adsData} />

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-3xl font-bold text-center text-primary">Browse by Category</h2>
          <CategoryGrid />
        </div>
      </section>

      {/* Featured Professionals Section */}
      <FeaturedActors />

      {/* Articles & News Section */}
      <ArticlesSection articles={articlesData} />

      {/* Video Showcase Section */}
      <VideoShowcase videos={videosData} />
    </div>
  )
}
