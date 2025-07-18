"use client"

import { useState, useRef } from "react"
import axios from "axios"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Upload, Camera } from "lucide-react"

export function ProfileImageUploader({ currentImage, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a JPG, PNG, or WEBP image.")
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size too large. Maximum size is 2MB.")
      return
    }

    setSelectedFile(file)
    setPreview("/placeholder.svg?height=160&width=160")
    setError("")
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image to upload")
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("profileImage", selectedFile)

      await axios.post("http://localhost:5000/api/profile/image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setLoading(false)
      onSuccess("/placeholder.svg?height=128&width=128")
      setIsOpen(false)

      // Clean up
      setSelectedFile(null)
      setPreview(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload profile image")
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-primary">
            <Image
              src={currentImage || "/placeholder.svg?height=128&width=128&query=profile"}
              alt="Profile"
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <Camera className="h-8 w-8 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <p className="text-red-500 text-center">{error}</p>}

          <div className="flex justify-center">
            <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-primary">
              <Image
                src={preview || currentImage || "/placeholder.svg?height=160&width=160&query=profile"}
                alt="Profile Preview"
                width={160}
                height={160}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="profile-image-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="profile-image-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Select Image
              </label>
            </Button>
            <p className="text-xs text-muted-foreground">
              Recommended: Square image, at least 300x300 pixels. Max size: 2MB.
            </p>
            <Button onClick={handleUpload} disabled={!selectedFile || loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Profile Picture"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
