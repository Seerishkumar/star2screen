import { type NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"

// Admin credentials - CHANGE THESE IN PRODUCTION!
const ADMIN_USERS = [
  {
    id: 1,
    email: "admin@stars2screen.com",
    plainPassword: "admin123",
    name: "System Administrator",
    role: "super_admin",
  },
  {
    id: 2,
    email: "content@stars2screen.com",
    plainPassword: "content123",
    name: "Content Manager",
    role: "content_admin",
  },
  {
    id: 3,
    email: "moderator@stars2screen.com",
    plainPassword: "moderator123",
    name: "Content Moderator",
    role: "moderator",
  },
] as const

export async function POST(request: NextRequest) {
  try {
    console.log("Admin login POST request received")

    const body = await request.json()
    const { email, password } = body

    console.log(`Login attempt for email: ${email}`)

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Find admin user
    const adminUser = ADMIN_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase())

    if (!adminUser) {
      console.log(`Admin user not found: ${email}`)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    // Check password (plain text for development)
    if (password !== adminUser.plainPassword) {
      console.log(`Invalid password for admin: ${email}`)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    // Generate JWT token using jose
    const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key-change-in-production"

    try {
      const token = await new SignJWT({
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(new TextEncoder().encode(JWT_SECRET))

      console.log(`Successful admin login: ${email} (${adminUser.role})`)

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
    } catch (jwtError) {
      console.error("JWT signing error:", jwtError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate authentication token",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

// GET endpoint to check available admin accounts (for development only)
export async function GET() {
  try {
    return NextResponse.json({
      message: "Admin login endpoint is active",
      status: "working",
      availableAdmins: ADMIN_USERS.map((user) => ({
        email: user.email,
        role: user.role,
        name: user.name,
        password: user.plainPassword, // Only show in development
      })),
      note: "Use these credentials to login at /admin/login",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("GET admin login error:", error)
    return NextResponse.json(
      {
        error: "Failed to get admin info",
      },
      { status: 500 },
    )
  }
}
