import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, confirmPassword } = await request.json()

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

      if (!decoded || !decoded.email) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }

      // Validate input
      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 })
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "New passwords do not match" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
      }

      // In a real application, you would:
      // 1. Verify the current password against the database
      // 2. Hash the new password
      // 3. Update the password in the database

      // For this demo, we'll simulate the process
      const hashedNewPassword = await bcrypt.hash(newPassword, 12)

      console.log(`Password change request for admin: ${decoded.email}`)
      console.log(`New hashed password: ${hashedNewPassword}`)

      return NextResponse.json({
        success: true,
        message: "Password changed successfully",
        note: "In production, this would update the database. For now, check the console for the new hashed password.",
      })
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
