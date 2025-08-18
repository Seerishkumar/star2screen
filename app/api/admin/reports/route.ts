import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: reports, error } = await supabase
      .from("reports")
      .select(`
        *,
        reporter:reporter_id(full_name, email),
        reported_content:reported_content_id(title, content_type)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ reports: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedReports = reports?.map((report) => ({
      id: report.id,
      reporter_id: report.reporter_id,
      reporter_name: report.reporter?.full_name || "Unknown",
      reported_content_type: report.reported_content?.content_type || "unknown",
      reported_content_id: report.reported_content_id,
      reported_content_title: report.reported_content?.title || "Unknown Content",
      reason: report.reason,
      description: report.description,
      status: report.status,
      created_at: report.created_at,
      updated_at: report.updated_at,
    })) || []

    return NextResponse.json({ reports: transformedReports })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    const { data: report, error } = await supabase
      .from("reports")
      .insert([data])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 