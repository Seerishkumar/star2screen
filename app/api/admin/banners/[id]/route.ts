import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 Fetching banner with ID: ${params.id}`)
    const supabase = createServerSupabaseClient()

    const { data: banner, error } = await supabase
      .from("banners")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error(`❌ Error fetching banner ${params.id}:`, error)
      if (error.code === "PGRST116") {
        return NextResponse.json({ 
          error: "Banner not found",
          code: error.code 
        }, { status: 404 })
      }
      return NextResponse.json({ 
        error: error.message,
        code: error.code 
      }, { status: 500 })
    }

    console.log(`✅ Successfully fetched banner: ${banner.id}`)
    return NextResponse.json({ banner })
  } catch (error) {
    console.error(`❌ Unexpected error in GET /api/admin/banners/${params.id}:`, error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 Updating banner with ID: ${params.id}`)
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    console.log(`📝 Update data received for banner ${params.id}:`, JSON.stringify(data, null, 2))

    // Validate required fields
    if (!data.title || !data.image_url) {
      console.error(`❌ Missing required fields for banner ${params.id}:`, { 
        title: !!data.title, 
        image_url: !!data.image_url 
      })
      return NextResponse.json({ 
        error: "Title and image_url are required fields" 
      }, { status: 400 })
    }

    // Prepare update data
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    }

    console.log(`📝 Updating banner ${params.id} with data:`, JSON.stringify(updateData, null, 2))

    const { data: banner, error } = await supabase
      .from("banners")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error(`❌ Error updating banner ${params.id}:`, error)
      if (error.code === "PGRST116") {
        return NextResponse.json({ 
          error: "Banner not found",
          code: error.code 
        }, { status: 404 })
      }
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: "Check if the banner exists and you have permission to update it"
      }, { status: 500 })
    }

    console.log(`✅ Banner ${params.id} updated successfully`)
    return NextResponse.json({ banner })
  } catch (error) {
    console.error(`❌ Unexpected error in PUT /api/admin/banners/${params.id}:`, error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 Deleting banner with ID: ${params.id}`)
    const supabase = createServerSupabaseClient()

    // First check if banner exists
    const { data: existingBanner, error: checkError } = await supabase
      .from("banners")
      .select("id")
      .eq("id", params.id)
      .single()

    if (checkError) {
      console.error(`❌ Error checking banner ${params.id} existence:`, checkError)
      if (checkError.code === "PGRST116") {
        return NextResponse.json({ 
          error: "Banner not found",
          code: checkError.code 
        }, { status: 404 })
      }
      return NextResponse.json({ 
        error: checkError.message,
        code: checkError.code 
      }, { status: 500 })
    }

    console.log(`📝 Deleting banner ${params.id}...`)

    const { error } = await supabase
      .from("banners")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error(`❌ Error deleting banner ${params.id}:`, error)
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: "Check if you have permission to delete this banner"
      }, { status: 500 })
    }

    console.log(`✅ Banner ${params.id} deleted successfully`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`❌ Unexpected error in DELETE /api/admin/banners/${params.id}:`, error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
