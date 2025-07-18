"use client"

import { useState, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload, ImageIcon, Film, X } from "lucide-react"

export function MediaUploader({ userId, onSuccess }) {
  const [activeTab, setActiveTab] = useState("image")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [preview, setPreview] = useState([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate file types
    const validTypes =
      activeTab === "image"
        ? ["image/jpeg", "image/png", "image/jpg", "image/webp"]
        : ["video/mp4", "video/quicktime", "video/x-msvideo"]

    const invalidFiles = files.filter((file) => !validTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      setError(`Invalid file type(s). Please upload only ${activeTab === "image" ? "images" : "videos"}.`)
      return
    }

    setSelectedFiles(files)

    // Create preview URLs safely
    const newPreviews = files.map((file) => ({
      file: file,
      name: file.name,
      type: file.type,
    }))

    setPreview(newPreviews)
    setError("")
  }

  const removeFile = (index) => {
    const newFiles = [...selectedFiles]
    const newPreviews = [...preview]

    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)

    setSelectedFiles(newFiles)
    setPreview(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedFiles.length === 0) {
      setError("Please select at least one file to upload")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()

      selectedFiles.forEach((file) => {
        formData.append("files", file)
      })

      formData.append("title", title)
      formData.append("description", description)
      formData.append("type", activeTab)

      await axios.post("http://localhost:5000/api/media/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setSuccess("Files uploaded successfully!")
      setSelectedFiles([])
      setPreview([])
      setTitle("")
      setDescription("")

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload files")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Media</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            setSelectedFiles([])
            setPreview([])
            if (fileInputRef.current) {
              fileInputRef.current.value = ""
            }
          }}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="image">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <ImageIcon className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-2">Drag and drop image files here or click to browse</p>
                <p className="text-sm text-muted-foreground mb-4">Supports: JPG, PNG, WEBP (Max 5MB each)</p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <Button asChild>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Select Images
                  </Label>
                </Button>
              </div>

              {preview.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Selected Images ({preview.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {preview.map((item, index) => (
                      <div key={index} className="relative group">
                        <div className="h-40 w-full bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="text-xs truncate mt-1">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="video">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Film className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-2">Drag and drop video files here or click to browse</p>
                <p className="text-sm text-muted-foreground mb-4">Supports: MP4, MOV, AVI (Max 50MB each)</p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                />
                <Button asChild>
                  <Label htmlFor="video-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Select Videos
                  </Label>
                </Button>
              </div>

              {preview.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Selected Videos ({preview.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {preview.map((item, index) => (
                      <div key={index} className="relative group">
                        <div className="h-40 w-full bg-muted rounded-md flex items-center justify-center">
                          <Film className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="text-xs truncate mt-1">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {preview.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`${activeTab === "image" ? "Image" : "Video"} title`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`Describe your ${activeTab === "image" ? "images" : "videos"}`}
                rows={3}
              />
            </div>

            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {activeTab === "image" ? "Images" : "Videos"}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
