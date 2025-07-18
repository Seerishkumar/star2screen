import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("author_profiles")
      .select("count", { count: "exact", head: true })

    if (connectionError) {
      return NextResponse.json({
        status: "error",
        message: "Cannot connect to author_profiles table",
        error: connectionError.message,
        details: connectionError,
      })
    }

    // Get table structure
    const { data: sampleData, error: structureError } = await supabase.from("author_profiles").select("*").limit(1)

    if (structureError) {
      return NextResponse.json({
        status: "error",
        message: "Cannot read table structure",
        error: structureError.message,
        details: structureError,
      })
    }

    const columns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : []

    // Get total count
    const { count } = await supabase.from("author_profiles").select("*", { count: "exact", head: true })

    // Get sample records
    const { data: sampleRecords, error: recordsError } = await supabase.from("author_profiles").select("*").limit(3)

    return NextResponse.json({
      status: "success",
      connection: "✅ Connected to database",
      table: "✅ author_profiles table exists",
      totalRecords: count || 0,
      columns: columns,
      requiredColumns: {
        id: columns.includes("id") ? "✅" : "❌",
        full_name: columns.includes("full_name") ? "✅" : "❌",
        profession: columns.includes("profession") ? "✅" : "❌",
        location: columns.includes("location") ? "✅" : "❌",
        experience_years: columns.includes("experience_years") ? "✅" : "❌",
        profile_image_url: columns.includes("profile_image_url") ? "✅" : "❌",
        is_featured: columns.includes("is_featured") ? "✅" : "❌",
        is_active: columns.includes("is_active") ? "✅" : "❌",
      },
      sampleRecords: sampleRecords || [],
      recommendations: [
        count === 0 ? "❌ No records found - add some profiles" : "✅ Records exist",
        !columns.includes("profession") ? "❌ Add profession column" : "✅ Profession column exists",
        !columns.includes("is_featured") ? "❌ Add is_featured column" : "✅ is_featured column exists",
        !columns.includes("is_active") ? "❌ Add is_active column" : "✅ is_active column exists",
      ],
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Unexpected error",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
