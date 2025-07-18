/* ------------------------------------------------------------------ */
/* Minimal shared types – keep in sync with your DB models            */
/* ------------------------------------------------------------------ */
type Banner = { id: number; image_url: string; headline?: string; cta_url?: string }
type Ad = { id: number; image_url: string; title: string; link_url: string }
type Article = { id: number; title: string; slug: string; thumbnail_url?: string; excerpt?: string }
type Video = { id: number; id_youtube?: string; thumbnail_url: string; title: string }

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
        ? "https://your-domain.com" // Replace with your actual domain
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
    <div className="flex flex-col">
      {/* Debug Info - Only show in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-100 p-4 text-sm">
          <strong>Debug Info:</strong> Banners: {banners.length}, Ads: {ads.length}, Articles: {articles.length},
          Videos: {videos.length}
        </div>
      )}

      {/* Banner Carousel */}
      <BannerCarousel banners={banners} />

      {/* Search Section */}
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Find Your Perfect Match</h2>
            <p className="text-muted-foreground">Search for professionals, services, and opportunities</p>
          </div>
          <div className="mx-auto mt-8 max-w-md">
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
          <h2 className="mb-8 text-2xl font-bold text-center text-primary">Browse by Category</h2>
          <CategoryGrid />
        </div>
      </section>

      {/* Featured Professionals Section */}
      <FeaturedActors />

      {/* Articles & News Section */}
      <ArticlesSection articles={articles} />

      {/* Video Showcase Section */}
      <VideoShowcase videos={videos} />
    </div>
  )
}
