"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, Save, Loader2, Star, Award, Film, User, Contact, Settings, Trash2, Edit } from "lucide-react"

interface ProfileData {
  full_name: string
  stage_name: string
  display_name: string
  gender: string
  date_of_birth: string
  nationality: string
  city: string
  bio: string
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
  booking_enabled: boolean
  public_contact: boolean
  hourly_rate: string
  experience_years: string
  availability_status: string
  resume_bio: string
}

interface FilmographyItem {
  id?: string
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
  id?: string
  award_name: string
  category: string
  year: number
  organization: string
  project_name: string
  description: string
}

const PRIMARY_ROLES = [
  "Actor",
  "Actress",
  "Director",
  "Producer",
  "Cinematographer",
  "Editor",
  "Music Director",
  "Playback Singer",
  "Choreographer",
  "Art Director",
  "Costume Designer",
  "Makeup Artist",
  "Sound Engineer",
  "VFX Artist",
  "Stunt Director",
  "Assistant Director",
  "Script Writer",
  "Lyricist",
]

const LANGUAGES = [
  "Hindi",
  "English",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Kannada",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "Assamese",
  "Odia",
  "Sanskrit",
]

const SKILLS = [
  "Method Acting",
  "Classical Acting",
  "Voice Acting",
  "Dubbing",
  "Dancing",
  "Singing",
  "Martial Arts",
  "Horse Riding",
  "Swimming",
  "Driving",
  "Stunts",
  "Mimicry",
  "Stand-up Comedy",
  "Theatre",
  "Improvisation",
]

export function FilmIndustryProfileForm() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Profile Data
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    stage_name: "",
    display_name: "",
    gender: "",
    date_of_birth: "",
    nationality: "",
    city: "",
    bio: "",
    known_for: "",
    height: "",
    body_type: "",
    age_range: "",
    representation: "",
    contact_email: "",
    contact_phone: "",
    profile_video_url: "",
    demo_reel_url: "",
    imdb_url: "",
    booking_enabled: true,
    public_contact: false,
    hourly_rate: "",
    experience_years: "",
    availability_status: "available",
    resume_bio: "",
  })

  // Multi-select fields
  const [primaryRoles, setPrimaryRoles] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  // Social Media Links
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    youtube: "",
    linkedin: "",
    twitter: "",
    facebook: "",
  })

  // Demo Scenes
  const [demoScenes, setDemoScenes] = useState<Array<{ title: string; url: string; description: string }>>([])

  // Filmography
  const [filmography, setFilmography] = useState<FilmographyItem[]>([])
  const [editingFilm, setEditingFilm] = useState<FilmographyItem | null>(null)

  // Awards
  const [awards, setAwards] = useState<AwardItem[]>([])
  const [editingAward, setEditingAward] = useState<AwardItem | null>(null)

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    if (!user) return

    try {
      // Load profile
      const { data: profile } = await supabase.from("author_profiles").select("*").eq("user_id", user.id).single()

      if (profile) {
        setProfileData({
          full_name: profile.full_name || "",
          stage_name: profile.stage_name || "",
          display_name: profile.display_name || profile.full_name || "",
          gender: profile.gender || "",
          date_of_birth: profile.date_of_birth || "",
          nationality: profile.nationality || "",
          city: profile.city || "",
          bio: profile.bio || "",
          known_for: profile.known_for || "",
          height: profile.height || "",
          body_type: profile.body_type || "",
          age_range: profile.age_range || "",
          representation: profile.representation || "",
          contact_email: profile.contact_email || user.email || "",
          contact_phone: profile.contact_phone || "",
          profile_video_url: profile.profile_video_url || "",
          demo_reel_url: profile.demo_reel_url || "",
          imdb_url: profile.imdb_url || "",
          booking_enabled: profile.booking_enabled ?? true,
          public_contact: profile.public_contact ?? false,
          hourly_rate: profile.hourly_rate?.toString() || "",
          experience_years: profile.experience_years?.toString() || "",
          availability_status: profile.availability_status || "available",
          resume_bio: profile.resume_bio || "",
        })

        setPrimaryRoles(profile.primary_roles || [])
        setLanguages(profile.languages || [])
        setSkills(profile.skills || [])
        setTags(profile.tags || [])
        setSocialLinks(
          profile.social_media_links || {
            instagram: "",
            youtube: "",
            linkedin: "",
            twitter: "",
            facebook: "",
          },
        )
        setDemoScenes(profile.demo_scenes || [])
      } else {
        // Create initial profile if doesn't exist
        setProfileData((prev) => ({
          ...prev,
          contact_email: user.email || "",
          display_name: user.email?.split("@")[0] || "",
        }))
      }

      // Load filmography
      const { data: filmData } = await supabase
        .from("filmography")
        .select("*")
        .eq("user_id", user.id)
        .order("year", { ascending: false })

      if (filmData) {
        setFilmography(filmData)
      }

      // Load awards
      const { data: awardData } = await supabase
        .from("awards")
        .select("*")
        .eq("user_id", user.id)
        .order("year", { ascending: false })

      if (awardData) {
        setAwards(awardData)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const saveProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const updateData = {
        user_id: user.id,
        ...profileData,
        hourly_rate: profileData.hourly_rate ? Number.parseFloat(profileData.hourly_rate) : null,
        experience_years: profileData.experience_years ? Number.parseInt(profileData.experience_years) : null,
        primary_roles: primaryRoles,
        languages,
        skills,
        tags,
        social_media_links: socialLinks,
        demo_scenes: demoScenes,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("author_profiles").upsert(updateData)

      if (error) throw error
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  // Filmography CRUD operations
  const saveFilmography = async (film: FilmographyItem) => {
    if (!user) return

    try {
      if (film.id) {
        // Update existing
        const { error } = await supabase
          .from("filmography")
          .update({
            ...film,
            updated_at: new Date().toISOString(),
          })
          .eq("id", film.id)

        if (error) throw error

        setFilmography((prev) => prev.map((f) => (f.id === film.id ? film : f)))
      } else {
        // Create new
        const { data, error } = await supabase
          .from("filmography")
          .insert({ ...film, user_id: user.id })
          .select()
          .single()

        if (error) throw error
        setFilmography((prev) => [data, ...prev])
      }

      setEditingFilm(null)
      alert("Filmography saved successfully!")
    } catch (error) {
      console.error("Error saving filmography:", error)
      alert("Failed to save filmography")
    }
  }

  const deleteFilmography = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const { error } = await supabase.from("filmography").delete().eq("id", id)
      if (error) throw error

      setFilmography((prev) => prev.filter((f) => f.id !== id))
      alert("Project deleted successfully!")
    } catch (error) {
      console.error("Error deleting filmography:", error)
      alert("Failed to delete project")
    }
  }

  // Awards CRUD operations
  const saveAward = async (award: AwardItem) => {
    if (!user) return

    try {
      if (award.id) {
        // Update existing
        const { error } = await supabase
          .from("awards")
          .update({
            ...award,
            updated_at: new Date().toISOString(),
          })
          .eq("id", award.id)

        if (error) throw error

        setAwards((prev) => prev.map((a) => (a.id === award.id ? award : a)))
      } else {
        // Create new
        const { data, error } = await supabase
          .from("awards")
          .insert({ ...award, user_id: user.id })
          .select()
          .single()

        if (error) throw error
        setAwards((prev) => [data, ...prev])
      }

      setEditingAward(null)
      alert("Award saved successfully!")
    } catch (error) {
      console.error("Error saving award:", error)
      alert("Failed to save award")
    }
  }

  const deleteAward = async (id: string) => {
    if (!confirm("Are you sure you want to delete this award?")) return

    try {
      const { error } = await supabase.from("awards").delete().eq("id", id)
      if (error) throw error

      setAwards((prev) => prev.filter((a) => a.id !== id))
      alert("Award deleted successfully!")
    } catch (error) {
      console.error("Error deleting award:", error)
      alert("Failed to delete award")
    }
  }

  const toggleRole = (role: string) => {
    setPrimaryRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  const toggleLanguage = (language: string) => {
    setLanguages((prev) => (prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]))
  }

  const toggleSkill = (skill: string) => {
    setSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const addDemoScene = () => {
    setDemoScenes([...demoScenes, { title: "", url: "", description: "" }])
  }

  const updateDemoScene = (index: number, field: string, value: string) => {
    const updated = [...demoScenes]
    updated[index] = { ...updated[index], [field]: value }
    setDemoScenes(updated)
  }

  const removeDemoScene = (index: number) => {
    setDemoScenes(demoScenes.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Film Industry Profile</h1>
        <p className="text-muted-foreground">
          Create a comprehensive profile to showcase your talent and attract opportunities
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            Professional
          </TabsTrigger>
          <TabsTrigger value="filmography" className="flex items-center gap-1">
            <Film className="h-4 w-4" />
            Filmography
          </TabsTrigger>
          <TabsTrigger value="awards" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            Awards
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-1">
            <Contact className="h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    placeholder="Your real name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage_name">Stage Name / Professional Name</Label>
                  <Input
                    id="stage_name"
                    value={profileData.stage_name}
                    onChange={(e) => setProfileData({ ...profileData, stage_name: e.target.value })}
                    placeholder="Name you're known by professionally"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                    placeholder="Name shown on your profile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profileData.gender}
                    onValueChange={(value) => setProfileData({ ...profileData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={(e) => setProfileData({ ...profileData, date_of_birth: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={profileData.nationality}
                    onChange={(e) => setProfileData({ ...profileData, nationality: e.target.value })}
                    placeholder="e.g., Indian, American"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Current City</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="e.g., Mumbai, Chennai, Delhi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={profileData.height}
                    onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                    placeholder="e.g., 5'8&quot;, 170cm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body_type">Body Type</Label>
                  <Select
                    value={profileData.body_type}
                    onValueChange={(value) => setProfileData({ ...profileData, body_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slim">Slim</SelectItem>
                      <SelectItem value="athletic">Athletic</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="muscular">Muscular</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="known_for">Known For</Label>
                  <Input
                    id="known_for"
                    value={profileData.known_for}
                    onChange={(e) => setProfileData({ ...profileData, known_for: e.target.value })}
                    placeholder="Famous work(s) or notable projects"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio / About</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself, your journey, and what makes you unique..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume_bio">Detailed Resume/Bio</Label>
                <Textarea
                  id="resume_bio"
                  value={profileData.resume_bio}
                  onChange={(e) => setProfileData({ ...profileData, resume_bio: e.target.value })}
                  placeholder="Detailed background, achievements, training, etc..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Details Tab */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Roles */}
              <div className="space-y-4">
                <Label>Primary Roles (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {PRIMARY_ROLES.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={primaryRoles.includes(role)}
                        onCheckedChange={() => toggleRole(role)}
                      />
                      <Label htmlFor={role} className="text-sm">
                        {role}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-4">
                <Label>Languages Known</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {LANGUAGES.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={language}
                        checked={languages.includes(language)}
                        onCheckedChange={() => toggleLanguage(language)}
                      />
                      <Label htmlFor={language} className="text-sm">
                        {language}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <Label>Skills & Specializations</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SKILLS.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={skills.includes(skill)}
                        onCheckedChange={() => toggleSkill(skill)}
                      />
                      <Label htmlFor={skill} className="text-sm">
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience and Rates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    value={profileData.experience_years}
                    onChange={(e) => setProfileData({ ...profileData, experience_years: e.target.value })}
                    placeholder="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Rate per Day (₹)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={profileData.hourly_rate}
                    onChange={(e) => setProfileData({ ...profileData, hourly_rate: e.target.value })}
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age_range">Age Range for Roles</Label>
                  <Select
                    value={profileData.age_range}
                    onValueChange={(value) => setProfileData({ ...profileData, age_range: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18-25</SelectItem>
                      <SelectItem value="25-35">25-35</SelectItem>
                      <SelectItem value="35-45">35-45</SelectItem>
                      <SelectItem value="45-55">45-55</SelectItem>
                      <SelectItem value="55+">55+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <Label>Tags (for better discoverability)</Label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag (e.g., Tamil Actor, Bollywood, Method Actor)"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Media Links */}
              <div className="space-y-4">
                <Label>Media & Portfolio Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile_video_url">Profile Video / Reel URL</Label>
                    <Input
                      id="profile_video_url"
                      value={profileData.profile_video_url}
                      onChange={(e) => setProfileData({ ...profileData, profile_video_url: e.target.value })}
                      placeholder="YouTube or Vimeo link"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demo_reel_url">Demo Reel URL</Label>
                    <Input
                      id="demo_reel_url"
                      value={profileData.demo_reel_url}
                      onChange={(e) => setProfileData({ ...profileData, demo_reel_url: e.target.value })}
                      placeholder="Demo reel or showreel link"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imdb_url">IMDb Profile URL</Label>
                    <Input
                      id="imdb_url"
                      value={profileData.imdb_url}
                      onChange={(e) => setProfileData({ ...profileData, imdb_url: e.target.value })}
                      placeholder="https://www.imdb.com/name/..."
                    />
                  </div>
                </div>
              </div>

              {/* Demo Scenes */}
              <div className="space-y-4">
                <Label>Demo Scenes</Label>
                {demoScenes.map((scene, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <Input
                      value={scene.title}
                      onChange={(e) => updateDemoScene(index, "title", e.target.value)}
                      placeholder="Scene title"
                    />
                    <Input
                      value={scene.url}
                      onChange={(e) => updateDemoScene(index, "url", e.target.value)}
                      placeholder="Video URL"
                    />
                    <Textarea
                      value={scene.description}
                      onChange={(e) => updateDemoScene(index, "description", e.target.value)}
                      placeholder="Scene description"
                      rows={2}
                    />
                    <Button variant="destructive" size="sm" onClick={() => removeDemoScene(index)}>
                      <X className="h-4 w-4 mr-2" />
                      Remove Scene
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addDemoScene}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Demo Scene
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Filmography Tab */}
        <TabsContent value="filmography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filmography & Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Filmography */}
              {filmography.map((film) => (
                <div key={film.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{film.project_name}</h3>
                      <p className="text-muted-foreground">
                        {film.role} • {film.year} • {film.language}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {film.director && `Dir: ${film.director}`}{" "}
                        {film.production_house && `• ${film.production_house}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{film.project_type}</Badge>
                      {film.is_featured && <Badge variant="default">Featured</Badge>}
                      <Button variant="outline" size="sm" onClick={() => setEditingFilm(film)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteFilmography(film.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">{film.description}</p>
                </div>
              ))}

              {/* Add/Edit Filmography Form */}
              <div className="border-2 border-dashed rounded-lg p-4">
                <h3 className="font-semibold mb-4">{editingFilm ? "Edit Project" : "Add New Project"}</h3>
                <FilmographyForm
                  film={
                    editingFilm || {
                      project_name: "",
                      project_type: "",
                      role: "",
                      year: new Date().getFullYear(),
                      director: "",
                      production_house: "",
                      language: "",
                      genre: "",
                      description: "",
                      project_url: "",
                      is_featured: false,
                    }
                  }
                  onSave={saveFilmography}
                  onCancel={() => setEditingFilm(null)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Awards Tab */}
        <TabsContent value="awards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Awards & Recognitions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Awards */}
              {awards.map((award) => (
                <div key={award.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{award.award_name}</h3>
                      <p className="text-muted-foreground">
                        {award.category} • {award.year}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {award.organization} {award.project_name && `• For: ${award.project_name}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingAward(award)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteAward(award.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">{award.description}</p>
                </div>
              ))}

              {/* Add/Edit Award Form */}
              <div className="border-2 border-dashed rounded-lg p-4">
                <h3 className="font-semibold mb-4">{editingAward ? "Edit Award" : "Add New Award"}</h3>
                <AwardForm
                  award={
                    editingAward || {
                      award_name: "",
                      category: "",
                      year: new Date().getFullYear(),
                      organization: "",
                      project_name: "",
                      description: "",
                    }
                  }
                  onSave={saveAward}
                  onCancel={() => setEditingAward(null)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={profileData.contact_email}
                    onChange={(e) => setProfileData({ ...profileData, contact_email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={profileData.contact_phone}
                    onChange={(e) => setProfileData({ ...profileData, contact_phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="representation">Representation</Label>
                  <Select
                    value={profileData.representation}
                    onValueChange={(value) => setProfileData({ ...profileData, representation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select representation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="agent">Represented by Agent</SelectItem>
                      <SelectItem value="production_house">Production House</SelectItem>
                      <SelectItem value="talent_agency">Talent Agency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <Label>Social Media Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                      placeholder="https://instagram.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={socialLinks.youtube}
                      onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                      placeholder="https://youtube.com/channel/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={socialLinks.linkedin}
                      onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={socialLinks.twitter}
                      onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="availability_status">Availability Status</Label>
                <Select
                  value={profileData.availability_status}
                  onValueChange={(value) => setProfileData({ ...profileData, availability_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available for Work</SelectItem>
                    <SelectItem value="busy">Currently Busy</SelectItem>
                    <SelectItem value="unavailable">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="booking_enabled"
                  checked={profileData.booking_enabled}
                  onCheckedChange={(checked) => setProfileData({ ...profileData, booking_enabled: checked as boolean })}
                />
                <Label htmlFor="booking_enabled">Enable booking requests</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="public_contact"
                  checked={profileData.public_contact}
                  onCheckedChange={(checked) => setProfileData({ ...profileData, public_contact: checked as boolean })}
                />
                <Label htmlFor="public_contact">Make contact information publicly visible</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button onClick={saveProfile} disabled={loading} size="lg">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Profile
        </Button>
      </div>
    </div>
  )
}

// Filmography Form Component
function FilmographyForm({
  film,
  onSave,
  onCancel,
}: {
  film: FilmographyItem
  onSave: (film: FilmographyItem) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<FilmographyItem>(film)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.project_name || !formData.role) {
      alert("Project name and role are required")
      return
    }
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Project Name *</Label>
          <Input
            value={formData.project_name}
            onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
            placeholder="Movie/Series Name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Your Role *</Label>
          <Input
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Lead Actor, Supporting Actor, Director, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Project Type</Label>
          <Select
            value={formData.project_type}
            onValueChange={(value) => setFormData({ ...formData, project_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Feature Film">Feature Film</SelectItem>
              <SelectItem value="Short Film">Short Film</SelectItem>
              <SelectItem value="Web Series">Web Series</SelectItem>
              <SelectItem value="TV Series">TV Series</SelectItem>
              <SelectItem value="Documentary">Documentary</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
              <SelectItem value="Music Video">Music Video</SelectItem>
              <SelectItem value="Theatre">Theatre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Year</Label>
          <Input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
            placeholder="2024"
          />
        </div>

        <div className="space-y-2">
          <Label>Director</Label>
          <Input
            value={formData.director}
            onChange={(e) => setFormData({ ...formData, director: e.target.value })}
            placeholder="Director Name"
          />
        </div>

        <div className="space-y-2">
          <Label>Production House</Label>
          <Input
            value={formData.production_house}
            onChange={(e) => setFormData({ ...formData, production_house: e.target.value })}
            placeholder="Production Company"
          />
        </div>

        <div className="space-y-2">
          <Label>Language</Label>
          <Input
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            placeholder="Hindi, Tamil, English, etc."
          />
        </div>

        <div className="space-y-2">
          <Label>Genre</Label>
          <Input
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            placeholder="Drama, Action, Comedy, etc."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Project URL</Label>
        <Input
          value={formData.project_url}
          onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
          placeholder="Link to project (IMDb, trailer, etc.)"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the project and your role..."
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured_film"
          checked={formData.is_featured}
          onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
        />
        <Label htmlFor="featured_film">Mark as featured work</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Save Project
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

// Award Form Component
function AwardForm({
  award,
  onSave,
  onCancel,
}: {
  award: AwardItem
  onSave: (award: AwardItem) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<AwardItem>(award)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.award_name) {
      alert("Award name is required")
      return
    }
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Award Name *</Label>
          <Input
            value={formData.award_name}
            onChange={(e) => setFormData({ ...formData, award_name: e.target.value })}
            placeholder="Best Actor, Filmfare Award, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Best Actor, Best Director, etc."
          />
        </div>

        <div className="space-y-2">
          <Label>Year</Label>
          <Input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
            placeholder="2024"
          />
        </div>

        <div className="space-y-2">
          <Label>Organization</Label>
          <Input
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            placeholder="Filmfare, National Film Awards, etc."
          />
        </div>

        <div className="space-y-2">
          <Label>Project Name</Label>
          <Input
            value={formData.project_name}
            onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
            placeholder="Movie/Project for which award was received"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Additional details about the award..."
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Save Award
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
