"use server"

import { put } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

// Use service role key to bypass RLS for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function uploadMediaAction(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const tags = formData.get("tags") as string
    const isFeatured = formData.get("isFeatured") === "true"

    if (!file || !userId) {
      throw new Error("File and user ID are required")
    }

    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("File upload service not configured. Please contact administrator to set up BLOB_READ_WRITE_TOKEN environment variable.")
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin"
    const fileName = `media/${userId}/${timestamp}-${randomId}.${fileExt}`

    // Upload to Vercel Blob using server-side put
    const blob = await put(fileName, file, {
      access: "public",
    })

    // Generate thumbnail for videos (simplified for server)
    let thumbnailUrl = null
    if (file.type.startsWith("video/")) {
      // For now, we'll skip thumbnail generation on server
      // You can implement this later with a separate service
      thumbnailUrl = null
    }

    // Save to database
    const mediaRecord = {
      user_id: userId,
      title: title || file.name.replace(/\.[^/.]+$/, ""),
      description: description || "",
      media_type: file.type.startsWith("image/") ? "image" : "video",
      file_url: blob.url,
      blob_url: blob.url,
      thumbnail_url: thumbnailUrl,
      file_size: file.size,
      mime_type: file.type,
      is_profile_picture: false,
      is_featured: isFeatured,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    }

    const { data, error } = await supabase.from("user_media").insert(mediaRecord).select().single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    revalidatePath("/profile")
    return { success: true, data }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    }
  }
}
