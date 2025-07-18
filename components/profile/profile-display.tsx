"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Phone, Globe, Star, Briefcase, Camera, Video, MessageCircle, Heart } from "lucide-react"
import Image from "next/image"

interface ProfileData {
  id: string
  display_name: string
  bio: string
  avatar_url?: string
  phone?: string
  website?: string
  location?: string
  hourly_rate?: number
  experience_years?: number
  availability_status: string
  skills: string[]
  languages: string[]
  specialties: string[]
  is_verified: boolean
  is_premium: boolean
}

interface MediaFile {
  id: string
  title: string
  description: string
  media_type: "image" | "video"
  file_url: string
  is_featured: boolean
  tags: string[]
}

interface Experience {
  id: string
  title: string
  company: string
  project_name: string
  project_type: string
  start_date: string
  end_date: string
  is_current: boolean
  description: string
}

export function ProfileDisplay({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("about")

  useEffect(() => {
    loadProfileData()
  }, [userId])

  const loadProfileData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase.from("author_profiles").select("*").eq("user_id", userId).single()

      if (profileData) {
        setProfile(profileData)
      }

      // Load media files
      const { data: mediaData } = await supabase
        .from("user_media")
        .select("*")
        .eq("user_id", userId)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })

      if (mediaData) {
        setMediaFiles(mediaData)
      }

      // Load experiences
      const { data: expData } = await supabase
        .from("professional_experience")
        .select("*")
        .eq("user_id", userId)
        .order("start_date", { ascending: false })

      if (expData) {
        setExperiences(expData)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading profile...</div>
  }

  if (!profile) {
    return <div className="text-center p-8">Profile not found</div>
  }

  const profilePicture = mediaFiles.find((m) => m.media_type === "image" && m.file_url)?.file_url
  const featuredMedia = mediaFiles.filter((m) => m.is_featured)
  const portfolioImages = mediaFiles.filter((m) => m.media_type === "image")
  const portfolioVideos = mediaFiles.filter((m) => m.media_type === "video")

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-primary">
                  <Image
                    src={profilePicture || "/placeholder.svg?height=160&width=160&query=profile"}
                    alt={profile.display_name}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
                {profile.is_verified && (
                  <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1">
                    <Star className="h-4 w-4 text-white fill-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    {profile.display_name}
                    {profile.is_premium && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        PRO
                      </Badge>
                    )}
                  </h1>
                  <div className="flex items-center gap-4 text-muted-foreground mt-2">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.experience_years && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{profile.experience_years} years experience</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 md:mt-0">
                  <Button>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="outline">
                    <Heart className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Availability & Rate */}
              <div className="flex flex-wrap gap-4 mb-4">
                <Badge
                  variant={profile.availability_status === "available" ? "default" : "secondary"}
                  className={profile.availability_status === "available" ? "bg-green-500" : ""}
                >
                  {profile.availability_status === "available"
                    ? "Available"
                    : profile.availability_status === "busy"
                      ? "Busy"
                      : "Unavailable"}
                </Badge>
                {profile.hourly_rate && <Badge variant="outline">₹{profile.hourly_rate}/hour</Badge>}
              </div>

              {/* Bio */}
              <p className="text-muted-foreground mb-4">{profile.bio}</p>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                {profile.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Portfolio Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills & Languages */}
          <div className="mt-8 space-y-4">
            {profile.skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.languages.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language, index) => (
                    <Badge key={index} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Featured Media */}
      {featuredMedia.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Featured Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredMedia.map((media) => (
                <div key={media.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden">
                    {media.media_type === "image" ? (
                      <img
                        src={media.file_url || "/placeholder.svg"}
                        alt={media.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-sm font-medium mt-2 truncate">{media.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {profile.display_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{profile.bio || "No bio information available."}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Images ({portfolioImages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {portfolioImages.slice(0, 6).map((media) => (
                    <div key={media.id} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={media.file_url || "/placeholder.svg"}
                        alt={media.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
                {portfolioImages.length > 6 && (
                  <p className="text-center text-muted-foreground mt-4">+{portfolioImages.length - 6} more images</p>
                )}
              </CardContent>
            </Card>

            {/* Videos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Videos ({portfolioVideos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioVideos.slice(0, 3).map((media) => (
                    <div key={media.id} className="relative">
                      <div className="aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-sm font-medium mt-2">{media.title}</p>
                    </div>
                  ))}
                </div>
                {portfolioVideos.length > 3 && (
                  <p className="text-center text-muted-foreground mt-4">+{portfolioVideos.length - 3} more videos</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {experiences.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No experience information available.</p>
              ) : (
                <div className="space-y-6">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-primary pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{exp.title}</h3>
                          <p className="text-muted-foreground">
                            {exp.project_name} • {exp.company}
                          </p>
                        </div>
                        <Badge variant="outline">{exp.project_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                      </p>
                      <p className="text-sm">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews & Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">Reviews system coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
