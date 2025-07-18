"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Star,
  MessageSquare,
  Award,
  Heart,
  Share2,
  Clock,
  User,
  Play,
  Loader2,
  Camera,
  Video,
  X,
} from "lucide-react"

interface ProfileData {
  id: string
  user_id: string
  full_name: string
  stage_name: string
  display_name: string
  bio: string
  resume_bio: string
  avatar_url?: string
  blob_url?: string
  gender: string
  date_of_birth: string
  nationality: string
  city: string
  known_for: string
  height: string
  body_type: string
  age_range: string
  representation: string
  contact_email: string
  contact_phone: string
  profile_video_url: string
  demo_reel_url: string
  imdb_url: string
  hourly_rate?: number
  experience_years?: number
  availability_status: string
  primary_roles: string[]
  skills: string[]
  languages: string[]
  tags: string[]
  social_media_links: any
  demo_scenes: any[]
  is_verified: boolean
  is_premium: boolean
  booking_enabled: boolean
  public_contact: boolean
  profile_views: number
  average_rating: number
  total_reviews: number
  education: any[]
  experience: any[]
  awards: any[]
  reviews: any[]
}

interface MediaFile {
  id: string
  title: string
  description: string
  media_type: "image" | "video"
  file_url: string
  blob_url: string
  thumbnail_url?: string
  is_featured: boolean
  is_profile_picture: boolean
  tags: string[]
  file_size: number
  created_at: string
}

export default function ProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("about")
  const [media, setMedia] = useState<MediaFile[]>([])
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for ID:", id)

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("author_profiles")
          .select("*")
          .eq("id", id)
          .single()

        if (profileError) {
          console.error("Profile fetch error:", profileError)
          setError("Failed to load profile: " + profileError.message)
          setLoading(false)
          return
        }

        if (!profileData) {
          setError("Profile not found")
          setLoading(false)
          return
        }

        console.log("Profile data loaded:", profileData)
        setProfile(profileData)

        // Fetch media files for this user
        const { data: mediaData, error: mediaError } = await supabase
          .from("user_media")
          .select("*")
          .eq("user_id", profileData.user_id)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })

        if (mediaError) {
          console.error("Media fetch error:", mediaError)
        } else {
          console.log("Media data loaded:", mediaData?.length || 0, "files")
          setMedia(mediaData || [])
        }

        // Increment profile views
        const { error: updateError } = await supabase
          .from("author_profiles")
          .update({ profile_views: (profileData.profile_views || 0) + 1 })
          .eq("id", id)

        if (updateError) {
          console.error("Failed to update profile views:", updateError)
        }

        setLoading(false)
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred")
        setLoading(false)
      }
    }

    if (id) {
      fetchProfile()
    }
  }, [id])

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "youtube":
        return <Youtube className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      case "facebook":
        return <Facebook className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-red-500 mb-4">{error || "Profile not found"}</p>
          <div className="space-x-2">
            <Button onClick={() => window.history.back()}>Go Back</Button>
            <Button asChild variant="outline">
              <a href="/">Home</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const displayName = profile.display_name || profile.stage_name || profile.full_name || "User"
  const age = calculateAge(profile.date_of_birth)
  const profilePicture =
    media.find((m) => m.is_profile_picture)?.blob_url ||
    media.find((m) => m.is_profile_picture)?.file_url ||
    media.find((m) => m.media_type === "image")?.blob_url ||
    media.find((m) => m.media_type === "image")?.file_url ||
    profile.blob_url ||
    profile.avatar_url

  const images = media.filter((m) => m.media_type === "image")
  const videos = media.filter((m) => m.media_type === "video")

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="sticky top-20 space-y-6">
            <div className="overflow-hidden rounded-lg border bg-white shadow">
              <div className="p-6">
                <div className="mx-auto mb-4 h-48 w-48 overflow-hidden rounded-full">
                  <Image
                    src={profilePicture || "/placeholder.svg?height=200&width=200&query=professional+headshot"}
                    alt={displayName}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h1 className="text-center text-2xl font-bold">{displayName}</h1>
                <p className="text-center text-muted-foreground">
                  {profile.primary_roles && profile.primary_roles.length > 0
                    ? profile.primary_roles.join(", ")
                    : "Professional"}
                </p>

                <div className="mt-4 flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{profile.average_rating || "4.5"}</span>
                  <span className="text-muted-foreground">({profile.total_reviews || "0"} reviews)</span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{profile.city || "Location not specified"}</span>
                  </div>
                  {profile.contact_email && profile.public_contact && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span>{profile.contact_email}</span>
                    </div>
                  )}
                  {profile.contact_phone && profile.public_contact && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{profile.contact_phone}</span>
                    </div>
                  )}
                  {profile.imdb_url && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a
                        href={profile.imdb_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        IMDb Profile
                      </a>
                    </div>
                  )}
                  {profile.availability_status && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="capitalize">{profile.availability_status}</span>
                    </div>
                  )}
                </div>

                {profile.social_media_links && (
                  <div className="mt-6 flex justify-center gap-3">
                    {Object.entries(profile.social_media_links).map(
                      ([platform, url]) =>
                        url && (
                          <a
                            key={platform}
                            href={url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
                          >
                            {getSocialIcon(platform)}
                          </a>
                        ),
                    )}
                  </div>
                )}

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button className="w-full bg-secondary hover:bg-secondary/90">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Heart className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>

                {/* Physical Attributes */}
                {(profile.height || profile.body_type || profile.age_range) && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-3">Physical Attributes</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      {profile.height && (
                        <>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Height:</span>
                          </div>
                          <div>{profile.height}</div>
                        </>
                      )}

                      {profile.body_type && (
                        <>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Body Type:</span>
                          </div>
                          <div className="capitalize">{profile.body_type}</div>
                        </>
                      )}

                      {profile.age_range && (
                        <>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Age Range:</span>
                          </div>
                          <div>{profile.age_range}</div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="mt-6 pt-6 border-t text-center">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-semibold">{profile.profile_views || 0}</div>
                      <div className="text-muted-foreground">Views</div>
                    </div>
                    <div>
                      <div className="font-semibold">{images.length}</div>
                      <div className="text-muted-foreground">Photos</div>
                    </div>
                    <div>
                      <div className="font-semibold">{videos.length}</div>
                      <div className="text-muted-foreground">Videos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full border-b rounded-none justify-start">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="gallery">Gallery ({media.length})</TabsTrigger>
              {profile.experience && profile.experience.length > 0 && (
                <TabsTrigger value="experience">Experience</TabsTrigger>
              )}
              {profile.awards && profile.awards.length > 0 && <TabsTrigger value="awards">Awards</TabsTrigger>}
              {profile.reviews && profile.reviews.length > 0 && <TabsTrigger value="reviews">Reviews</TabsTrigger>}
            </TabsList>

            <TabsContent value="about" className="space-y-6 pt-4">
              {/* Bio Section */}
              <section className="rounded-lg border bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-bold">About {displayName}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.resume_bio || profile.bio || "No bio information provided."}
                </p>
                {profile.known_for && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Known For</h3>
                    <p className="text-muted-foreground">{profile.known_for}</p>
                  </div>
                )}
              </section>

              {/* Skills Section */}
              {profile.skills && profile.skills.length > 0 && (
                <section className="rounded-lg border bg-white p-6 shadow">
                  <h2 className="mb-4 text-xl font-bold">Skills & Languages</h2>
                  <div className="mb-4">
                    <h3 className="mb-2 font-medium">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-100 hover:bg-gray-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {profile.languages && profile.languages.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-medium">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map((language, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-100 hover:bg-gray-200">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Professional Details */}
              <section className="rounded-lg border bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-bold">Professional Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      {profile.experience_years && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Experience:</span>
                          <span>{profile.experience_years} years</span>
                        </div>
                      )}
                      {profile.representation && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Representation:</span>
                          <span className="capitalize">{profile.representation}</span>
                        </div>
                      )}
                      {profile.hourly_rate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rate:</span>
                          <span>₹{profile.hourly_rate.toLocaleString()}/day</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      {profile.gender && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gender:</span>
                          <span className="capitalize">{profile.gender}</span>
                        </div>
                      )}
                      {age && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age:</span>
                          <span>{age} years</span>
                        </div>
                      )}
                      {profile.nationality && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nationality:</span>
                          <span>{profile.nationality}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="gallery" className="pt-4">
              <section className="rounded-lg border bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-bold">Gallery</h2>

                <Tabs defaultValue="images">
                  <TabsList className="mb-4">
                    <TabsTrigger value="images">Images ({images.length})</TabsTrigger>
                    <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="images">
                    {images.length === 0 ? (
                      <div className="text-center py-10">
                        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No images available</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className="cursor-pointer overflow-hidden rounded-lg relative group"
                            onClick={() => setSelectedMedia(image)}
                          >
                            <img
                              src={image.blob_url || image.file_url || "/placeholder.svg"}
                              alt={image.title || `Gallery image ${index + 1}`}
                              className="h-40 w-full object-cover transition-transform hover:scale-105"
                            />
                            {image.is_featured && (
                              <div className="absolute top-2 left-2">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              </div>
                            )}
                            {image.is_profile_picture && (
                              <div className="absolute top-2 right-2">
                                <User className="h-4 w-4 text-blue-400 fill-blue-400" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="videos">
                    {videos.length === 0 ? (
                      <div className="text-center py-10">
                        <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No videos available</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {videos.map((video, index) => (
                          <div
                            key={index}
                            className="cursor-pointer overflow-hidden rounded-md relative group"
                            onClick={() => setSelectedMedia(video)}
                          >
                            <div className="h-40 w-full bg-gray-900 flex items-center justify-center">
                              {video.thumbnail_url ? (
                                <img
                                  src={video.thumbnail_url || "/placeholder.svg"}
                                  alt={video.title || "Video thumbnail"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Video className="h-8 w-8 text-white" />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="h-8 w-8 text-white opacity-80" />
                              </div>
                            </div>
                            {video.is_featured && (
                              <div className="absolute top-2 left-2">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              </div>
                            )}
                            <p className="text-sm font-medium mt-2 truncate">{video.title}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </section>
            </TabsContent>

            {profile.experience && profile.experience.length > 0 && (
              <TabsContent value="experience" className="pt-4">
                <section className="rounded-lg border bg-white p-6 shadow">
                  <h2 className="mb-4 text-xl font-bold">Experience</h2>
                  <div className="space-y-4">
                    {profile.experience.map((exp: any, index: number) => (
                      <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">
                            {exp.title} - {exp.project}
                          </h3>
                          <span className="text-sm text-muted-foreground">{exp.year}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </TabsContent>
            )}

            {profile.awards && profile.awards.length > 0 && (
              <TabsContent value="awards" className="pt-4">
                <section className="rounded-lg border bg-white p-6 shadow">
                  <h2 className="mb-4 text-xl font-bold">Awards & Recognition</h2>
                  <div className="space-y-4">
                    {profile.awards.map((award: any, index: number) => (
                      <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                        <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{award.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {award.event}, {award.year}
                          </p>
                          <p className="text-sm text-muted-foreground">For: {award.project}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </TabsContent>
            )}

            {profile.reviews && profile.reviews.length > 0 && (
              <TabsContent value="reviews" className="pt-4">
                <section className="rounded-lg border bg-white p-6 shadow">
                  <h2 className="mb-4 text-xl font-bold">Reviews</h2>
                  <div className="space-y-6">
                    {profile.reviews.map((review: any, index: number) => (
                      <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium">{review.name}</h3>
                            <p className="text-sm text-muted-foreground">{review.role}</p>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{review.date}</p>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">{selectedMedia.title}</h3>
              <Button variant="ghost" onClick={() => setSelectedMedia(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {selectedMedia.media_type === "image" ? (
                <img
                  src={selectedMedia.blob_url || selectedMedia.file_url}
                  alt={selectedMedia.title}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              ) : (
                <video
                  src={selectedMedia.blob_url || selectedMedia.file_url}
                  controls
                  className="max-w-full max-h-[70vh] mx-auto"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{selectedMedia.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMedia.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
