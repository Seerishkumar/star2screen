"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { User, MessageCircle, Calendar, Edit, Eye, TrendingUp, Users, Mail, Phone } from "lucide-react"
import Link from "next/link"

interface ProfileStats {
  profile_views: number
  messages_received: number
  bookings_received: number
  profile_completion: number
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<ProfileStats>({
    profile_views: 0,
    messages_received: 0,
    bookings_received: 0,
    profile_completion: 0,
  })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      loadDashboardData()
    }
  }, [user, loading, router])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("author_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error loading profile:", profileError)
      } else if (profileData) {
        setProfile(profileData)

        // Calculate profile completion
        const fields = ["display_name", "bio", "city", "experience_years", "primary_roles", "skills", "contact_email"]
        const completedFields = fields.filter((field) => {
          const value = profileData[field]
          return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "")
        })
        const completion = Math.round((completedFields.length / fields.length) * 100)

        setStats((prev) => ({
          ...prev,
          profile_views: profileData.profile_views || 0,
          profile_completion: completion,
        }))
      }

      // Load message stats
      const { count: messageCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("conversation_participants.user_id", user.id)

      setStats((prev) => ({
        ...prev,
        messages_received: messageCount || 0,
      }))
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.display_name || user.email}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold">{stats.profile_views}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold">{stats.messages_received}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                <p className="text-2xl font-bold">{stats.bookings_received}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Complete</p>
                <p className={`text-2xl font-bold ${getCompletionColor(stats.profile_completion)}`}>
                  {stats.profile_completion}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{profile.display_name || "Complete your profile"}</h3>
                      <p className="text-muted-foreground">
                        {profile.bio || "Add a bio to tell people about yourself"}
                      </p>
                      {profile.city && <p className="text-sm text-muted-foreground mt-1">📍 {profile.city}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/profile">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href="/profile/edit">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {profile.primary_roles && profile.primary_roles.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Roles:</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.primary_roles.map((role: string) => (
                          <Badge key={role} variant="secondary">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {profile.experience_years && <span>🎭 {profile.experience_years} years experience</span>}
                    {profile.availability_status && (
                      <Badge variant={profile.availability_status === "available" ? "default" : "secondary"}>
                        {profile.availability_status.replace("-", " ")}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your professional profile to get discovered by casting directors and producers.
                  </p>
                  <Button asChild>
                    <Link href="/profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Create Profile
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link href="/messages">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  View Messages
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href="/profile/edit">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href="/profile">
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Profile
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href="/profiles">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Professionals
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall Progress</span>
                  <span className={`text-sm font-medium ${getCompletionColor(stats.profile_completion)}`}>
                    {stats.profile_completion}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.profile_completion}%` }}
                  />
                </div>
                {stats.profile_completion < 100 && (
                  <p className="text-xs text-muted-foreground">
                    Complete your profile to increase visibility and get more opportunities.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          {profile?.contact_email || profile?.contact_phone ? (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.contact_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.contact_email}</span>
                  </div>
                )}
                {profile.contact_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.contact_phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
