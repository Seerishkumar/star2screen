"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Play, Eye, Clock } from "lucide-react"

interface Video {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  category: string | null
  duration: number | null
  view_count: number
}

interface VideoShowcaseProps {
  videos: Video[]
}

export function VideoShowcase({ videos }: VideoShowcaseProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  if (videos.length === 0) {
    return null
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-primary">Featured Videos</h2>
          <Button variant="outline">View All Videos</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 group cursor-pointer">
                <Image
                  src={video.thumbnail_url || "/placeholder.svg"}
                  alt={video.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" className="rounded-full w-16 h-16 p-0" onClick={() => setSelectedVideo(video)}>
                        <Play className="h-6 w-6 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full">
                      <div className="aspect-video">
                        <iframe
                          src={video.video_url}
                          title={video.title}
                          className="w-full h-full rounded"
                          allowFullScreen
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {video.category && (
                  <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
                    {video.category}
                  </Badge>
                )}
                {video.duration && (
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(video.duration)}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
                {video.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{video.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {video.view_count.toLocaleString()} views
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
