import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    // Search for user by email in auth.users
    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ success: false, error: "Failed to search users" }, { status: 500 })
    }

    const user = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found. Make sure the user has registered first.",
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error("Error in find-user API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
