"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { useState } from "react"

interface Video {
  id: number
  title: string
  description?: string
  video_url: string
  thumbnail_url: string
}

interface VideoShowcaseProps {
  videos?: Video[]
}

export function VideoShowcase({ videos = [] }: VideoShowcaseProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  const validVideos = videos.filter((video) => video && video.title && video.video_url && video.thumbnail_url)

  if (validVideos.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">Featured Videos</h2>
          <p className="text-muted-foreground">Watch industry insights and tutorials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validVideos.slice(0, 6).map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative h-48 group" onClick={() => setSelectedVideo(video)}>
                <Image
                  src={video.thumbnail_url || "/placeholder.svg?height=200&width=400"}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="lg" className="rounded-full">
                    <Play className="h-6 w-6 mr-2" />
                    Play Video
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
                {video.description && <p className="text-muted-foreground text-sm line-clamp-2">{video.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
                <Button variant="ghost" onClick={() => setSelectedVideo(null)}>
                  ×
                </Button>
              </div>
              <div className="aspect-video">
                <iframe
                  src={selectedVideo.video_url}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
