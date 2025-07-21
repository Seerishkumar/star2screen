import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Admin credentials (in production, store these in database)
const ADMIN_USERS = [
  {
    id: 1,
    email: "admin@stars2screen.com",
    password: "$2a$12$LQv3c1yqBwEHFl5aBLHdCO7stpXTrKZ5d9HL8XvzOdpd8.BTXJWoq", // hashed 'admin123'
    name: "System Administrator",
    role: "super_admin",
  },
  {
    id: 2,
    email: "content@stars2screen.com",
    password: "$2a$12$LQv3c1yqBwEHFl5aBLHdCO7stpXTrKZ5d9HL8XvzOdpd8.BTXJWoq", // hashed 'content123'
    name: "Content Manager",
    role: "content_admin",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find admin user
    const adminUser = ADMIN_USERS.find((user) => user.email === email)

    if (!adminUser) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    // Log admin login
    try {
      await supabase.from("admin_logs").insert({
        admin_id: adminUser.id,
        action: "login",
        details: { email, timestamp: new Date().toISOString() },
      })
    } catch (logError) {
      console.error("Failed to log admin login:", logError)
    }

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
