"use client"

import React from "react"
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
import {
  Upload,
  ImageIcon,
  Video,
  Camera,
  X,
  Star,
  Loader2,
  Plus,
  Trash2,
  Play,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MediaFile {
  id?: string
  title: string
  description: string
  media_type: "image" | "video"
  file_url: string
  blob_url: string
  thumbnail_url?: string
  file_size: number
  mime_type: string
  is_profile_picture: boolean
  is_featured: boolean
  tags: string[]
  created_at?: string
}

interface UploadStatus {
  file: File
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  error?: string
  result?: MediaFile
}

export function BlobMediaUpload() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("upload")
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadLimits, setUploadLimits] = useState({ images: 0, videos: 0 })

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

  // Load existing media files and check limits
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

      // Calculate current upload counts
      const imageCount = data?.filter((m) => m.media_type === "image").length || 0
      const videoCount = data?.filter((m) => m.media_type === "video").length || 0
      setUploadLimits({ images: imageCount, videos: videoCount })
    } catch (error) {
      console.error("Error loading media files:", error)
      setError("Failed to load media files")
    }
  }, [user])

  // Load media files on component mount
  React.useEffect(() => {
    loadMediaFiles()
  }, [loadMediaFiles])

  // Validate file and check limits
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    const validVideoTypes = ["video/mp4", "video/mov", "video/webm", "video/avi", "video/quicktime"]
    const validTypes = [...validImageTypes, ...validVideoTypes]

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Please upload images (JPG, PNG, GIF, WebP) or videos (MP4, MOV, WebM).`,
      }
    }

    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum size is 50MB.`,
      }
    }

    // Check upload limits
    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")

    const currentImageCount = uploadLimits.images + selectedFiles.filter((f) => f.type.startsWith("image/")).length
    const currentVideoCount = uploadLimits.videos + selectedFiles.filter((f) => f.type.startsWith("video/")).length

    if (isImage && currentImageCount >= 10) {
      return {
        valid: false,
        error: "Upload limit reached: You can upload maximum 10 images in basic plan",
      }
    }

    if (isVideo && currentVideoCount >= 4) {
      return {
        valid: false,
        error: "Upload limit reached: You can upload maximum 4 videos in basic plan",
      }
    }

    return { valid: true }
  }

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    setError(null)
    const validFiles: File[] = []
    const newPreviewUrls: string[] = []
    let hasErrors = false

    Array.from(files).forEach((file) => {
      const validation = validateFile(file)
      if (validation.valid) {
        validFiles.push(file)
        newPreviewUrls.push(URL.createObjectURL(file))
      } else {
        setError(validation.error || "File validation failed")
        hasErrors = true
      }
    })

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles])
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls])

      // Initialize upload statuses
      const newStatuses: UploadStatus[] = validFiles.map((file) => ({
        file,
        status: "pending",
        progress: 0,
      }))
      setUploadStatuses((prev) => [...prev, ...newStatuses])
    }

    if (hasErrors && validFiles.length > 0) {
      setTimeout(() => setError(null), 5000) // Clear error after 5 seconds if some files were valid
    }
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

  // Upload single file
  const uploadSingleFile = async (file: File, index: number): Promise<MediaFile | null> => {
    try {
      // Update status to uploading
      setUploadStatuses((prev) =>
        prev.map((status, i) => (i === index ? { ...status, status: "uploading", progress: 0 } : status)),
      )

      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", user!.id)
      formData.append("title", mediaData.title)
      formData.append("description", mediaData.description)
      formData.append("tags", mediaData.tags.join(","))
      formData.append("isFeatured", mediaData.is_featured.toString())

      console.log(`Starting upload for: ${file.name}`)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Upload failed")
      }

      // Update status to success
      setUploadStatuses((prev) =>
        prev.map((status, i) =>
          i === index ? { ...status, status: "success", progress: 100, result: result.data } : status,
        ),
      )

      console.log(`Upload successful for: ${file.name}`)
      return result.data
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error)

      // Update status to error
      setUploadStatuses((prev) =>
        prev.map((status, i) =>
          i === index
            ? {
                ...status,
                status: "error",
                progress: 0,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : status,
        ),
      )

      return null
    }
  }

  // Upload all files (sequential to avoid overwhelming the server)
  const uploadFiles = async () => {
    if (!user || selectedFiles.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      console.log(`Starting upload of ${selectedFiles.length} files...`)

      const results: (MediaFile | null)[] = []

      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < selectedFiles.length; i++) {
        const result = await uploadSingleFile(selectedFiles[i], i)
        results.push(result)
      }

      // Filter successful uploads
      const successfulUploads = results.filter((result): result is MediaFile => result !== null)

      if (successfulUploads.length > 0) {
        // Update media files list
        setMediaFiles((prev) => [...successfulUploads, ...prev])

        // Update upload limits
        const newImageCount = successfulUploads.filter((m) => m.media_type === "image").length
        const newVideoCount = successfulUploads.filter((m) => m.media_type === "video").length
        setUploadLimits((prev) => ({
          images: prev.images + newImageCount,
          videos: prev.videos + newVideoCount,
        }))

        // Reset form
        setSelectedFiles([])
        setPreviewUrls([])
        setUploadStatuses([])
        setMediaData({ title: "", description: "", tags: [], is_featured: false })

        const successCount = successfulUploads.length
        const totalCount = selectedFiles.length

        if (successCount === totalCount) {
          alert(`✅ Successfully uploaded all ${successCount} file(s)!`)
        } else {
          alert(`⚠️ Uploaded ${successCount} out of ${totalCount} files. Some uploads failed.`)
        }
      } else {
        setError("All uploads failed. Please try again.")
      }
    } catch (error) {
      console.error("Batch upload error:", error)
      setError(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)
    const newStatuses = uploadStatuses.filter((_, i) => i !== index)

    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrls[index])

    setSelectedFiles(newFiles)
    setPreviewUrls(newUrls)
    setUploadStatuses(newStatuses)
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

  // Delete blob via API
  const deleteBlob = async (url: string) => {
    try {
      const response = await fetch("/api/blob-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (e) {
      console.error("Failed to delete blob:", e)
    }
  }

  // Delete media file
  const deleteMedia = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return

    try {
      const media = mediaFiles.find((m) => m.id === mediaId)
      if (!media) return

      // Delete from Vercel Blob
      if (media.blob_url) {
        await deleteBlob(media.blob_url)
      }

      // Delete thumbnail if exists
      if (media.thumbnail_url && media.thumbnail_url.includes("blob.vercel-storage.com")) {
        await deleteBlob(media.thumbnail_url)
      }

      // Delete from database
      const { error } = await supabase.from("user_media").delete().eq("id", mediaId)

      if (error) throw error

      // Update upload limits
      setUploadLimits((prev) => ({
        images: media.media_type === "image" ? prev.images - 1 : prev.images,
        videos: media.media_type === "video" ? prev.videos - 1 : prev.videos,
      }))

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

  // Calculate overall progress
  const overallProgress =
    uploadStatuses.length > 0
      ? uploadStatuses.reduce((sum, status) => sum + status.progress, 0) / uploadStatuses.length
      : 0

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Portfolio & Media</h1>
        <p className="text-muted-foreground">Upload images and videos to showcase your work</p>
      </div>

      {/* Upload Limits Info */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Basic Plan Limits:</strong> Images: {uploadLimits.images}/10 • Videos: {uploadLimits.videos}/4 • Max
          file size: 50MB
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Media</TabsTrigger>
          <TabsTrigger value="gallery">My Gallery ({mediaFiles.length})</TabsTrigger>
          <TabsTrigger value="profile-pic">Profile Picture</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Multiple Files</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select multiple images and videos at once. Files upload one by one for reliability.
              </p>
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
                    <p className="text-lg font-medium">Drag and drop multiple files here</p>
                    <p className="text-muted-foreground">or click to browse and select multiple files</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Supports: JPG, PNG, GIF, WebP, MP4, MOV, WebM</p>
                    <p>Max size: 50MB per file</p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Multiple Files
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

              {/* File Previews with Upload Status */}
              {selectedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Selected Files ({selectedFiles.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedFiles.map((file, index) => {
                      const status = uploadStatuses[index]
                      return (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            {file.type.startsWith("image/") ? (
                              <img
                                src={previewUrls[index] || "/placeholder.svg"}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-black">
                                <Video className="h-8 w-8 text-white" />
                              </div>
                            )}

                            {/* Upload Status Overlay */}
                            {status && status.status !== "pending" && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                {status.status === "uploading" && (
                                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                                )}
                                {status.status === "success" && <CheckCircle className="h-8 w-8 text-green-400" />}
                                {status.status === "error" && <AlertCircle className="h-8 w-8 text-red-400" />}
                              </div>
                            )}
                          </div>

                          {!isUploading && (
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeSelectedFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}

                          <div className="mt-2">
                            <p className="text-xs truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                            {status && status.status === "error" && (
                              <p className="text-xs text-red-500 truncate">{status.error}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Media Details Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title (optional - applies to all files)</Label>
                      <Input
                        id="title"
                        value={mediaData.title}
                        onChange={(e) => setMediaData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Portfolio piece title"
                        disabled={isUploading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tags (applies to all files)</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {mediaData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeTag(tag)}
                              disabled={isUploading}
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
                          disabled={isUploading}
                        />
                        <Button onClick={addTag} size="sm" disabled={isUploading}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional - applies to all files)</Label>
                    <Textarea
                      id="description"
                      value={mediaData.description}
                      onChange={(e) => setMediaData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe these media pieces..."
                      rows={3}
                      disabled={isUploading}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={mediaData.is_featured}
                      onChange={(e) => setMediaData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                      disabled={isUploading}
                    />
                    <Label htmlFor="featured">Feature all uploaded media (show prominently on profile)</Label>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading {selectedFiles.length} files...</span>
                        <span>{Math.round(overallProgress)}%</span>
                      </div>
                      <Progress value={overallProgress} />
                      <p className="text-xs text-muted-foreground">Files upload one by one for reliability</p>
                    </div>
                  )}

                  <Button
                    onClick={uploadFiles}
                    disabled={isUploading || selectedFiles.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading {selectedFiles.length} files...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? "s" : ""} to Gallery
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
                          <div className="relative w-full h-full">
                            <div className="w-full h-full flex items-center justify-center bg-black">
                              <Video className="h-8 w-8 text-white" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-8 w-8 text-white opacity-80" />
                            </div>
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
                          <span>{(media.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
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
