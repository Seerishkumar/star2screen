"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Banner {
  id: number
  title?: string
  subtitle?: string
  image_url: string
  link_url?: string
  button_text?: string
}

interface BannerCarouselProps {
  banners?: Banner[]
}

export function BannerCarousel({ banners = [] }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Filter out any invalid banners and log what we received
  const validBanners = banners.filter((banner) => banner && banner.image_url)

  console.log("[BannerCarousel] Received banners:", banners)
  console.log("[BannerCarousel] Valid banners count:", validBanners.length)

  useEffect(() => {
    if (validBanners.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % validBanners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [validBanners.length])

  if (validBanners.length === 0) {
    console.log("[BannerCarousel] No valid banners, showing default")
    return (
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Stars2Screen</h1>
            <p className="text-xl mb-8">Connect with the best professionals in the film industry</p>
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/profiles">Browse Profiles</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentBanner = validBanners[currentIndex]
  console.log("[BannerCarousel] Displaying banner:", currentBanner)

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + validBanners.length) % validBanners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % validBanners.length)
  }

  return (
    <div className="relative h-96 overflow-hidden">
      {/* Banner Image */}
      <div className="relative h-full">
        <Image
          src={currentBanner.image_url || "/placeholder.svg?height=400&width=800"}
          alt={currentBanner.title || "Banner"}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <div className="text-center max-w-4xl px-4">
          {currentBanner.title && <h1 className="text-4xl md:text-6xl font-bold mb-4">{currentBanner.title}</h1>}
          {currentBanner.subtitle && <p className="text-xl md:text-2xl mb-8">{currentBanner.subtitle}</p>}
          {currentBanner.link_url && (
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
              <Link href={currentBanner.link_url}>{currentBanner.button_text || "Learn More"}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {validBanners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {validBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {validBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
