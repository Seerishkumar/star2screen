"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Database, User, ImageIcon, MessageSquare, Briefcase, Star } from "lucide-react"

interface TestResult {
  name: string
  status: "success" | "error" | "pending"
  message: string
  data?: any
}

export default function TestFeaturesPage() {
  const { user } = useAuth()
  const [tests, setTests] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    if (!user) return

    setLoading(true)
    const testResults: TestResult[] = []

    // Test 1: Database Connection
    try {
      const { data, error } = await supabase.from("author_profiles").select("count", { count: "exact" })
      testResults.push({
        name: "Database Connection",
        status: error ? "error" : "success",
        message: error ? error.message : `Connected successfully. ${data?.length || 0} profiles found.`,
        data: data,
      })
    } catch (error: any) {
      testResults.push({
        name: "Database Connection",
        status: "error",
        message: error.message,
      })
    }

    // Test 2: User Profile
    try {
      const { data, error } = await supabase.from("author_profiles").select("*").eq("user_id", user.id).single()

      testResults.push({
        name: "User Profile",
        status: error ? "error" : "success",
        message: error ? error.message : "Profile loaded successfully",
        data: data,
      })
    } catch (error: any) {
      testResults.push({
        name: "User Profile",
        status: "error",
        message: error.message,
      })
    }

    // Test 3: Media Files
    try {
      const { data, error } = await supabase.from("user_media").select("*").eq("user_id", user.id)

      testResults.push({
        name: "Media Files",
        status: error ? "error" : "success",
        message: error ? error.message : `Found ${data?.length || 0} media files`,
        data: data,
      })
    } catch (error: any) {
      testResults.push({
        name: "Media Files",
        status: "error",
        message: error.message,
      })
    }

    // Test 4: Job Posts
    try {
      const { data, error } = await supabase.from("job_posts").select("*").limit(5)

      testResults.push({
        name: "Job Posts",
        status: error ? "error" : "success",
        message: error ? error.message : `Found ${data?.length || 0} job posts`,
        data: data,
      })
    } catch (error: any) {
      testResults.push({
        name: "Job Posts",
        status: "error",
        message: error.message,
      })
    }

    // Test 5: Messages
    try {
      const { data, error } = await supabase.from("messages").select("*").eq("sender_id", user.id)

      testResults.push({
        name: "Messages",
        status: error ? "error" : "success",
        message: error ? error.message : `Found ${data?.length || 0} messages`,
        data: data,
      })
    } catch (error: any) {
      testResults.push({
        name: "Messages",
        status: "error",
        message: error.message,
      })
    }

    // Test 6: Reviews
    try {
      const { data, error } = await supabase.from("reviews").select("*").eq("reviewee_id", user.id)

      testResults.push({
        name: "Reviews",
        status: error ? "error" : "success",
        message: error ? error.message : `Found ${data?.length || 0} reviews`,
        data: data,
      })
    } catch (error: any) {
      testResults.push({
        name: "Reviews",
        status: "error",
        message: error.message,
      })
    }

    setTests(testResults)
    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      runTests()
    }
  }, [user])

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to test the features.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Feature Testing Dashboard</h1>
          <p className="text-muted-foreground">Test all platform features and database connections</p>
        </div>
        <Button onClick={runTests} disabled={loading}>
          {loading ? "Running Tests..." : "Run Tests"}
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="user-info">User Info</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      {test.name === "Database Connection" && <Database className="h-4 w-4" />}
                      {test.name === "User Profile" && <User className="h-4 w-4" />}
                      {test.name === "Media Files" && <ImageIcon className="h-4 w-4" />}
                      {test.name === "Job Posts" && <Briefcase className="h-4 w-4" />}
                      {test.name === "Messages" && <MessageSquare className="h-4 w-4" />}
                      {test.name === "Reviews" && <Star className="h-4 w-4" />}
                      {test.name}
                    </span>
                    {test.status === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : test.status === "error" ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-yellow-500 animate-pulse" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{test.message}</p>
                  <Badge
                    variant={
                      test.status === "success" ? "default" : test.status === "error" ? "destructive" : "secondary"
                    }
                    className="mt-2"
                  >
                    {test.status.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Tables Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span>{test.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={test.status === "success" ? "default" : "destructive"}>{test.status}</Badge>
                      {test.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>User Registration</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Profile Management</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Media Upload (Vercel Blob)</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Dashboard</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Job Posting System</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Messaging System</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full">
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/profile">Manage Profile</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/jobs">Browse Jobs</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/messages">Messages</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">User ID:</span>
                  <span className="text-muted-foreground font-mono text-sm">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email Verified:</span>
                  <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                    {user.email_confirmed_at ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Created:</span>
                  <span className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Last Sign In:</span>
                  <span className="text-muted-foreground">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
