"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  link_url: string | null
  button_text: string | null
  is_active: boolean
  display_order: number
}

interface BannerCarouselProps {
  banners?: Banner[]
}

export function BannerCarousel({ banners = [] }: BannerCarouselProps) {
  // Always work with a real array
  const activeBanners = (banners ?? []).filter((b) => b?.is_active)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (activeBanners.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeBanners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [activeBanners.length])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + activeBanners.length) % activeBanners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % activeBanners.length)
  }

  if (activeBanners.length === 0) {
    return null
  }

  const currentBanner = activeBanners[currentIndex]!

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Banner Image */}
      <div className="absolute inset-0">
        <Image
          src={currentBanner.image_url || "/placeholder.svg?height=600&width=1200"}
          alt={currentBanner.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">{currentBanner.title}</h1>
          {currentBanner.subtitle && (
            <p className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">{currentBanner.subtitle}</p>
          )}
          {currentBanner.link_url && currentBanner.button_text && (
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href={currentBanner.link_url}>{currentBanner.button_text}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white border-0 h-12 w-12 p-0"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white border-0 h-12 w-12 p-0"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
