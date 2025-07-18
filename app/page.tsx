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
    const res = await fetch(path, { cache: "no-store" })

    if (!res.ok) {
      console.error(`Non-OK response from ${path}:`, res.status)
      return []
    }

    const json = await res.json()
    // the API returns { banners: [...] } / { ads: [...] } / etc.
    const firstKey = Object.keys(json)[0] as keyof typeof json
    return (json[firstKey] as T[]) || []
  } catch (err) {
    console.error(`Error fetching ${path}:`, err)
    return []
  }
}

const getBanners = () => safeFetch<Banner>("/api/banners")
const getAds = () => safeFetch<Ad>("/api/ads")
const getArticles = () => safeFetch<Article>(`/api/articles?limit=6`)
const getVideos = () => safeFetch<Video>(`/api/videos?featured=true`)

export default async function Home() {
  const [banners, ads, articles, videos] = await Promise.all([getBanners(), getAds(), getArticles(), getVideos()])

  return (
    <div className="flex flex-col">
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
