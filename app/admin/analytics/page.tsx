"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, BarChart3, ArrowLeft, Users, FileText, ImageIcon, Video, TrendingUp, TrendingDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminUser {
  id: number
  email: string
  name: string
  role: string
}

interface AnalyticsData {
  totalUsers: number
  totalArticles: number
  totalBanners: number
  totalVideos: number
  newUsersThisMonth: number
  newArticlesThisMonth: number
  activeUsers: number
  pageViews: number
}

export default function AnalyticsPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalArticles: 0,
    totalBanners: 0,
    totalVideos: 0,
    newUsersThisMonth: 0,
    newArticlesThisMonth: 0,
    activeUsers: 0,
    pageViews: 0,
  })
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
      
      // Check if user has analytics permissions
      if (!["super_admin", "admin"].includes(user.role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access analytics",
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
    loadAnalytics()
  }, [router, toast])

  const loadAnalytics = async () => {
    try {
      // In a real application, you would fetch this data from your analytics API
      // For now, we'll use mock data
      const mockData: AnalyticsData = {
        totalUsers: 1234,
        totalArticles: 89,
        totalBanners: 12,
        totalVideos: 45,
        newUsersThisMonth: 156,
        newArticlesThisMonth: 23,
        activeUsers: 789,
        pageViews: 45678,
      }
      setAnalyticsData(mockData)
    } catch (error) {
      console.error("Error loading analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    }
  }

  const handleBackToDashboard = () => {
    router.push("/admin")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics...</p>
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
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-sm text-gray-600">View site analytics and reports</p>
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
                    +{analyticsData.newUsersThisMonth} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalArticles.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
                    +{analyticsData.newArticlesThisMonth} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalBanners.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
                    Active promotional content
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalVideos.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
                    Video content available
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Current user engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Users</span>
                      <span className="text-2xl font-bold">{analyticsData.activeUsers.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Page Views</span>
                      <span className="text-2xl font-bold">{analyticsData.pageViews.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Trends</CardTitle>
                  <CardDescription>Monthly growth indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">New Users</span>
                      <span className="text-2xl font-bold text-green-600">
                        +{analyticsData.newUsersThisMonth}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">New Articles</span>
                      <span className="text-2xl font-bold text-green-600">
                        +{analyticsData.newArticlesThisMonth}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>
                  Detailed user statistics and behavior patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Detailed user analytics coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Analytics</CardTitle>
                <CardDescription>
                  Content performance and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Content analytics coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 