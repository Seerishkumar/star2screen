"use client"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, X, Plus, Trash } from "lucide-react"

export function ProfileForm({ profile, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    ...profile,
    skills: profile.skills || [],
    services: profile.services || [],
    experience: profile.experience || [],
    education: profile.education || [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [newService, setNewService] = useState("")

  // Experience and education form fields
  const [newExperience, setNewExperience] = useState({ title: "", project: "", year: "", description: "" })
  const [newEducation, setNewEducation] = useState({ institution: "", degree: "", year: "" })

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] })
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData({ ...formData, services: [...formData.services, newService.trim()] })
      setNewService("")
    }
  }

  const removeService = (serviceToRemove) => {
    setFormData({
      ...formData,
      services: formData.services.filter((service) => service !== serviceToRemove),
    })
  }

  const addExperience = () => {
    if (newExperience.title && newExperience.project && newExperience.year) {
      setFormData({
        ...formData,
        experience: [...formData.experience, { ...newExperience }],
      })
      setNewExperience({ title: "", project: "", year: "", description: "" })
    }
  }

  const removeExperience = (index) => {
    const updatedExperience = [...formData.experience]
    updatedExperience.splice(index, 1)
    setFormData({ ...formData, experience: updatedExperience })
  }

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree && newEducation.year) {
      setFormData({
        ...formData,
        education: [...formData.education, { ...newEducation }],
      })
      setNewEducation({ institution: "", degree: "", year: "" })
    }
  }

  const removeEducation = (index) => {
    const updatedEducation = [...formData.education]
    updatedEducation.splice(index, 1)
    setFormData({ ...formData, education: updatedEducation })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const res = await axios.put("http://localhost:5000/api/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLoading(false)
      onSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile")
      setLoading(false)
    }
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Edit Profile</h1>
        <Button variant="ghost" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.user_type === "professional" ? (
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name || ""}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name || ""}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website || ""}
                onChange={(e) => handleInputChange("website", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={5}
                value={formData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself or your company"
              />
            </div>
          </CardContent>
        </Card>

        {profile.user_type === "professional" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Select
                    value={formData.profession || ""}
                    onValueChange={(value) => handleInputChange("profession", value)}
                  >
                    <SelectTrigger id="profession">
                      <SelectValue placeholder="Select your profession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actor">Actor</SelectItem>
                      <SelectItem value="actress">Actress</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="producer">Producer</SelectItem>
                      <SelectItem value="cinematographer">Cinematographer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="writer">Writer</SelectItem>
                      <SelectItem value="music-director">Music Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                        <span>{skill}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSkill(skill)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.experience.map((exp, index) => (
                  <div key={index} className="border p-4 rounded-md relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeExperience(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="font-medium">{exp.title}</p>
                        <p className="text-sm text-muted-foreground">{exp.project}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{exp.year}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{exp.description}</p>
                  </div>
                ))}

                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-3">Add New Experience</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="exp-title">Title</Label>
                      <Input
                        id="exp-title"
                        value={newExperience.title}
                        onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                        placeholder="e.g. Lead Actor"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exp-project">Project</Label>
                      <Input
                        id="exp-project"
                        value={newExperience.project}
                        onChange={(e) => setNewExperience({ ...newExperience, project: e.target.value })}
                        placeholder="e.g. Movie Title"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="exp-year">Year</Label>
                    <Input
                      id="exp-year"
                      value={newExperience.year}
                      onChange={(e) => setNewExperience({ ...newExperience, year: e.target.value })}
                      placeholder="e.g. 2023"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="exp-description">Description</Label>
                    <Textarea
                      id="exp-description"
                      value={newExperience.description}
                      onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                      placeholder="Describe your role and responsibilities"
                    />
                  </div>
                  <Button type="button" className="mt-4" onClick={addExperience}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Experience
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="border p-4 rounded-md relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeEducation(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="font-medium">{edu.institution}</p>
                        <p className="text-sm text-muted-foreground">{edu.degree}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{edu.year}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-3">Add New Education</h4>
                  <div className="space-y-2">
                    <Label htmlFor="edu-institution">Institution</Label>
                    <Input
                      id="edu-institution"
                      value={newEducation.institution}
                      onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                      placeholder="e.g. National School of Drama"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="edu-degree">Degree</Label>
                    <Input
                      id="edu-degree"
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                      placeholder="e.g. Diploma in Dramatic Arts"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="edu-year">Year</Label>
                    <Input
                      id="edu-year"
                      value={newEducation.year}
                      onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                      placeholder="e.g. 2018"
                    />
                  </div>
                  <Button type="button" className="mt-4" onClick={addEducation}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Education
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {profile.user_type === "service" && (
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type</Label>
                <Select
                  value={formData.service_type || ""}
                  onValueChange={(value) => handleInputChange("service_type", value)}
                >
                  <SelectTrigger id="service_type">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment-rental">Equipment Rental</SelectItem>
                    <SelectItem value="studio-rental">Studio Rental</SelectItem>
                    <SelectItem value="post-production">Post Production</SelectItem>
                    <SelectItem value="casting">Casting Agency</SelectItem>
                    <SelectItem value="makeup">Makeup & Styling</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_area">Service Area</Label>
                <Input
                  id="service_area"
                  value={formData.service_area || ""}
                  onChange={(e) => handleInputChange("service_area", e.target.value)}
                  placeholder="e.g. Mumbai and surrounding areas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing">Pricing</Label>
                <Input
                  id="pricing"
                  value={formData.pricing || ""}
                  onChange={(e) => handleInputChange("pricing", e.target.value)}
                  placeholder="e.g. Starting from ₹5000/day"
                />
              </div>

              <div className="space-y-2">
                <Label>Services Offered</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.services.map((service, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                      <span>{service}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeService(service)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Add a service"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addService}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
