import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Star, Phone, Mail, Globe, User, Camera, MessageCircle, Share2, Heart } from "lucide-react"

interface ProfilePageProps {
  params: {
    id: string
  }
}

async function getProfile(userId: string) {
  try {
    console.log(`[Profile] Fetching profile for user ID: ${userId}`)

    const { data: profile, error: profileError } = await supabase
      .from("author_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (profileError) {
      console.error("[Profile] Profile query error:", profileError)
      return null
    }

    if (!profile) {
      console.log("[Profile] No profile found")
      return null
    }

    // Get user media
    const { data: mediaFiles, error: mediaError } = await supabase
      .from("user_media")
      .select("*")
      .eq("user_id", userId)
      .eq("media_type", "image")
      .order("created_at", { ascending: false })

    if (mediaError) {
      console.error("[Profile] Media query error:", mediaError)
    }

    return {
      ...profile,
      media: mediaFiles || [],
    }
  } catch (error) {
    console.error("[Profile] Unexpected error:", error)
    return null
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await getProfile(params.id)

  if (!profile) {
    notFound()
  }

  const profilePicture = profile.media?.find((media: any) => media.is_profile_picture)
  const galleryImages = profile.media?.filter((media: any) => !media.is_profile_picture) || []

  const profileImageUrl = profilePicture?.blob_url || profilePicture?.file_url || profile.avatar_url
  const displayName = profile.display_name || profile.stage_name || profile.full_name || "Anonymous User"
  const location = profile.city || profile.location || "Location not specified"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container px-4 md:px-6 relative h-full flex items-end pb-8">
          <div className="flex items-end gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl || "/placeholder.svg"}
                    alt={displayName}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              {profile.is_verified && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                  <Star className="h-4 w-4 fill-current" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="text-white pb-4">
              <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
              <div className="flex items-center gap-4 text-white/90">
                {profile.profession && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {profile.profession}
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
                {profile.experience_years && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{profile.experience_years} years experience</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ml-auto pb-4 flex gap-2">
            <Button variant="secondary" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="secondary" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="secondary" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio || "No bio available for this professional."}
                </p>
              </CardContent>
            </Card>

            {/* Skills & Specializations */}
            {profile.primary_roles && profile.primary_roles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Specializations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.primary_roles.map((role: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Media Gallery */}
            {galleryImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Portfolio ({galleryImages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((media: any, index: number) => (
                      <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={media.blob_url || media.file_url || "/placeholder.svg"}
                          alt={`Portfolio image ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Link href={profile.website} className="text-blue-600 hover:underline">
                      Visit Website
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.category && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Category</span>
                    <p className="capitalize">{profile.category}</p>
                  </div>
                )}
                {profile.experience_years !== null && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Experience</span>
                    <p>{profile.experience_years} years</p>
                  </div>
                )}
                {profile.hourly_rate && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Hourly Rate</span>
                    <p>${profile.hourly_rate}</p>
                  </div>
                )}
                <Separator />
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Member Since</span>
                  <p>{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Profile Views</span>
                  <p>0</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Favorites
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Report Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
