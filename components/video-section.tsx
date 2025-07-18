"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, X } from "lucide-react"
import Image from "next/image"

export function VideoSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-primary">See How Stars2Screen Works</h2>
          <p className="mb-8 text-muted-foreground">
            Watch our introduction video to learn how to connect with film industry professionals
          </p>

          <div className="relative">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
              <Image src="/bustling-film-set.png" alt="Video thumbnail" fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Button
                  size="lg"
                  onClick={() => setIsVideoOpen(true)}
                  className="h-16 w-16 rounded-full bg-white/90 p-0 text-primary hover:bg-white"
                >
                  <Play className="h-6 w-6 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative mx-4 w-full max-w-4xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVideoOpen(false)}
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="aspect-video overflow-hidden rounded-lg bg-black">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Stars2Screen Introduction"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
