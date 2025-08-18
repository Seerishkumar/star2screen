import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Verify admin token
async function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  try {
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    // Check if user has admin privileges
    if (!["super_admin", "admin"].includes(decoded.role)) {
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}

// GET: Fetch all users with enhanced data
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Fetching all users...")

    // Fetch users from auth.users table
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error("❌ Error fetching users:", usersError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Fetch user profiles if the table exists
    let profiles: any[] = []
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
      
      if (!profilesError) {
        profiles = profilesData || []
      }
    } catch (error) {
      console.log("⚠️ Profiles table not found, using basic user data")
    }

    // Fetch user roles if the table exists
    let userRoles: any[] = []
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
      
      if (!rolesError) {
        userRoles = rolesData || []
      }
    } catch (error) {
      console.log("⚠️ User roles table not found, using default roles")
    }

    // Combine user data
    const enhancedUsers = users.users.map(user => {
      const profile = profiles.find(p => p.id === user.id) || {}
      const userRole = userRoles.find(ur => ur.user_id === user.id)
      
      return {
        id: user.id,
        email: user.email,
        full_name: profile.full_name || user.user_metadata?.full_name || "Unknown",
        role: userRole?.role || "user",
        permissions: userRole?.permissions || {},
        is_active: user.banned_at ? false : true,
        email_confirmed: user.email_confirmed_at ? true : false,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
        profile_data: profile,
        metadata: user.user_metadata
      }
    })

    console.log(`✅ Successfully fetched ${enhancedUsers.length} users`)

    return NextResponse.json({ 
      success: true, 
      data: enhancedUsers,
      count: enhancedUsers.length
    })
  } catch (error) {
    console.error("❌ Error in GET /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Create new user
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, password, full_name, role, permissions } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log(`🔍 Creating new user: ${email}`)

    // Create user in auth
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true
    })

    if (createError) {
      console.error("❌ Error creating user:", createError)
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    const userId = userData.user.id

    // Create profile if profiles table exists
    try {
      await supabase.from("profiles").insert({
        id: userId,
        full_name,
        email,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.log("⚠️ Could not create profile, continuing...")
    }

    // Assign role if user_roles table exists
    try {
      await supabase.from("user_roles").insert({
        user_id: userId,
        role: role || "user",
        permissions: permissions || {},
        assigned_by: admin.id,
        is_active: true,
        assigned_at: new Date().toISOString()
      })
    } catch (error) {
      console.log("⚠️ Could not assign role, continuing...")
    }

    console.log(`✅ Successfully created user: ${email}`)

    return NextResponse.json({ 
      success: true, 
      message: "User created successfully",
      user: {
        id: userId,
        email,
        full_name,
        role: role || "user"
      }
    })
  } catch (error) {
    console.error("❌ Error in POST /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT: Update user
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, updates } = await request.json()

    if (!userId || !updates) {
      return NextResponse.json({ error: "User ID and updates are required" }, { status: 400 })
    }

    console.log(`🔍 Updating user: ${userId}`)

    // Update user metadata if provided
    if (updates.full_name || updates.metadata) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: updates.full_name,
          ...updates.metadata
        }
      })

      if (updateError) {
        console.error("❌ Error updating user metadata:", updateError)
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }
    }

    // Update profile if profiles table exists
    if (updates.full_name || updates.profile_data) {
      try {
        await supabase.from("profiles").upsert({
          id: userId,
          full_name: updates.full_name,
          ...updates.profile_data,
          updated_at: new Date().toISOString()
        })
      } catch (error) {
        console.log("⚠️ Could not update profile, continuing...")
      }
    }

    // Update role if provided
    if (updates.role || updates.permissions) {
      try {
        await supabase.from("user_roles").upsert({
          user_id: userId,
          role: updates.role,
          permissions: updates.permissions,
          assigned_by: admin.id,
          is_active: true,
          assigned_at: new Date().toISOString()
        })
      } catch (error) {
        console.log("⚠️ Could not update role, continuing...")
      }
    }

    console.log(`✅ Successfully updated user: ${userId}`)

    return NextResponse.json({ 
      success: true, 
      message: "User updated successfully" 
    })
  } catch (error) {
    console.error("❌ Error in PUT /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Delete user
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`🔍 Deleting user: ${userId}`)

    // Delete user from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error("❌ Error deleting user:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    // Delete profile if profiles table exists
    try {
      await supabase.from("profiles").delete().eq("id", userId)
    } catch (error) {
      console.log("⚠️ Could not delete profile, continuing...")
    }

    // Delete role if user_roles table exists
    try {
      await supabase.from("user_roles").delete().eq("user_id", userId)
    } catch (error) {
      console.log("⚠️ Could not delete role, continuing...")
    }

    console.log(`✅ Successfully deleted user: ${userId}`)

    return NextResponse.json({ 
      success: true, 
      message: "User deleted successfully" 
    })
  } catch (error) {
    console.error("❌ Error in DELETE /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
