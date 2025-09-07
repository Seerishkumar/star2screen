import { type NextRequest, NextResponse } from "next/server"
import { del } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN not configured")
      return NextResponse.json(
        { 
          error: "File delete service not configured. Please contact administrator to set up BLOB_READ_WRITE_TOKEN environment variable.",
          details: "Missing BLOB_READ_WRITE_TOKEN environment variable"
        }, 
        { status: 500 }
      )
    }

    // Delete from Vercel Blob
    await del(url)

    console.log(`Blob deleted: ${url}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Blob delete error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Delete failed",
      },
      { status: 500 },
    )
  }
}
