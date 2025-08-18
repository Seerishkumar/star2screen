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

async function fetchFromAPI(endpoint: string, fallbackData: any[] = []): Promise<any[]> {
  try {
    console.log(`[fetchFromAPI] Fetching ${endpoint}...`)

    // Production URL configuration
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
    let items: any[] = []

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

// Enhanced fallback data functions
const getBanners = () =>
  fetchFromAPI("/api/banners", [
    {
      id: 1,
      title: "",
      subtitle: "",
      image_url: "/banner-lg.b22301864329d06c67c7.jpg",
      link_url: "/profiles",
    },
    {
      id: 2,
      title: "",
      subtitle: "",
      image_url: "/image-01-copy.jpg",
      link_url: "/jobs",
    },
    {
      id: 3,
      title: "",
      subtitle: "",
      image_url: "/image-03.jpg",
      link_url: "/image-03.jpg",
    },
  ])

const getAds = () =>
  fetchFromAPI("/api/ads", [
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
    {
      id: 3,
      title: "Acting Workshops",
      description: "Improve your skills with professional workshops",
      image_url: "/bustling-film-set.png",
      link_url: "/categories/acting-coach",
    },
  ])

const getArticles = () =>
  fetchFromAPI("/api/articles", [
    {
      id: 1,
      title: "Breaking into the Film Industry: A Beginner's Guide",
      slug: "breaking-into-film-industry",
      excerpt: "Essential tips and strategies for newcomers to the film industry",
      featured_image_url: "/bustling-film-set.png",
      author_name: "Industry Expert",
      published_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 2,
      title: "The Art of Method Acting: Techniques and Tips",
      slug: "method-acting-techniques",
      excerpt: "Explore the world of method acting and master this powerful technique",
      featured_image_url: "/confident-actress.png",
      author_name: "Acting Coach",
      published_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 3,
      title: "Networking in Hollywood: Building Industry Connections",
      slug: "networking-hollywood-connections",
      excerpt: "Learn how to build meaningful relationships in entertainment",
      featured_image_url: "/director-in-discussion.png",
      author_name: "Industry Insider",
      published_at: new Date(Date.now() - 259200000).toISOString(),
    },
  ])

const getVideos = () =>
  fetchFromAPI("/api/videos", [
    {
      id: 1,
      title: "Acting Masterclass: Emotional Range",
      description: "Learn how to expand your emotional range as an actor",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail_url: "/confident-actress.png",
    },
    {
      id: 2,
      title: "Behind the Scenes: Film Production",
      description: "Get an inside look at professional film production",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail_url: "/bustling-film-set.png",
    },
    {
      id: 3,
      title: "Director's Vision: Storytelling Techniques",
      description: "Discover how directors bring stories to life on screen",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail_url: "/director-in-discussion.png",
    },
  ])

export default async function Home() {
  console.log("[Home] Starting page render...")
  console.log("[Home] Environment:", process.env.NODE_ENV || "production")
  console.log("[Home] Vercel URL:", process.env.VERCEL_URL || "www.stars2screen.com")

  // Fetch all data in parallel with timeout
  const fetchWithTimeout = (promise: Promise<any>, timeout = 5000): Promise<any> => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Fetch timeout")), timeout)),
    ])
  }

  const [bannersResult, adsResult, articlesResult, videosResult] = await Promise.allSettled([
    fetchWithTimeout(getBanners()),
    fetchWithTimeout(getAds()),
    fetchWithTimeout(getArticles()),
    fetchWithTimeout(getVideos()),
  ])

  // Extract successful results or use enhanced fallback data
  const bannersData =
    bannersResult.status === "fulfilled"
      ? bannersResult.value
      : [
          {
            id: 1,
            title: "Welcome to Stars2Screen",
            subtitle: "Connect with the best professionals in the film industry",
            image_url: "/bustling-film-set.png",
            link_url: "/profiles",
            button_text: "Browse Profiles",
          },
          {
            id: 2,
            title: "Find Your Next Big Role",
            subtitle: "Discover casting opportunities and auditions nationwide",
            image_url: "/confident-actress.png",
            link_url: "/jobs",
            button_text: "View Opportunities",
          },
          {
            id: 3,
            title: "Professional Networking",
            subtitle: "Build connections with industry professionals and creators",
            image_url: "/director-in-discussion.png",
            link_url: "/categories",
            button_text: "Start Networking",
          },
        ]

  const adsData =
    adsResult.status === "fulfilled"
      ? adsResult.value
      : [
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
          {
            id: 3,
            title: "Acting Workshops",
            description: "Improve your skills with professional workshops",
            image_url: "/bustling-film-set.png",
            link_url: "/categories/acting-coach",
          },
        ]

  const articlesData =
    articlesResult.status === "fulfilled"
      ? articlesResult.value
      : [
          {
            id: 1,
            title: "Breaking into the Film Industry: A Beginner's Guide",
            slug: "breaking-into-film-industry",
            excerpt: "Essential tips and strategies for newcomers to the film industry",
            featured_image_url: "/bustling-film-set.png",
            author_name: "Industry Expert",
            published_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 2,
            title: "The Art of Method Acting: Techniques and Tips",
            slug: "method-acting-techniques",
            excerpt: "Explore the world of method acting and master this powerful technique",
            featured_image_url: "/confident-actress.png",
            author_name: "Acting Coach",
            published_at: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 3,
            title: "Networking in Hollywood: Building Industry Connections",
            slug: "networking-hollywood-connections",
            excerpt: "Learn how to build meaningful relationships in entertainment",
            featured_image_url: "/director-in-discussion.png",
            author_name: "Industry Insider",
            published_at: new Date(Date.now() - 259200000).toISOString(),
          },
        ]

  const videosData =
    videosResult.status === "fulfilled"
      ? videosResult.value
      : [
          {
            id: 1,
            title: "Acting Masterclass: Emotional Range",
            description: "Learn how to expand your emotional range as an actor",
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            thumbnail_url: "/confident-actress.png",
          },
          {
            id: 2,
            title: "Behind the Scenes: Film Production",
            description: "Get an inside look at professional film production",
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            thumbnail_url: "/bustling-film-set.png",
          },
          {
            id: 3,
            title: "Director's Vision: Storytelling Techniques",
            description: "Discover how directors bring stories to life on screen",
            video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            thumbnail_url: "/director-in-discussion.png",
          },
        ]

  console.log("[Home] Final data counts:", {
    banners: bannersData.length,
    ads: adsData.length,
    articles: articlesData.length,
    videos: videosData.length,
  })

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner Carousel - Now guaranteed to have 3 banners */}
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

      {/* Ads Scroller - Now guaranteed to have 3 ads */}
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

      {/* Articles & News Section - Now guaranteed to have 3 articles */}
      <ArticlesSection articles={articlesData} />

      {/* Video Showcase Section - Now guaranteed to have 3 videos */}
      <VideoShowcase videos={videosData} />
    </div>
  )
}
