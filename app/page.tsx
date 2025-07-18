/* ------------------------------------------------------------------ */
/* Minimal shared types – keep in sync with your DB models            */
/* ------------------------------------------------------------------ */
type Banner = {
  id: number
  image_url: string
  title?: string
  subtitle?: string
  link_url?: string
  button_text?: string
}
type Ad = { id: number; image_url: string; title: string; link_url: string; description?: string }
type Article = {
  id: number
  title: string
  slug: string
  featured_image_url?: string
  excerpt?: string
  author_name?: string
}
type Video = { id: number; video_url: string; thumbnail_url: string; title: string; description?: string }

import { SearchForm } from "@/components/search-form"
import { CategoryGrid } from "@/components/category-grid"
import { StatisticsSection } from "@/components/statistics-section"
import { FeaturedActors } from "@/components/featured-actors"
import { BannerCarousel } from "@/components/home/banner-carousel"
import { AdsScroller } from "@/components/home/ads-scroller"
import { ArticlesSection } from "@/components/home/articles-section"
import { VideoShowcase } from "@/components/home/video-showcase"

/* ------------------------------------------------------------------ */
/* Data helpers – use internal routes & swallow errors gracefully     */
/* ------------------------------------------------------------------ */
async function safeFetch<T>(path: string): Promise<T[]> {
  try {
    console.log(`[Home] Fetching ${path}...`)
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://www.stars2screen.com" // Your actual domain
        : "http://localhost:3000"

    const fullUrl = `${baseUrl}${path}`
    console.log(`[Home] Full URL: ${fullUrl}`)

    const res = await fetch(fullUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "NextJS-Server",
      },
    })

    if (!res.ok) {
      console.error(`[Home] Non-OK response from ${path}:`, res.status, res.statusText)
      return []
    }

    const json = await res.json()
    console.log(`[Home] Response from ${path}:`, json)

    // Handle different response formats
    if (Array.isArray(json)) {
      return json as T[]
    }

    // the API returns { banners: [...] } / { ads: [...] } / etc.
    const firstKey = Object.keys(json)[0] as keyof typeof json
    const data = (json[firstKey] as T[]) || []

    console.log(`[Home] Extracted ${data.length} items from ${path}`)
    return data
  } catch (err) {
    console.error(`[Home] Error fetching ${path}:`, err)
    return []
  }
}

const getBanners = () => safeFetch<Banner>("/api/banners")
const getAds = () => safeFetch<Ad>("/api/ads")
const getArticles = () => safeFetch<Article>(`/api/articles?limit=6`)
const getVideos = () => safeFetch<Video>(`/api/videos?featured=true`)

export default async function Home() {
  console.log("[Home] Starting home page data fetch...")
  console.log("[Home] Environment:", process.env.NODE_ENV)
  console.log("[Home] Vercel URL:", process.env.VERCEL_URL)

  const [banners, ads, articles, videos] = await Promise.all([getBanners(), getAds(), getArticles(), getVideos()])

  console.log("[Home] Data fetched:", {
    banners: banners.length,
    ads: ads.length,
    articles: articles.length,
    videos: videos.length,
  })

  return (
    <div className="flex flex-col min-h-screen">
      {/* Debug Info - Only show in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-100 p-4 text-sm border-b">
          <strong>Debug Info:</strong> Banners: {banners.length}, Ads: {ads.length}, Articles: {articles.length},
          Videos: {videos.length}
          <br />
          <strong>Environment:</strong> {process.env.NODE_ENV}
          <br />
          <strong>Base URL:</strong>{" "}
          {process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}
        </div>
      )}

      {/* Banner Carousel */}
      {banners.length > 0 ? (
        <BannerCarousel banners={banners} />
      ) : (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Stars2Screen</h1>
            <p className="text-xl mb-8">Connect with the best professionals in the film industry</p>
          </div>
        </div>
      )}

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
      {ads.length > 0 ? (
        <AdsScroller ads={ads} />
      ) : (
        <section className="py-8 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center text-muted-foreground">
              <p>Featured advertisements will appear here</p>
            </div>
          </div>
        </section>
      )}

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
      {articles.length > 0 ? (
        <ArticlesSection articles={articles} />
      ) : (
        <section className="py-12 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="mb-8 text-3xl font-bold text-center text-primary">Latest Articles & News</h2>
            <div className="text-center text-muted-foreground">
              <p>Latest industry articles and news will appear here</p>
            </div>
          </div>
        </section>
      )}

      {/* Video Showcase Section */}
      {videos.length > 0 ? (
        <VideoShowcase videos={videos} />
      ) : (
        <section className="py-12 bg-gray-50">
          <div className="container px-4 md:px-6">
            <h2 className="mb-8 text-3xl font-bold text-center text-primary">Featured Videos</h2>
            <div className="text-center text-muted-foreground">
              <p>Featured industry videos will appear here</p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
