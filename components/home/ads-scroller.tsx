"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

interface Ad {
  id: string
  title: string
  description: string | null
  image_url: string
  link_url: string | null
  category: string | null
  is_active: boolean
}

interface AdsScrollerProps {
  ads: Ad[]
}

export function AdsScroller({ ads }: AdsScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

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

  if (ads.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-primary">Featured Promotions</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollLeft}
              className="h-8 w-8 p-0 border-primary text-primary bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollRight}
              className="h-8 w-8 p-0 border-primary text-primary bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {ads.map((ad) => (
            <Card key={ad.id} className="flex-shrink-0 w-80 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={ad.image_url || "/placeholder.svg?height=200&width=320"}
                  alt={ad.title}
                  fill
                  className="object-cover"
                  sizes="320px"
                />
                {ad.category && (
                  <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground capitalize">
                    {ad.category}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{ad.title}</h3>
                {ad.description && <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{ad.description}</p>}
                {ad.link_url && (
                  <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                    <Link href={ad.link_url} className="flex items-center gap-2">
                      Learn More
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
