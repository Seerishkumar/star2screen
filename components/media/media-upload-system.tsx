"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, ImageIcon, Video, Camera, X, Star, Loader2, Plus, Trash2 } from "lucide-react"

interface MediaFile {
  id?: string
  title: string
  description: string
  media_type: "image" | "video" | "audio" | "document"
  file_url: string
  thumbnail_url?: string
  file_size: number
  mime_type: string
  is_profile_picture: boolean
  is_featured: boolean
  tags: string[]
  created_at?: string
}

export function MediaUploadSystem() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("upload")
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  // Form data for media upload
  const [mediaData, setMediaData] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    is_featured: false,
  })

  const [newTag, setNewTag] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  // Load existing media files
  const loadMediaFiles = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("user_media")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setMediaFiles(data || [])
    } catch (error) {
      console.error("Error loading media files:", error)
    }
  }, [user])

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const validFiles = Array.from(files).filter((file) => {
      const isValidType = file.type.startsWith("image/") || file.type.startsWith("video/")
      const isValidSize = file.size <= 50 * 1024 * 1024 // 50MB limit
      return isValidType && isValidSize
    })

    setSelectedFiles(validFiles)

    // Create preview URLs
    const urls = validFiles.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  // Upload files to Supabase Storage
  const uploadFiles = async () => {
    if (!user || selectedFiles.length === 0) return

    setLoading(true)
    setUploadProgress(0)

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const fileExt = file.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage.from("media").upload(fileName, file)

        if (uploadError) throw uploadError

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(fileName)

        // Create thumbnail for videos (placeholder for now)
        let thumbnailUrl = null
        if (file.type.startsWith("video/")) {
          thumbnailUrl = "/placeholder.svg?height=200&width=300"
        }

        // Save to database
        const mediaRecord = {
          user_id: user.id,
          title: mediaData.title || file.name,
          description: mediaData.description,
          media_type: file.type.startsWith("image/") ? ("image" as const) : ("video" as const),
          file_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          file_size: file.size,
          mime_type: file.type,
          is_profile_picture: false,
          is_featured: mediaData.is_featured,
          tags: mediaData.tags,
        }

        const { data, error } = await supabase.from("user_media").insert(mediaRecord).select().single()

        if (error) throw error
        return data

        // Update progress
        setUploadProgress(((index + 1) / selectedFiles.length) * 100)
      })

      const results = await Promise.all(uploadPromises)
      setMediaFiles((prev) => [...results, ...prev])

      // Reset form
      setSelectedFiles([])
      setPreviewUrls([])
      setMediaData({ title: "", description: "", tags: [], is_featured: false })

      alert("Files uploaded successfully!")
    } catch (error) {
      console.error("Error uploading files:", error)
      alert("Failed to upload files")
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  // Set as profile picture
  const setAsProfilePicture = async (mediaId: string) => {
    if (!user) return

    try {
      // Remove current profile picture flag
      await supabase
        .from("user_media")
        .update({ is_profile_picture: false })
        .eq("user_id", user.id)
        .eq("is_profile_picture", true)

      // Set new profile picture
      const { error } = await supabase.from("user_media").update({ is_profile_picture: true }).eq("id", mediaId)

      if (error) throw error

      // Update local state
      setMediaFiles((prev) =>
        prev.map((file) => ({
          ...file,
          is_profile_picture: file.id === mediaId,
        })),
      )

      alert("Profile picture updated!")
    } catch (error) {
      console.error("Error setting profile picture:", error)
      alert("Failed to update profile picture")
    }
  }

  // Toggle featured status
  const toggleFeatured = async (mediaId: string) => {
    try {
      const media = mediaFiles.find((m) => m.id === mediaId)
      if (!media) return

      const { error } = await supabase.from("user_media").update({ is_featured: !media.is_featured }).eq("id", mediaId)

      if (error) throw error

      setMediaFiles((prev) =>
        prev.map((file) => (file.id === mediaId ? { ...file, is_featured: !file.is_featured } : file)),
      )
    } catch (error) {
      console.error("Error toggling featured:", error)
    }
  }

  // Delete media file
  const deleteMedia = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return

    try {
      const media = mediaFiles.find((m) => m.id === mediaId)
      if (!media) return

      // Delete from storage
      const fileName = media.file_url.split("/").pop()
      if (fileName) {
        await supabase.storage.from("media").remove([`${user?.id}/${fileName}`])
      }

      // Delete from database
      const { error } = await supabase.from("user_media").delete().eq("id", mediaId)

      if (error) throw error

      setMediaFiles((prev) => prev.filter((file) => file.id !== mediaId))
      alert("Media deleted successfully!")
    } catch (error) {
      console.error("Error deleting media:", error)
      alert("Failed to delete media")
    }
  }

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !mediaData.tags.includes(newTag.trim())) {
      setMediaData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setMediaData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Portfolio & Media</h1>
        <p className="text-muted-foreground">Showcase your work with high-quality images and videos</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Media</TabsTrigger>
          <TabsTrigger value="gallery">My Gallery</TabsTrigger>
          <TabsTrigger value="profile-pic">Profile Picture</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex space-x-4">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Drag and drop your files here</p>
                    <p className="text-muted-foreground">or click to browse</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Supports: JPG, PNG, MP4, MOV</p>
                    <p>Max size: 50MB per file</p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* File Previews */}
              {selectedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Selected Files ({selectedFiles.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          {file.type.startsWith("image/") ? (
                            <img
                              src={previewUrls[index] || "/placeholder.svg"}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const newFiles = selectedFiles.filter((_, i) => i !== index)
                            const newUrls = previewUrls.filter((_, i) => i !== index)
                            setSelectedFiles(newFiles)
                            setPreviewUrls(newUrls)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="text-xs truncate mt-1">{file.name}</p>
                      </div>
                    ))}
                  </div>

                  {/* Media Details Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={mediaData.title}
                        onChange={(e) => setMediaData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Portfolio piece title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {mediaData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add tag (e.g., headshot, action, drama)"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        />
                        <Button onClick={addTag} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={mediaData.description}
                      onChange={(e) => setMediaData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this media piece..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={mediaData.is_featured}
                      onChange={(e) => setMediaData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                    />
                    <Label htmlFor="featured">Feature this media (show prominently on profile)</Label>
                  </div>

                  {/* Upload Progress */}
                  {loading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  <Button onClick={uploadFiles} disabled={loading || selectedFiles.length === 0} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Media Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              {mediaFiles.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No media uploaded yet</p>
                  <Button onClick={() => setActiveTab("upload")}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Your First Media
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaFiles.map((media) => (
                    <div key={media.id} className="group relative">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        {media.media_type === "image" ? (
                          <img
                            src={media.file_url || "/placeholder.svg"}
                            alt={media.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black">
                            <Video className="h-8 w-8 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Media Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => toggleFeatured(media.id!)}>
                          <Star className={`h-4 w-4 ${media.is_featured ? "fill-yellow-400 text-yellow-400" : ""}`} />
                        </Button>

                        {media.media_type === "image" && (
                          <Button size="sm" variant="secondary" onClick={() => setAsProfilePicture(media.id!)}>
                            <Camera className="h-4 w-4" />
                          </Button>
                        )}

                        <Button size="sm" variant="destructive" onClick={() => deleteMedia(media.id!)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Media Info */}
                      <div className="mt-2">
                        <p className="text-sm font-medium truncate">{media.title}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{media.media_type}</span>
                          <div className="flex items-center space-x-1">
                            {media.is_featured && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                            {media.is_profile_picture && <Camera className="h-3 w-3" />}
                          </div>
                        </div>
                        {media.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {media.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {media.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{media.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile-pic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                {/* Current Profile Picture */}
                <div className="relative">
                  <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary">
                    {mediaFiles.find((m) => m.is_profile_picture) ? (
                      <img
                        src={mediaFiles.find((m) => m.is_profile_picture)?.file_url || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose from your uploaded images to set as profile picture
                  </p>

                  {/* Available Images */}
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {mediaFiles
                      .filter((m) => m.media_type === "image")
                      .map((media) => (
                        <button
                          key={media.id}
                          onClick={() => setAsProfilePicture(media.id!)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                            media.is_profile_picture
                              ? "border-primary"
                              : "border-transparent hover:border-muted-foreground"
                          }`}
                        >
                          <img
                            src={media.file_url || "/placeholder.svg"}
                            alt={media.title}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                  </div>

                  {mediaFiles.filter((m) => m.media_type === "image").length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No images available for profile picture</p>
                      <Button onClick={() => setActiveTab("upload")}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Images
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
