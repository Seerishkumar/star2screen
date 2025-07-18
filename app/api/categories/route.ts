import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Organize into parent-child hierarchy
    const parentCategories = categories.filter((cat) => !cat.parent_id)
    const childCategories = categories.filter((cat) => cat.parent_id)

    const categoriesWithChildren = parentCategories.map((parent) => ({
      ...parent,
      children: childCategories.filter((child) => child.parent_id === parent.id),
    }))

    return NextResponse.json(categoriesWithChildren)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
