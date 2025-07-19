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

async function safeFetch<T>(path: string, fallbackData: T[] = []): Promise<T[]> {
  try {
    console.log(`[Home] Fetching ${path}...`)

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://www.stars2screen.com"
        : "http://localhost:3000"

    const fullUrl = `${baseUrl}${path}`
    console.log(`[Home] Full URL: ${fullUrl}`)

    const response = await fetch(fullUrl, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "NextJS-Server",
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      console.error(`[Home] HTTP ${response.status} from ${path}:`, response.statusText)
      return fallbackData
    }

    const json = await response.json()
    console.log(`[Home] Response from ${path}:`, json)

    if (Array.isArray(json)) {
      return json as T[]
    }

    const keys = Object.keys(json)
    if (keys.length > 0) {
      const dataKey = keys.find((key) => Array.isArray(json[key])) || keys[0]
      const data = json[dataKey] as T[]
      console.log(`[Home] Extracted ${data?.length || 0} items from ${path}`)
      return data || fallbackData
    }

    return fallbackData
  } catch (error) {
    console.error(`[Home] Error fetching ${path}:`, error)
    return fallbackData
  }
}

const getBanners = () =>
  safeFetch<Banner>("/api/banners", [
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
  safeFetch<Ad>("/api/ads", [
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
  safeFetch<Article>("/api/articles?limit=6", [
    {
      id: 1,
      title: "Breaking into the Film Industry: A Beginner's Guide",
      slug: "breaking-into-film-industry",
      excerpt: "Essential tips and strategies for newcomers to the film industry",
      featured_image_url: "/bustling-film-set.png",
      author_name: "Industry Expert",
    },
    {
      id: 2,
      title: "The Art of Method Acting: Techniques and Tips",
      slug: "method-acting-techniques",
      excerpt: "Explore the world of method acting and how to master this powerful technique",
      featured_image_url: "/confident-actress.png",
      author_name: "Acting Coach",
    },
  ])

const getVideos = () =>
  safeFetch<Video>("/api/videos?featured=true", [
    {
      id: 1,
      title: "Acting Masterclass: Emotional Range",
      description: "Learn how to expand your emotional range as an actor",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail_url: "/confident-actress.png",
    },
  ])

export default async function Home() {
  console.log("[Home] Starting home page render...")
  console.log("[Home] Environment:", process.env.NODE_ENV)
  console.log("[Home] Vercel URL:", process.env.VERCEL_URL)

  const [banners, ads, articles, videos] = await Promise.all([getBanners(), getAds(), getArticles(), getVideos()])

  console.log("[Home] Data fetched successfully:", {
    banners: banners.length,
    ads: ads.length,
    articles: articles.length,
    videos: videos.length,
  })

  return (
    <div className="flex flex-col min-h-screen">
      {/* Debug Info - Show when no data is loaded */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-100 border-b border-yellow-200 p-4 text-sm">
          <div className="container px-4 md:px-6">
            <strong>🔧 Debug Info:</strong> Banners: {banners.length}, Ads: {ads.length}, Articles: {articles.length},
            Videos: {videos.length}
            <br />
            <strong>Environment:</strong> {process.env.NODE_ENV} | <strong>Base URL:</strong>{" "}
            {process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "localhost:3000"}
            <br />
            <strong>Supabase:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Connected" : "❌ Missing URL"}
          </div>
        </div>
      )}

      {/* Banner Carousel */}
      <BannerCarousel banners={banners} />

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
      <AdsScroller ads={ads} />

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-3xl font-bold text-center text-primary">Browse by Category</h2>
          <CategoryGrid />
        </div>
      </section>

      {/* Featured Professionals Section - THIS IS THE KEY SECTION */}
      <FeaturedActors />

      {/* Articles & News Section */}
      <ArticlesSection articles={articles} />

      {/* Video Showcase Section */}
      <VideoShowcase videos={videos} />
    </div>
  )
}
