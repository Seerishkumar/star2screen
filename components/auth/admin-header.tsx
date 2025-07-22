"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getAdminUser, clearAdminSession } from "@/lib/auth-utils"
import { Shield, User, LogOut, Settings } from "lucide-react"

export function AdminHeader() {
  const [adminUser, setAdminUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const user = getAdminUser()
    setAdminUser(user)
  }, [])

  const handleLogout = () => {
    clearAdminSession()
    router.push("/admin/login")
  }

  if (!adminUser) {
    return null
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive"
      case "admin":
        return "default"
      case "content_admin":
        return "secondary"
      case "moderator":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin"
      case "content_admin":
        return "Content Admin"
      case "moderator":
        return "Moderator"
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant={getRoleBadgeVariant(adminUser.role)}>{getRoleDisplayName(adminUser.role)}</Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{adminUser.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{adminUser.name}</p>
                  <p className="text-xs text-muted-foreground">{adminUser.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
