import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchForm } from "@/components/search-form"
import { CategoryGrid } from "@/components/category-grid"
import { StatisticsSection } from "@/components/statistics-section"
import { FeaturedActors } from "@/components/featured-actors"
import { LatestBlogs } from "@/components/latest-blogs"
import { VideoSection } from "@/components/video-section"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-primary py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/hero-pattern.png')] bg-cover bg-center opacity-10"></div>
        </div>
        <div className="container relative px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 md:gap-10">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl xl:text-6xl">
                  Where <span className="text-accent-gold">TALENT</span> meets{" "}
                  <span className="text-accent-gold">OPPORTUNITY</span>
                </h1>
                <p className="max-w-[600px] text-gray-200 md:text-xl">
                  Connect with the best professionals in the film industry. Find talent, services, and opportunities all
                  in one place.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90">
                  <Link href="/register">Join as Professional</Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="text-white border-white hover:bg-white/10">
                  <Link href="/search">Find Talent</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <Image
                src="/hero-illustration.png"
                alt="Film industry professionals"
                width={500}
                height={400}
                className="max-w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Welcome back!</h2>
            <p className="text-muted-foreground">Let's continue your search</p>
          </div>
          <div className="mx-auto mt-8 max-w-md">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <StatisticsSection />

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-2xl font-bold text-center text-primary">Our Categories</h2>
          <CategoryGrid />
        </div>
      </section>

      {/* Featured Actors Section */}
      <FeaturedActors />

      {/* Latest Blogs Section */}
      <LatestBlogs />

      {/* Video Section */}
      <VideoSection />
    </div>
  )
}
