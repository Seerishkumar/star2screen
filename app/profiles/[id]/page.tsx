import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Calendar, Mail, Phone, Globe, User } from "lucide-react"
import Link from "next/link"

interface ProfilePageProps {
  params: {
    id: string
  }
}

async function fetchProfile(userId: string) {
  try {
    console.log(`[Profile Page] Fetching profile for user ID: ${userId}`)

    // Get the profile data
    const { data: profile, error: profileError } = await supabase
      .from("author_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (profileError) {
      console.error("[Profile Page] Profile query error:", profileError)
      throw new Error(`Profile fetch error: ${profileError.message}`)
    }

    if (!profile) {
      console.log(`[Profile Page] No profile found for user ID: ${userId}`)
      return null
    }

    console.log(`[Profile Page] Found profile: ${profile.full_name || profile.display_name || "Unknown"}`)

    // Get media files for this user
    const { data: mediaFiles, error: mediaError } = await supabase
      .from("user_media")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (mediaError) {
      console.error("[Profile Page] Media query error:", mediaError)
      // Continue without media if there's an error
    }

    console.log(`[Profile Page] Found ${mediaFiles?.length || 0} media files`)

    // Find profile picture
    const profilePicture = mediaFiles?.find((media) => media.is_profile_picture && media.media_type === "image")
    const firstImage = mediaFiles?.find((media) => media.media_type === "image")

    const profileImageUrl =
      profilePicture?.blob_url ||
      profilePicture?.file_url ||
      firstImage?.blob_url ||
      firstImage?.file_url ||
      profile.avatar_url

    return {
      ...profile,
      profile_image: profileImageUrl,
      media_files: mediaFiles || [],
      media_count: mediaFiles?.length || 0,
    }
  } catch (error) {
    console.error("[Profile Page] Fetch error:", error)
    throw error
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await fetchProfile(params.id)

  if (!profile) {
    notFound()
  }

  const profileName = profile.display_name || profile.stage_name || profile.full_name || "Unknown Professional"
  const profileLocation = profile.city || profile.location || "Location not specified"
  const profileCategory = profile.profession || profile.category || "Professional"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/profiles">← Back to Profiles</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Header Card */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32 md:w-40 md:h-40">
                      {profile.profile_image ? (
                        <Image
                          src={profile.profile_image || "/placeholder.svg"}
                          alt={profileName}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 128px, 160px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <User className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileName}</h1>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary" className="capitalize">
                            {profileCategory}
                          </Badge>
                          {profile.is_verified && (
                            <Badge className="bg-blue-500 text-white">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Verified
                            </Badge>
                          )}
                          {profile.media_count > 0 && (
                            <Badge variant="outline">{profile.media_count} Media Files</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location and Experience */}
                    <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profileLocation}</span>
                      </div>
                      {profile.experience_years && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{profile.experience_years} years experience</span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {profile.bio && <p className="text-gray-700 leading-relaxed">{profile.bio}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.primary_roles && profile.primary_roles.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Primary Roles</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.primary_roles.map((role, index) => (
                        <Badge key={index} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.specialties && profile.specialties.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.languages && profile.languages.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Languages</h3>
                    <p className="text-gray-700">{profile.languages.join(", ")}</p>
                  </div>
                )}

                {profile.education && (
                  <div>
                    <h3 className="font-semibold mb-2">Education</h3>
                    <p className="text-gray-700">{profile.education}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
                      {profile.email}
                    </a>
                  </div>
                )}

                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${profile.phone}`} className="text-blue-600 hover:underline">
                      {profile.phone}
                    </a>
                  </div>
                )}

                {profile.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                <div className="pt-4">
                  <Button className="w-full">Contact Professional</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Media Gallery */}
        {profile.media_files && profile.media_files.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Media Gallery ({profile.media_files.length} files)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {profile.media_files
                    .filter((media) => media.media_type === "image")
                    .map((media, index) => (
                      <div key={media.id} className="relative aspect-square">
                        <Image
                          src={media.blob_url || media.file_url || "/placeholder.svg"}
                          alt={media.title || `Media ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                        {media.is_profile_picture && (
                          <Badge className="absolute top-2 left-2 bg-blue-500 text-white text-xs">Profile</Badge>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
