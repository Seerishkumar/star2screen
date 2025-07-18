"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Trash2, Play, X, Download } from "lucide-react"

export function MediaGallery({ userId }) {
  const [activeTab, setActiveTab] = useState("images")
  const [media, setMedia] = useState({ images: [], videos: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:5000/api/media", {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Separate images and videos
      const images = res.data.filter((item) => item.type === "image")
      const videos = res.data.filter((item) => item.type === "video")

      setMedia({ images, videos })
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load media")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMedia = async (id) => {
    if (!window.confirm("Are you sure you want to delete this media? This action cannot be undone.")) {
      return
    }

    setDeleteLoading(true)

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:5000/api/media/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update the media state after deletion
      if (activeTab === "images") {
        setMedia({
          ...media,
          images: media.images.filter((img) => img.id !== id),
        })
      } else {
        setMedia({
          ...media,
          videos: media.videos.filter((vid) => vid.id !== id),
        })
      }

      // Close the dialog if the deleted item was being viewed
      if (selectedMedia && selectedMedia.id === id) {
        setSelectedMedia(null)
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete media")
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500 text-center">{error}</p>
          <Button onClick={fetchMedia} className="mx-auto mt-4 block">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="images">Images ({media.images.length})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({media.videos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="images">
            {media.images.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">No images uploaded yet</p>
                <Button onClick={() => document.getElementById("upload-tab-trigger").click()}>Upload Images</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.images.map((image) => (
                  <div key={image.id} className="group relative">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div
                          className="cursor-pointer overflow-hidden rounded-md"
                          onClick={() => setSelectedMedia(image)}
                        >
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.title || "Image"}
                            className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{image.title || "Image"}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.title || "Image"}
                            className="w-full h-auto max-h-[70vh] object-contain rounded-md"
                          />
                          {image.description && (
                            <p className="mt-4 text-sm text-muted-foreground">{image.description}</p>
                          )}
                          <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" asChild>
                              <a href={image.url} download target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </a>
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteMedia(image.id)}
                              disabled={deleteLoading}
                            >
                              {deleteLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMedia(image.id)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <p className="text-xs truncate mt-1">{image.title || "Untitled"}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos">
            {media.videos.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">No videos uploaded yet</p>
                <Button onClick={() => document.getElementById("upload-tab-trigger").click()}>Upload Videos</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.videos.map((video) => (
                  <div key={video.id} className="group relative">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div
                          className="cursor-pointer overflow-hidden rounded-md relative"
                          onClick={() => setSelectedMedia(video)}
                        >
                          <div className="h-40 w-full bg-gray-900">
                            {/* Video thumbnail would go here */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="rounded-full bg-white/80 p-3">
                                <Play className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{video.title || "Video"}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <video src={video.url} controls className="w-full h-auto max-h-[70vh] rounded-md" />
                          {video.description && (
                            <p className="mt-4 text-sm text-muted-foreground">{video.description}</p>
                          )}
                          <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" asChild>
                              <a href={video.url} download target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </a>
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteMedia(video.id)}
                              disabled={deleteLoading}
                            >
                              {deleteLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMedia(video.id)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <p className="text-xs truncate mt-1">{video.title || "Untitled"}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
