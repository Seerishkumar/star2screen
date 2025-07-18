"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Briefcase,
  Camera,
  Video,
  MessageCircle,
  Heart,
  Play,
  X,
  Award,
  Film,
  User,
  Calendar,
  Eye,
  ExternalLink,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Facebook,
  Edit,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ProfileData {
  id: string
  full_name: string
  stage_name: string
  display_name: string
  bio: string
  avatar_url?: string
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
  resume_bio: string
  demo_scenes: any[]
  is_verified: boolean
  is_premium: boolean
  booking_enabled: boolean
  public_contact: boolean
  profile_views: number
  average_rating: number
  total_reviews: number
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

interface FilmographyItem {
  id: string
  project_name: string
  project_type: string
  role: string
  year: number
  director: string
  production_house: string
  language: string
  genre: string
  description: string
  project_url: string
  is_featured: boolean
}

interface AwardItem {
  id: string
  award_name: string
  category: string
  year: number
  organization: string
  project_name: string
  description: string
}

export function FilmIndustryProfileView({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [filmography, setFilmography] = useState<FilmographyItem[]>([])
  const [awards, setAwards] = useState<AwardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("about")
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null)

  useEffect(() => {
    loadProfileData()
  }, [userId])

  const loadProfileData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase.from("author_profiles").select("*").eq("user_id", userId).single()

      if (profileData) {
        setProfile(profileData)
        // Increment profile views
        await supabase
          .from("author_profiles")
          .update({ profile_views: (profileData.profile_views || 0) + 1 })
          .eq("user_id", userId)
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

      // Load filmography
      const { data: filmData } = await supabase
        .from("filmography")
        .select("*")
        .eq("user_id", userId)
        .order("year", { ascending: false })

      if (filmData) {
        setFilmography(filmData)
      }

      // Load awards
      const { data: awardData } = await supabase
        .from("awards")
        .select("*")
        .eq("user_id", userId)
        .order("year", { ascending: false })

      if (awardData) {
        setAwards(awardData)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

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
      case "linkedin":
        return <Linkedin className="h-4 w-4" />
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
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <Card>
          <CardContent className="p-8">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Profile Found</h2>
            <p className="text-muted-foreground mb-4">This user hasn't created their profile yet.</p>
            <Button asChild>
              <Link href="/profile?tab=edit">
                <Edit className="mr-2 h-4 w-4" />
                Create Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = profile.display_name || profile.stage_name || profile.full_name || "User"
  const age = calculateAge(profile.date_of_birth)
  const profilePicture =
    mediaFiles.find((m) => m.is_profile_picture)?.blob_url ||
    mediaFiles.find((m) => m.is_profile_picture)?.file_url ||
    mediaFiles.find((m) => m.media_type === "image")?.blob_url ||
    mediaFiles.find((m) => m.media_type === "image")?.file_url
  const featuredMedia = mediaFiles.filter((m) => m.is_featured)
  const featuredFilmography = filmography.filter((f) => f.is_featured)

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Picture & Basic Info */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="h-48 w-48 rounded-lg overflow-hidden border-4 border-primary">
                  <Image
                    src={profilePicture || "/placeholder.svg?height=192&width=192&query=professional+headshot"}
                    alt={displayName}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
                {profile.is_verified && (
                  <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-2">
                    <Star className="h-5 w-5 text-white fill-white" />
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.profile_views || 0} profile views</span>
                </div>
                {profile.average_rating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>
                      {profile.average_rating}/5 ({profile.total_reviews} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold flex items-center gap-3">
                    {displayName}
                    {profile.is_premium && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        PRO
                      </Badge>
                    )}
                  </h1>

                  {profile.full_name !== profile.stage_name && profile.stage_name && (
                    <p className="text-lg text-muted-foreground mt-1">({profile.full_name})</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mt-3">
                    {profile.primary_roles && profile.primary_roles.length > 0 && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{profile.primary_roles.join(", ")}</span>
                      </div>
                    )}

                    {profile.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {profile.city}
                          {profile.nationality && `, ${profile.nationality}`}
                        </span>
                      </div>
                    )}

                    {age && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{age} years old</span>
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

                <div className="flex gap-2 mt-4 lg:mt-0">
                  {profile.booking_enabled && (
                    <Button size="lg">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Book Now
                    </Button>
                  )}
                  <Button variant="outline" size="lg">
                    <Heart className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Availability & Rate */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge
                  variant={profile.availability_status === "available" ? "default" : "secondary"}
                  className={profile.availability_status === "available" ? "bg-green-500" : ""}
                >
                  {profile.availability_status === "available"
                    ? "Available for Work"
                    : profile.availability_status === "busy"
                      ? "Currently Busy"
                      : "Not Available"}
                </Badge>

                {profile.hourly_rate && (
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    ₹{profile.hourly_rate.toLocaleString()}/day
                  </Badge>
                )}

                {profile.age_range && <Badge variant="outline">Age Range: {profile.age_range}</Badge>}
              </div>

              {/* Bio */}
              <div className="mb-6">
                {profile.bio ? (
                  <p className="text-muted-foreground leading-relaxed text-lg">{profile.bio}</p>
                ) : (
                  <p className="text-muted-foreground italic">No bio available</p>
                )}
                {profile.known_for && (
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">Known for:</span> {profile.known_for}
                  </p>
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {profile.height && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="font-semibold">Height</div>
                    <div className="text-sm text-muted-foreground">{profile.height}</div>
                  </div>
                )}

                {profile.body_type && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="font-semibold">Body Type</div>
                    <div className="text-sm text-muted-foreground">{profile.body_type}</div>
                  </div>
                )}

                {profile.representation && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="font-semibold">Representation</div>
                    <div className="text-sm text-muted-foreground">{profile.representation}</div>
                  </div>
                )}

                {filmography.length > 0 && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="font-semibold">Projects</div>
                    <div className="text-sm text-muted-foreground">{filmography.length} films</div>
                  </div>
                )}
              </div>

              {/* Contact & Social Links */}
              <div className="flex flex-wrap gap-4 text-sm">
                {profile.public_contact && profile.contact_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{profile.contact_phone}</span>
                  </div>
                )}

                {profile.imdb_url && (
                  <a
                    href={profile.imdb_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    IMDb Profile
                  </a>
                )}

                {profile.social_media_links &&
                  Object.entries(profile.social_media_links).map(
                    ([platform, url]) =>
                      url && (
                        <a
                          key={platform}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          {getSocialIcon(platform)}
                          <span className="capitalize">{platform}</span>
                        </a>
                      ),
                  )}
              </div>
            </div>
          </div>

          {/* Skills, Languages, Tags */}
          <div className="mt-8 space-y-6">
            {profile.primary_roles && profile.primary_roles.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Primary Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.primary_roles.map((role, index) => (
                    <Badge key={index} variant="default" className="text-sm">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Skills & Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.languages && profile.languages.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.tags && profile.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-gray-100">
                      {tag}
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
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Featured Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredMedia.map((media) => (
                <div key={media.id} className="relative group cursor-pointer" onClick={() => setSelectedMedia(media)}>
                  <div className="aspect-square rounded-lg overflow-hidden">
                    {media.media_type === "image" ? (
                      <img
                        src={media.blob_url || media.file_url || "/placeholder.svg"}
                        alt={media.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        {media.thumbnail_url ? (
                          <img
                            src={media.thumbnail_url || "/placeholder.svg"}
                            alt={media.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-black flex items-center justify-center">
                            <Video className="h-8 w-8 text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-8 w-8 text-white opacity-80" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 left-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-sm font-medium mt-2 truncate">{media.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Links */}
      {(profile.profile_video_url || profile.demo_reel_url) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.profile_video_url && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Profile Video</h3>
                  <a
                    href={profile.profile_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Play className="h-4 w-4" />
                    Watch Profile Video
                  </a>
                </div>
              )}

              {profile.demo_reel_url && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Demo Reel</h3>
                  <a
                    href={profile.demo_reel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Play className="h-4 w-4" />
                    Watch Demo Reel
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Scenes */}
      {profile.demo_scenes && profile.demo_scenes.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Demo Scenes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.demo_scenes.map((scene, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{scene.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{scene.description}</p>
                  <a
                    href={scene.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Play className="h-4 w-4" />
                    Watch Scene
                    <ExternalLink className="h-3 w-3" />
                  </a>
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
          <TabsTrigger value="filmography">Filmography</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {displayName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {profile.resume_bio || profile.bio || "No detailed bio information available."}
                </p>

                {profile.known_for && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Known For</h3>
                    <p className="text-muted-foreground">{profile.known_for}</p>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Personal Details</h3>
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
                      {profile.height && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Height:</span>
                          <span>{profile.height}</span>
                        </div>
                      )}
                      {profile.body_type && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Body Type:</span>
                          <span className="capitalize">{profile.body_type}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Professional Details</h3>
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
                      {profile.age_range && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age Range for Roles:</span>
                          <span>{profile.age_range}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filmography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                Filmography ({filmography.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filmography.length === 0 ? (
                <div className="text-center py-8">
                  <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No filmography information available.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filmography.map((film) => (
                    <div key={film.id} className="border-l-4 border-primary pl-6 relative">
                      {film.is_featured && (
                        <div className="absolute -left-2 top-0">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 bg-white rounded-full" />
                        </div>
                      )}
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold">{film.project_name}</h3>
                          <p className="text-lg text-muted-foreground">{film.role}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline">{film.project_type}</Badge>
                            <Badge variant="outline">{film.year}</Badge>
                            {film.language && <Badge variant="outline">{film.language}</Badge>}
                            {film.genre && <Badge variant="outline">{film.genre}</Badge>}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        {film.director && (
                          <p>
                            <span className="font-medium">Director:</span> {film.director}
                          </p>
                        )}
                        {film.production_house && (
                          <p>
                            <span className="font-medium">Production:</span> {film.production_house}
                          </p>
                        )}
                      </div>

                      {film.description && <p className="text-sm mt-3">{film.description}</p>}

                      {film.project_url && (
                        <a
                          href={film.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline text-sm mt-2"
                        >
                          View Project <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Awards & Recognitions ({awards.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {awards.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No awards information available.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {awards.map((award) => (
                    <div key={award.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Award className="h-8 w-8 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{award.award_name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1 mb-2">
                          {award.category && <Badge variant="outline">{award.category}</Badge>}
                          <Badge variant="outline">{award.year}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {award.organization && (
                            <p>
                              <span className="font-medium">Organization:</span> {award.organization}
                            </p>
                          )}
                          {award.project_name && (
                            <p>
                              <span className="font-medium">For Project:</span> {award.project_name}
                            </p>
                          )}
                        </div>
                        {award.description && <p className="text-sm mt-2">{award.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  Images ({mediaFiles.filter((m) => m.media_type === "image").length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mediaFiles.filter((m) => m.media_type === "image").length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No images uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {mediaFiles
                      .filter((m) => m.media_type === "image")
                      .slice(0, 8)
                      .map((media) => (
                        <div
                          key={media.id}
                          className="relative group cursor-pointer"
                          onClick={() => setSelectedMedia(media)}
                        >
                          <div className="aspect-square rounded-lg overflow-hidden">
                            <img
                              src={media.blob_url || media.file_url || "/placeholder.svg"}
                              alt={media.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                          {media.is_featured && (
                            <div className="absolute top-2 left-2">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
                {mediaFiles.filter((m) => m.media_type === "image").length > 8 && (
                  <p className="text-center text-muted-foreground mt-4">
                    +{mediaFiles.filter((m) => m.media_type === "image").length - 8} more images
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Videos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Videos ({mediaFiles.filter((m) => m.media_type === "video").length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mediaFiles.filter((m) => m.media_type === "video").length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No videos uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mediaFiles
                      .filter((m) => m.media_type === "video")
                      .slice(0, 4)
                      .map((media) => (
                        <div
                          key={media.id}
                          className="relative group cursor-pointer"
                          onClick={() => setSelectedMedia(media)}
                        >
                          <div className="aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                            {media.thumbnail_url ? (
                              <img
                                src={media.thumbnail_url || "/placeholder.svg"}
                                alt={media.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Video className="h-8 w-8 text-white" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-8 w-8 text-white opacity-80" />
                            </div>
                          </div>
                          {media.is_featured && (
                            <div className="absolute top-2 left-2">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            </div>
                          )}
                          <p className="text-sm font-medium mt-2">{media.title}</p>
                        </div>
                      ))}
                  </div>
                )}
                {mediaFiles.filter((m) => m.media_type === "video").length > 4 && (
                  <p className="text-center text-muted-foreground mt-4">
                    +{mediaFiles.filter((m) => m.media_type === "video").length - 4} more videos
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
