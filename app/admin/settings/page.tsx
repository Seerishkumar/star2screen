"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Settings, ArrowLeft, Save, Database, Mail, Globe, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminUser {
  id: number
  email: string
  name: string
  role: string
}

interface SystemSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  maxFileSize: number
  allowedFileTypes: string[]
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotifications: boolean
  analyticsEnabled: boolean
}

export default function SettingsPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "Stars2Screen",
    siteDescription: "Film industry networking platform",
    contactEmail: "admin@stars2screen.com",
    maxFileSize: 10,
    allowedFileTypes: ["jpg", "jpeg", "png", "gif", "mp4", "mov"],
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    analyticsEnabled: true,
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
      
      // Check if user has settings permissions
      if (!["super_admin"].includes(user.role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access system settings",
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
    loadSettings()
  }, [router, toast])

  const loadSettings = async () => {
    try {
      // In a real application, you would fetch settings from your API
      // For now, we'll use the default settings
      console.log("Loading system settings...")
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive",
      })
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // In a real application, you would save settings to your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast({
        title: "Success",
        description: "System settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save system settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
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
          <p>Loading settings...</p>
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
              <Settings className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold">System Settings</h1>
                <p className="text-sm text-gray-600">Configure system settings and preferences</p>
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
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic site configuration and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable maintenance mode to restrict access
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registrationEnabled">User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register
                    </p>
                  </div>
                  <Switch
                    id="registrationEnabled"
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>
                  Configure content upload and display settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={settings.allowedFileTypes.join(", ")}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      allowedFileTypes: e.target.value.split(",").map(type => type.trim()) 
                    })}
                    placeholder="jpg, jpeg, png, gif, mp4, mov"
                  />
                  <p className="text-sm text-muted-foreground">
                    Comma-separated list of allowed file extensions
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and access control settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Security settings coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure email and system notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable email notifications for system events
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analyticsEnabled">Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable analytics and tracking
                    </p>
                  </div>
                  <Switch
                    id="analyticsEnabled"
                    checked={settings.analyticsEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, analyticsEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </main>
    </div>
  )
} 