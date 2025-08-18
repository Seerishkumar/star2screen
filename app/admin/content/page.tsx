"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, FileText, MessageSquare, ArrowLeft } from "lucide-react"
import { ArticleManagement } from "@/components/admin/article-management"
import { useToast } from "@/hooks/use-toast"

interface AdminUser {
  id: number
  email: string
  name: string
  role: string
}

export default function ContentManagementPage() {
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
      
      // Check if user has content management permissions
      if (!["super_admin", "admin", "content_admin"].includes(user.role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access content management",
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
          <p>Loading content management...</p>
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
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold">Content Management</h1>
                <p className="text-sm text-gray-600">Manage articles, blogs, and news content</p>
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
        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article Management</CardTitle>
                <CardDescription>
                  Create, edit, and manage articles for the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ArticleManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blogs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Blog Management</CardTitle>
                <CardDescription>
                  Manage blog posts and user-generated content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Blog management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>News Management</CardTitle>
                <CardDescription>
                  Manage news articles and announcements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>News management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 