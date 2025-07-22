"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Eye, EyeOff, Shield, Crown, Settings, Star, AlertTriangle } from "lucide-react"
import { AdminHeader } from "@/components/auth/admin-header"
import { RoleGuard } from "@/components/auth/role-guard"

interface AdminCredential {
  email: string
  password: string
  role: string
  name: string
  description: string
  icon: any
  color: string
}

const adminCredentials: AdminCredential[] = [
  {
    email: "admin@stars2screen.com",
    password: "admin123",
    role: "super_admin",
    name: "System Administrator",
    description: "Full system access - can manage everything",
    icon: Crown,
    color: "text-red-600",
  },
  {
    email: "content@stars2screen.com",
    password: "content123",
    role: "content_admin",
    name: "Content Manager",
    description: "Can manage articles, banners, videos, and content",
    icon: Settings,
    color: "text-blue-600",
  },
  {
    email: "moderator@stars2screen.com",
    password: "moderator123",
    role: "moderator",
    name: "Content Moderator",
    description: "Can moderate content and manage user reports",
    icon: Star,
    color: "text-green-600",
  },
]

export default function AdminCredentialsPage() {
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [copiedField, setCopiedField] = useState<string>("")

  const togglePasswordVisibility = (email: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [email]: !prev[email],
    }))
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(""), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <RoleGuard requiredRole={["super_admin"]}>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />

        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Admin Credentials
            </h1>
            <p className="text-muted-foreground">Default admin login credentials for the platform</p>
          </div>

          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Security Warning:</strong> These are default credentials. Change them immediately in production!
              Never share these credentials or commit them to version control.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {adminCredentials.map((credential, index) => {
              const Icon = credential.icon
              const isPasswordVisible = showPasswords[credential.email]

              return (
                <Card key={index} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${credential.color}`} />
                      {credential.name}
                    </CardTitle>
                    <CardDescription>{credential.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email:</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">{credential.email}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(credential.email, `email-${index}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      {copiedField === `email-${index}` && <p className="text-xs text-green-600">Email copied!</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password:</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                          {isPasswordVisible ? credential.password : "••••••••"}
                        </code>
                        <Button size="sm" variant="outline" onClick={() => togglePasswordVisibility(credential.email)}>
                          {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(credential.password, `password-${index}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      {copiedField === `password-${index}` && (
                        <p className="text-xs text-green-600">Password copied!</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Role:</label>
                      <Badge variant="outline" className="w-fit">
                        {credential.role.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Login Links</CardTitle>
              <CardDescription>Direct links to login with each account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adminCredentials.map((credential, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <credential.icon className={`h-5 w-5 ${credential.color}`} />
                      <div>
                        <p className="font-medium">{credential.name}</p>
                        <p className="text-sm text-muted-foreground">{credential.email}</p>
                      </div>
                    </div>
                    <Button asChild size="sm">
                      <a href="/admin/login" target="_blank" rel="noopener noreferrer">
                        Login
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  Change default passwords immediately in production
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  Use strong, unique passwords for each admin account
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  Enable two-factor authentication when available
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  Regularly review admin access logs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  Remove unused admin accounts
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}
