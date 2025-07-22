import { createClient } from "@supabase/supabase-js"

/* -------------------------------------------------------------------------- */
/*                             SERVER-ONLY HELPERS                            */
/* -------------------------------------------------------------------------- */

/**
 * Creates a Supabase client that can _only_ be instantiated on the server.
 * It throws if you try to call it in the browser so the service-role key
 * is never exposed to the client bundle.
 */
export function createServerSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "createServerSupabaseClient must only be called from a Server Action, Route Handler, or Server Component.",
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, serviceRoleKey)
}

/* -------------------------------------------------------------------------- */
/*                            ROLE & PERMISSION TYPES                         */
/* -------------------------------------------------------------------------- */

export type UserRole = "super_admin" | "admin" | "content_admin" | "moderator" | "premium_user" | "user"

/**
 * A map of default permissions assigned to each role.
 * Extend this as your product grows.
 */
export const DEFAULT_PERMISSIONS: Record<UserRole, Record<string, boolean>> = {
  super_admin: {
    manage_users: true,
    manage_content: true,
    manage_system: true,
    view_analytics: true,
    manage_roles: true,
    delete_content: true,
    moderate_content: true,
    manage_articles: true,
    manage_banners: true,
    manage_ads: true,
    view_reports: true,
    manage_comments: true,
  },
  admin: {
    manage_users: true,
    manage_content: true,
    view_analytics: true,
    manage_roles: false,
    delete_content: true,
    moderate_content: true,
    manage_articles: true,
    manage_banners: true,
    manage_ads: true,
    view_reports: true,
    manage_comments: true,
  },
  content_admin: {
    manage_content: true,
    moderate_content: true,
    view_analytics: true,
    manage_articles: true,
    manage_banners: true,
    manage_ads: true,
    view_reports: false,
    manage_comments: true,
  },
  moderator: {
    moderate_content: true,
    view_reports: true,
    manage_comments: true,
    delete_content: false,
  },
  premium_user: {
    view_premium_content: true,
    priority_support: true,
  },
  user: {},
}

/* -------------------------------------------------------------------------- */
/*                               SERVER QUERIES                               */
/* -------------------------------------------------------------------------- */

/**
 * Fetch all active users with their roles.
 */
export async function getAllUsersWithRoles() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("user_roles")
    .select(
      `
      user_id,
      role,
      permissions,
      is_active,
      assigned_at,
      user:auth.users(id, email, raw_user_meta_data)
    `,
    )
    .eq("is_active", true)
    .order("assigned_at", { ascending: false })

  if (error) {
    console.error("Error fetching users with roles:", error)
    throw new Error(error.message)
  }

  return (
    data?.map((row: any) => ({
      id: row.user_id,
      email: row.user?.email ?? "unknown@example.com",
      full_name: row.user?.raw_user_meta_data?.full_name ?? "Unknown",
      role: row.role as UserRole,
      permissions: row.permissions as Record<string, boolean>,
      is_active: row.is_active,
      assigned_at: row.assigned_at,
    })) ?? []
  )
}

/**
 * Upsert a role for a given user.
 */
export async function assignUserRole(
  userId: string,
  role: UserRole,
  permissions: Record<string, boolean> = DEFAULT_PERMISSIONS[role] ?? {},
  assignedBy?: string,
) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("user_roles").upsert({
    user_id: userId,
    role,
    permissions,
    assigned_by: assignedBy,
    is_active: true,
    assigned_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error assigning role:", error)
    throw new Error(error.message)
  }
}

/* -------------------------------------------------------------------------- */
/*                          CLIENT-SIDE CONVENIENCE API                       */
/* -------------------------------------------------------------------------- */

/**
 * A small role hierarchy helper so you can quickly check
 * whether `currentRole` is at least `requiredRole`.
 *
 * Example:
 *   if (hasRole("admin", "moderator")) { ... }
 */
export function hasRole(currentRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = {
    user: 1,
    premium_user: 2,
    moderator: 3,
    content_admin: 4,
    admin: 5,
    super_admin: 6,
  }

  return hierarchy[currentRole] >= hierarchy[requiredRole]
}

/* -------------------------------------------------------------------------- */
/*                        CLIENT-SIDE SESSION CONVENIENCE                     */
/* -------------------------------------------------------------------------- */

/**
 * Returns the JWT for the current admin session (or null if none).
 * Safe to call only in the browser.
 */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("adminToken")
}

/**
 * Returns the cached admin-user object stored in localStorage (or null).
 */
export function getAdminUser(): any | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("adminUser")
  return raw ? JSON.parse(raw) : null
}

/**
 * Clears the admin session from localStorage.
 */
export function clearAdminSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("adminToken")
  localStorage.removeItem("adminUser")
}

/**
 * Alias around `hasRole` so existing code that calls `hasPermission`
 * (userRole, requiredRole) keeps working.
 */
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return hasRole(userRole, requiredRole)
}
