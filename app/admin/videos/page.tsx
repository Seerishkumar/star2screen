"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Video, ArrowLeft } from "lucide-react"
import { VideoManagement } from "@/components/admin/video-management"
import { useToast } from "@/hooks/use-toast"

interface AdminUser {
  id: number
  email: string
  name: string
  role: string
}

export default function VideoManagementPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

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
      
      // Check if user has video management permissions
      if (!["super_admin", "admin", "content_admin"].includes(user.role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access video management",
          variant: "destructive",
        })
        router.push("/admin")
        return
      }
    } catch (error) {
      console.error("Failed to parse admin user:", error)
      router.push("/admin/login")
      return
    }

    setLoading(false)
  }, [router, toast])

  const handleBackToDashboard = () => {
    router.push("/admin")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading video management...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Video className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold">Video Management</h1>
                <p className="text-sm text-gray-600">Manage video content and showcases</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {adminUser.role.replace("_", " ")}
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium">{adminUser.name}</p>
                <p className="text-xs text-gray-600">{adminUser.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Video Management</CardTitle>
            <CardDescription>
              Create, edit, and manage video content and showcases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoManagement />
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 