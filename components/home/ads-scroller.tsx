"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Ad {
  id: number
  title: string
  description?: string
  image_url: string
  link_url: string
}

interface AdsScrollerProps {
  ads?: Ad[]
}

export function AdsScroller({ ads = [] }: AdsScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const validAds = ads.filter((ad) => ad && ad.image_url && ad.title)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  if (validAds.length === 0) {
    return null
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Featured Services</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={scrollLeft}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={scrollRight}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {validAds.map((ad) => (
            <Link key={ad.id} href={ad.link_url} className="flex-shrink-0">
              <Card className="w-80 hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={ad.image_url || "/placeholder.svg?height=200&width=320"}
                    alt={ad.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{ad.title}</h3>
                  {ad.description && <p className="text-muted-foreground text-sm line-clamp-2">{ad.description}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
