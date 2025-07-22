"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  Users,
  FileText,
  ImageIcon,
  Video,
  Settings,
  BarChart3,
  MessageSquare,
  Crown,
  LogOut,
  Home,
} from "lucide-react"

interface AdminUser {
  id: number
  email: string
  name: string
  role: string
}

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("adminToken")
    const userStr = localStorage.getItem("adminUser")

    if (!token || !userStr) {
      router.push("/admin/login")
      return
    }

    try {
      const user = JSON.parse(userStr)
      setAdminUser(user)
    } catch (error) {
      console.error("Failed to parse admin user:", error)
      router.push("/admin/login")
      return
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    router.push("/admin/login")
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

  const adminMenuItems = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      href: "/admin/users",
      roles: ["super_admin", "admin"],
    },
    {
      title: "Content Management",
      description: "Manage articles, blogs, and content",
      icon: FileText,
      href: "/admin/content",
      roles: ["super_admin", "admin", "content_admin"],
    },
    {
      title: "Banner Management",
      description: "Manage homepage banners and promotions",
      icon: ImageIcon,
      href: "/admin/banners",
      roles: ["super_admin", "admin", "content_admin"],
    },
    {
      title: "Video Management",
      description: "Manage video content and showcases",
      icon: Video,
      href: "/admin/videos",
      roles: ["super_admin", "admin", "content_admin"],
    },
    {
      title: "Analytics",
      description: "View site analytics and reports",
      icon: BarChart3,
      href: "/admin/analytics",
      roles: ["super_admin", "admin"],
    },
    {
      title: "Messages & Reports",
      description: "Moderate content and handle reports",
      icon: MessageSquare,
      href: "/admin/moderation",
      roles: ["super_admin", "admin", "moderator"],
    },
    {
      title: "System Settings",
      description: "Configure system settings and preferences",
      icon: Settings,
      href: "/admin/settings",
      roles: ["super_admin"],
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>Access denied. Please log in as an administrator.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const availableMenuItems = adminMenuItems.filter((item) => item.roles.includes(adminUser.role))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Stars2Screen Administration</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant={getRoleBadgeVariant(adminUser.role)} className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                {getRoleDisplayName(adminUser.role)}
              </Badge>

              <div className="text-right">
                <p className="text-sm font-medium">{adminUser.name}</p>
                <p className="text-xs text-gray-600">{adminUser.email}</p>
              </div>

              <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                <Home className="h-4 w-4 mr-2" />
                Back to Site
              </Button>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {adminUser.name}!</h2>
          <p className="text-gray-600">Manage your Stars2Screen platform from this dashboard.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Articles</p>
                  <p className="text-2xl font-bold">89</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Banners</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <ImageIcon className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Videos</p>
                  <p className="text-2xl font-bold">45</p>
                </div>
                <Video className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableMenuItems.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push(item.href)} variant="outline">
                  Access
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registration</p>
                  <p className="text-xs text-gray-600">john.doe@example.com joined the platform</p>
                </div>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>

              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Article published</p>
                  <p className="text-xs text-gray-600">"Top 10 Acting Tips" was published</p>
                </div>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>

              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Banner updated</p>
                  <p className="text-xs text-gray-600">Homepage banner was modified</p>
                </div>
                <p className="text-xs text-gray-500">3 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
