"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RoleGuard } from "@/components/auth/role-guard"
import { assignUserRole, type UserRole } from "@/lib/auth-utils"
import { UserPlus, Shield, Crown, Settings, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin", icon: Crown, description: "Full system access" },
  { value: "admin", label: "Admin", icon: Shield, description: "User and content management" },
  { value: "content_admin", label: "Content Admin", icon: Settings, description: "Content management only" },
  { value: "moderator", label: "Moderator", icon: Star, description: "Content moderation" },
]

export default function SetAdminPage() {
  const [email, setEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()

  const handleSetAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // First, we need to find the user by email
      const response = await fetch("/api/admin/find-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const userData = await response.json()

      if (!userData.success) {
        setResult({
          success: false,
          message: userData.error || "User not found. Make sure the user has registered first.",
        })
        return
      }

      // Now assign the role
      const roleResult = await assignUserRole(userData.user.id, selectedRole)

      if (roleResult.success) {
        setResult({
          success: true,
          message: `Successfully assigned ${selectedRole} role to ${email}`,
        })
        setEmail("")
        toast({
          title: "Success",
          description: `User ${email} is now a ${selectedRole}`,
        })
      } else {
        setResult({
          success: false,
          message: roleResult.error || "Failed to assign role",
        })
      }
    } catch (error) {
      console.error("Error setting admin:", error)
      setResult({
        success: false,
        message: "An error occurred while setting admin role",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <RoleGuard requiredRole={["super_admin"]} requiredPermission="manage_roles">
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserPlus className="h-8 w-8" />
            Set Admin Role
          </h1>
          <p className="text-muted-foreground">Assign admin roles to existing users</p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Assign Admin Role</CardTitle>
              <CardDescription>
                Enter the email address of an existing user to assign them an admin role. The user must have already
                registered on the platform.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSetAdmin} className="space-y-6">
                <div>
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role">Admin Role</Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => {
                        const Icon = role.icon
                        return (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{role.label}</div>
                                <div className="text-xs text-muted-foreground">{role.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Setting Admin Role..." : "Set Admin Role"}
                </Button>
              </form>

              {result && (
                <Alert className={`mt-4 ${result.success ? "border-green-200 bg-green-50" : ""}`}>
                  <AlertDescription className={result.success ? "text-green-800" : ""}>
                    {result.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Alternative Methods</CardTitle>
              <CardDescription>Other ways to set admin roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Database Script</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Run the SQL script: <code className="bg-muted px-1 rounded">scripts/35-set-admin-users.sql</code>
                </p>
                <p className="text-sm text-muted-foreground">
                  Modify the email addresses in the script and execute it in your database.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. SQL Function</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the <code className="bg-muted px-1 rounded">set_user_admin()</code> function:
                </p>
                <code className="block bg-muted p-2 rounded text-sm">
                  SELECT set_user_admin('user@example.com', 'admin');
                </code>
              </div>

              <div>
                <h4 className="font-medium mb-2">3. User Management Page</h4>
                <p className="text-sm text-muted-foreground">
                  Go to{" "}
                  <a href="/admin/users" className="text-primary hover:underline">
                    /admin/users
                  </a>{" "}
                  to manage all user roles.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}
