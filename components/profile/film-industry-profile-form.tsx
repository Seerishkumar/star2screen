"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { Loader2, Plus, X, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ProfileData {
  display_name: string
  full_name: string
  stage_name: string
  bio: string
  resume_bio: string
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
  hourly_rate: number | null
  experience_years: number | null
  availability_status: string
  primary_roles: string[]
  skills: string[]
  languages: string[]
  tags: string[]
  social_media_links: Record<string, string>
  booking_enabled: boolean
  public_contact: boolean
}

export function FilmIndustryProfileForm() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: "",
    full_name: "",
    stage_name: "",
    bio: "",
    resume_bio: "",
    gender: "",
    date_of_birth: "",
    nationality: "",
    city: "",
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
    hourly_rate: null,
    experience_years: null,
    availability_status: "available",
    primary_roles: [],
    skills: [],
    languages: [],
    tags: [],
    social_media_links: {
      instagram: "",
      youtube: "",
      linkedin: "",
      twitter: "",
      facebook: "",
      website: "",
    },
    booking_enabled: false,
    public_contact: false,
  })

  const [newSkill, setNewSkill] = useState("")
  const [newLanguage, setNewLanguage] = useState("")
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      const { data: profile, error } = await supabase
        .from("author_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error)
        return
      }

      if (profile) {
        setProfileData({
          display_name: profile.display_name || "",
          full_name: profile.full_name || "",
          stage_name: profile.stage_name || "",
          bio: profile.bio || "",
          resume_bio: profile.resume_bio || "",
          gender: profile.gender || "",
          date_of_birth: profile.date_of_birth || "",
          nationality: profile.nationality || "",
          city: profile.city || "",
          known_for: profile.known_for || "",
          height: profile.height || "",
          body_type: profile.body_type || "",
          age_range: profile.age_range || "",
          representation: profile.representation || "",
          contact_email: profile.contact_email || "",
          contact_phone: profile.contact_phone || "",
          profile_video_url: profile.profile_video_url || "",
          demo_reel_url: profile.demo_reel_url || "",
          imdb_url: profile.imdb_url || "",
          hourly_rate: profile.hourly_rate,
          experience_years: profile.experience_years,
          availability_status: profile.availability_status || "available",
          primary_roles: profile.primary_roles || [],
          skills: profile.skills || [],
          languages: profile.languages || [],
          tags: profile.tags || [],
          social_media_links: profile.social_media_links || {
            instagram: "",
            youtube: "",
            linkedin: "",
            twitter: "",
            facebook: "",
            website: "",
          },
          booking_enabled: profile.booking_enabled || false,
          public_contact: profile.public_contact || false,
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase.from("author_profiles").upsert(
        {
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

      if (error) {
        console.error("Error saving profile:", error)
        toast({
          title: "Error",
          description: "Failed to save profile. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Profile saved successfully!",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((s) => s !== skill),
    })
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !profileData.languages.includes(newLanguage.trim())) {
      setProfileData({
        ...profileData,
        languages: [...profileData.languages, newLanguage.trim()],
      })
      setNewLanguage("")
    }
  }

  const removeLanguage = (language: string) => {
    setProfileData({
      ...profileData,
      languages: profileData.languages.filter((l) => l !== language),
    })
  }

  const addTag = () => {
    if (newTag.trim() && !profileData.tags.includes(newTag.trim())) {
      setProfileData({
        ...profileData,
        tags: [...profileData.tags, newTag.trim()],
      })
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setProfileData({
      ...profileData,
      tags: profileData.tags.filter((t) => t !== tag),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">Update your professional profile information</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Profile
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="skills">Skills & Media</TabsTrigger>
          <TabsTrigger value="contact">Contact & Social</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                    placeholder="Your professional display name"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    placeholder="Your full legal name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="stage_name">Stage Name</Label>
                <Input
                  id="stage_name"
                  value={profileData.stage_name}
                  onChange={(e) => setProfileData({ ...profileData, stage_name: e.target.value })}
                  placeholder="Your stage or screen name"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
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
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={profileData.nationality}
                    onChange={(e) => setProfileData({ ...profileData, nationality: e.target.value })}
                    placeholder="Your nationality"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="Your current city"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resume_bio">Professional Background</Label>
                <Textarea
                  id="resume_bio"
                  value={profileData.resume_bio}
                  onChange={(e) => setProfileData({ ...profileData, resume_bio: e.target.value })}
                  placeholder="Detailed professional background and experience..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    value={profileData.experience_years || ""}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        experience_years: e.target.value ? Number.parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="Years of experience"
                  />
                </div>
                <div>
                  <Label htmlFor="hourly_rate">Daily Rate (₹)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={profileData.hourly_rate || ""}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        hourly_rate: e.target.value ? Number.parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="Your daily rate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availability_status">Availability Status</Label>
                  <Select
                    value={profileData.availability_status}
                    onValueChange={(value) => setProfileData({ ...profileData, availability_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Currently Busy</SelectItem>
                      <SelectItem value="not-available">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="representation">Representation</Label>
                  <Select
                    value={profileData.representation}
                    onValueChange={(value) => setProfileData({ ...profileData, representation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select representation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self-represented">Self Represented</SelectItem>
                      <SelectItem value="agent-represented">Agent Represented</SelectItem>
                      <SelectItem value="manager-represented">Manager Represented</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="booking_enabled"
                    checked={profileData.booking_enabled}
                    onCheckedChange={(checked) => setProfileData({ ...profileData, booking_enabled: !!checked })}
                  />
                  <Label htmlFor="booking_enabled">Enable Direct Booking</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public_contact"
                    checked={profileData.public_contact}
                    onCheckedChange={(checked) => setProfileData({ ...profileData, public_contact: !!checked })}
                  />
                  <Label htmlFor="public_contact">Show Contact Info Publicly</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Languages</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add a language"
                    onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                  />
                  <Button onClick={addLanguage} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.languages.map((language) => (
                    <Badge key={language} variant="outline" className="flex items-center gap-1">
                      {language}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeLanguage(language)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile_video_url">Profile Video URL</Label>
                  <Input
                    id="profile_video_url"
                    value={profileData.profile_video_url}
                    onChange={(e) => setProfileData({ ...profileData, profile_video_url: e.target.value })}
                    placeholder="YouTube, Vimeo, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="demo_reel_url">Demo Reel URL</Label>
                  <Input
                    id="demo_reel_url"
                    value={profileData.demo_reel_url}
                    onChange={(e) => setProfileData({ ...profileData, demo_reel_url: e.target.value })}
                    placeholder="Your demo reel link"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imdb_url">IMDb Profile URL</Label>
                <Input
                  id="imdb_url"
                  value={profileData.imdb_url}
                  onChange={(e) => setProfileData({ ...profileData, imdb_url: e.target.value })}
                  placeholder="Your IMDb profile link"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={profileData.contact_email}
                    onChange={(e) => setProfileData({ ...profileData, contact_email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={profileData.contact_phone}
                    onChange={(e) => setProfileData({ ...profileData, contact_phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={profileData.social_media_links.instagram}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        social_media_links: { ...profileData.social_media_links, instagram: e.target.value },
                      })
                    }
                    placeholder="https://instagram.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={profileData.social_media_links.youtube}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        social_media_links: { ...profileData.social_media_links, youtube: e.target.value },
                      })
                    }
                    placeholder="https://youtube.com/channel/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={profileData.social_media_links.linkedin}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        social_media_links: { ...profileData.social_media_links, linkedin: e.target.value },
                      })
                    }
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.social_media_links.website}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        social_media_links: { ...profileData.social_media_links, website: e.target.value },
                      })
                    }
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
export default FilmIndustryProfileForm
