import { NextResponse } from "next/server"

export async function GET() {
  try {
    const blobTokenConfigured = !!process.env.BLOB_READ_WRITE_TOKEN
    const tokenPreview = process.env.BLOB_READ_WRITE_TOKEN 
      ? `${process.env.BLOB_READ_WRITE_TOKEN.substring(0, 20)}...${process.env.BLOB_READ_WRITE_TOKEN.slice(-10)}`
      : "Not configured"

    const config = {
      blobTokenConfigured,
      tokenPreview,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      instructions: {
        local: "Add BLOB_READ_WRITE_TOKEN to .env.local file",
        production: "Add BLOB_READ_WRITE_TOKEN to Vercel environment variables",
        documentation: "See docs/BLOB_SETUP.md for detailed instructions"
      }
    }

    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Configuration check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}