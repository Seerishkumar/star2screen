"use client"

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
import { Plus, X, Save, Loader2 } from "lucide-react"

interface Experience {
  id?: string
  title: string
  company: string
  project_name: string
  project_type: string
  role_type: string
  start_date: string
  end_date: string
  is_current: boolean
  description: string
  skills_used: string[]
}

interface Education {
  id?: string
  institution: string
  degree: string
  field_of_study: string
  start_year: number
  end_year: number
  is_current: boolean
  description: string
}

export function EnhancedProfileForm() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Basic Profile Data
  const [profileData, setProfileData] = useState({
    display_name: "",
    bio: "",
    phone: "",
    website: "",
    location: "",
    hourly_rate: "",
    experience_years: "",
    availability_status: "available",
  })

  // Skills and Languages
  const [skills, setSkills] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [newLanguage, setNewLanguage] = useState("")

  // Experience
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [newExperience, setNewExperience] = useState<Experience>({
    title: "",
    company: "",
    project_name: "",
    project_type: "",
    role_type: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
    skills_used: [],
  })

  // Education
  const [education, setEducation] = useState<Education[]>([])
  const [newEducation, setNewEducation] = useState<Education>({
    institution: "",
    degree: "",
    field_of_study: "",
    start_year: new Date().getFullYear(),
    end_year: new Date().getFullYear(),
    is_current: false,
    description: "",
  })

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    if (!user) return

    try {
      // Load basic profile
      const { data: profile } = await supabase.from("author_profiles").select("*").eq("user_id", user.id).single()

      if (profile) {
        setProfileData({
          display_name: profile.display_name || "",
          bio: profile.bio || "",
          phone: profile.phone || "",
          website: profile.website || "",
          location: profile.location || "",
          hourly_rate: profile.hourly_rate?.toString() || "",
          experience_years: profile.experience_years?.toString() || "",
          availability_status: profile.availability_status || "available",
        })
        setSkills(profile.skills || [])
        setLanguages(profile.languages || [])
      }

      // Load experience
      const { data: expData } = await supabase
        .from("professional_experience")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false })

      if (expData) {
        setExperiences(expData)
      }

      // Load education
      const { data: eduData } = await supabase
        .from("education")
        .select("*")
        .eq("user_id", user.id)
        .order("start_year", { ascending: false })

      if (eduData) {
        setEducation(eduData)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const saveBasicProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const updateData = {
        ...profileData,
        hourly_rate: profileData.hourly_rate ? Number.parseFloat(profileData.hourly_rate) : null,
        experience_years: profileData.experience_years ? Number.parseInt(profileData.experience_years) : null,
        skills,
        languages,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("author_profiles").upsert({ user_id: user.id, ...updateData })

      if (error) throw error
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  const addExperience = async () => {
    if (!user || !newExperience.title || !newExperience.project_name) return

    try {
      const { data, error } = await supabase
        .from("professional_experience")
        .insert({ ...newExperience, user_id: user.id })
        .select()
        .single()

      if (error) throw error

      setExperiences([data, ...experiences])
      setNewExperience({
        title: "",
        company: "",
        project_name: "",
        project_type: "",
        role_type: "",
        start_date: "",
        end_date: "",
        is_current: false,
        description: "",
        skills_used: [],
      })
      alert("Experience added successfully!")
    } catch (error) {
      console.error("Error adding experience:", error)
      alert("Failed to add experience")
    }
  }

  const addEducation = async () => {
    if (!user || !newEducation.institution || !newEducation.degree) return

    try {
      const { data, error } = await supabase
        .from("education")
        .insert({ ...newEducation, user_id: user.id })
        .select()
        .single()

      if (error) throw error

      setEducation([data, ...education])
      setNewEducation({
        institution: "",
        degree: "",
        field_of_study: "",
        start_year: new Date().getFullYear(),
        end_year: new Date().getFullYear(),
        is_current: false,
        description: "",
      })
      alert("Education added successfully!")
    } catch (error) {
      console.error("Error adding education:", error)
      alert("Failed to add education")
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()])
      setNewLanguage("")
    }
  }

  const removeLanguage = (langToRemove: string) => {
    setLanguages(languages.filter((lang) => lang !== langToRemove))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Complete Your Profile</h1>
        <p className="text-muted-foreground">Build a comprehensive profile to attract better opportunities</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                    placeholder="Your professional name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website/Portfolio</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="Mumbai, Maharashtra"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate (₹)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={profileData.hourly_rate}
                    onChange={(e) => setProfileData({ ...profileData, hourly_rate: e.target.value })}
                    placeholder="5000"
                  />
                </div>

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
              </div>

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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself, your experience, and what makes you unique..."
                  rows={4}
                />
              </div>

              <Button onClick={saveBasicProfile} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Basic Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Languages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skills Section */}
              <div className="space-y-4">
                <Label>Professional Skills</Label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., Method Acting, Cinematography)"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Languages Section */}
              <div className="space-y-4">
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {languages.map((language, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {language}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeLanguage(language)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add a language (e.g., Hindi, English, Tamil)"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                  />
                  <Button onClick={addLanguage}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={saveBasicProfile} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Skills & Languages
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Experience */}
              {experiences.map((exp, index) => (
                <div key={exp.id || index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-muted-foreground">
                        {exp.project_name} • {exp.company}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                      </p>
                    </div>
                    <Badge variant="outline">{exp.project_type}</Badge>
                  </div>
                  <p className="text-sm">{exp.description}</p>
                </div>
              ))}

              {/* Add New Experience */}
              <div className="border-2 border-dashed rounded-lg p-4">
                <h3 className="font-semibold mb-4">Add New Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role/Title</Label>
                    <Input
                      value={newExperience.title}
                      onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                      placeholder="Lead Actor, Director, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input
                      value={newExperience.project_name}
                      onChange={(e) => setNewExperience({ ...newExperience, project_name: e.target.value })}
                      placeholder="Movie/Series Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Production House/Company</Label>
                    <Input
                      value={newExperience.company}
                      onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                      placeholder="Production Company"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Project Type</Label>
                    <Select
                      value={newExperience.project_type}
                      onValueChange={(value) => setNewExperience({ ...newExperience, project_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature-film">Feature Film</SelectItem>
                        <SelectItem value="short-film">Short Film</SelectItem>
                        <SelectItem value="web-series">Web Series</SelectItem>
                        <SelectItem value="tv-series">TV Series</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="music-video">Music Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={newExperience.start_date}
                      onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={newExperience.end_date}
                      onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                      disabled={newExperience.is_current}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                    placeholder="Describe your role and achievements..."
                    rows={3}
                  />
                </div>

                <Button onClick={addExperience} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Experience
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Education */}
              {education.map((edu, index) => (
                <div key={edu.id || index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-muted-foreground">{edu.institution}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.start_year} - {edu.is_current ? "Present" : edu.end_year}
                      </p>
                      {edu.field_of_study && <p className="text-sm">Field: {edu.field_of_study}</p>}
                    </div>
                  </div>
                  {edu.description && <p className="text-sm mt-2">{edu.description}</p>}
                </div>
              ))}

              {/* Add New Education */}
              <div className="border-2 border-dashed rounded-lg p-4">
                <h3 className="font-semibold mb-4">Add Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input
                      value={newEducation.institution}
                      onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                      placeholder="University/School Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                      placeholder="Bachelor's, Master's, Diploma, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input
                      value={newEducation.field_of_study}
                      onChange={(e) => setNewEducation({ ...newEducation, field_of_study: e.target.value })}
                      placeholder="Acting, Film Studies, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Year</Label>
                    <Input
                      type="number"
                      value={newEducation.start_year}
                      onChange={(e) =>
                        setNewEducation({ ...newEducation, start_year: Number.parseInt(e.target.value) })
                      }
                      placeholder="2020"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Year</Label>
                    <Input
                      type="number"
                      value={newEducation.end_year}
                      onChange={(e) => setNewEducation({ ...newEducation, end_year: Number.parseInt(e.target.value) })}
                      placeholder="2024"
                      disabled={newEducation.is_current}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={newEducation.description}
                    onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                    placeholder="Additional details about your education..."
                    rows={2}
                  />
                </div>

                <Button onClick={addEducation} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Education
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
