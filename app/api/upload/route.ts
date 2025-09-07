import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const tags = formData.get("tags") as string
    const isFeatured = formData.get("isFeatured") === "true"

    if (!file || !userId) {
      return NextResponse.json({ error: "File and user ID are required" }, { status: 400 })
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum size is 50MB.`,
        },
        { status: 400 },
      )
    }

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    const validVideoTypes = ["video/mp4", "video/mov", "video/webm", "video/avi", "video/quicktime"]
    const validTypes = [...validImageTypes, ...validVideoTypes]

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Please upload images (JPG, PNG, GIF, WebP) or videos (MP4, MOV, WebM).`,
        },
        { status: 400 },
      )
    }

    // Check user's upload limits
    const { data: existingMedia, error: countError } = await supabase
      .from("user_media")
      .select("media_type")
      .eq("user_id", userId)

    if (countError) {
      console.error("Error checking user media count:", countError)
      return NextResponse.json({ error: "Failed to check upload limits" }, { status: 500 })
    }

    const imageCount = existingMedia?.filter((m) => m.media_type === "image").length || 0
    const videoCount = existingMedia?.filter((m) => m.media_type === "video").length || 0

    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")

    if (isImage && imageCount >= 10) {
      return NextResponse.json(
        {
          error: "Upload limit reached: You can upload maximum 10 images in basic plan",
        },
        { status: 400 },
      )
    }

    if (isVideo && videoCount >= 4) {
      return NextResponse.json(
        {
          error: "Upload limit reached: You can upload maximum 4 videos in basic plan",
        },
        { status: 400 },
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin"
    const fileName = `media/${userId}/${timestamp}-${randomId}.${fileExt}`

    console.log(`Uploading file: ${fileName}, Size: ${file.size} bytes`)

    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN not configured")
      return NextResponse.json(
        { 
          error: "File upload service not configured. Please contact administrator to set up BLOB_READ_WRITE_TOKEN environment variable.",
          details: "Missing BLOB_READ_WRITE_TOKEN environment variable"
        }, 
        { status: 500 }
      )
    }

    // Upload to Vercel Blob using server-side put()
    const blob = await put(fileName, file, {
      access: "public",
    })

    console.log(`File uploaded to blob: ${blob.url}`)

    // Save to database
    const mediaRecord = {
      user_id: userId,
      title: title || file.name.replace(/\.[^/.]+$/, ""),
      description: description || "",
      media_type: isImage ? "image" : "video",
      file_url: blob.url,
      blob_url: blob.url,
      thumbnail_url: null,
      file_size: file.size,
      mime_type: file.type,
      is_profile_picture: false,
      is_featured: isFeatured,
      tags: tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    }

    const { data, error } = await supabase.from("user_media").insert(mediaRecord).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    console.log(`Media record saved: ${data.id}`)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    )
  }
}
