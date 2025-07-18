"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Briefcase, Users, Star } from "lucide-react"

const USER_TYPES = {
  professional: {
    icon: Star,
    title: "Creative Professional",
    description: "Actors, Directors, Writers, Musicians, etc.",
    categories: [
      "Actor",
      "Actress",
      "Director",
      "Producer",
      "Writer/Screenwriter",
      "Cinematographer",
      "Editor",
      "Music Director/Composer",
      "Sound Designer",
      "Production Designer",
      "Costume Designer",
      "Makeup Artist",
      "Choreographer",
      "Stunt Coordinator",
      "Assistant Director",
      "Script Supervisor",
    ],
  },
  service: {
    icon: Briefcase,
    title: "Service Provider",
    description: "Equipment, Studios, Post-production, etc.",
    categories: [
      "Equipment Rental",
      "Studio Rental",
      "Post Production",
      "Casting Agency",
      "Talent Management",
      "Location Services",
      "Catering Services",
      "Transportation",
      "Security Services",
      "Legal Services",
      "Insurance Services",
      "Marketing/PR",
    ],
  },
  recruiter: {
    icon: Users,
    title: "Casting Director/Recruiter",
    description: "Casting Directors, Talent Scouts, Producers",
    categories: [
      "Casting Director",
      "Talent Scout",
      "Casting Associate",
      "Producer",
      "Line Producer",
      "Executive Producer",
      "Talent Agent",
      "Talent Manager",
    ],
  },
}

export default function EnhancedRegister() {
  const router = useRouter()
  const [userType, setUserType] = useState("professional")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    company_name: "",
    category: "",
    location: "",
    phone: "",
    experience_level: "",
    specialization: "",
    agreeToTerms: false,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }

    if (!formData.category) {
      setError("Please select your category/profession")
      return false
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions")
      return false
    }

    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            user_type: userType,
            category: formData.category,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Create profile in our custom table
        const profileData = {
          user_id: authData.user.id,
          display_name: userType === "service" ? formData.company_name : formData.full_name,
          bio: `${formData.category} specializing in ${formData.specialization || "Independent Films"}`,
          location: formData.location,
          phone: formData.phone,
          specialties: [formData.category],
          user_type: userType,
          category: formData.category,
          experience_level: formData.experience_level,
          is_verified: false,
          subscription_plan: "free",
          created_at: new Date().toISOString(),
        }

        const { error: profileError } = await supabase.from("author_profiles").insert(profileData)

        if (profileError) {
          console.error("Profile creation error:", profileError)
          // Continue anyway, profile can be created later
        }

        setSuccess("Registration successful! Please check your email to verify your account.")

        // Redirect to email verification page after 2 seconds
        setTimeout(() => {
          router.push("/auth/verify-email")
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const currentUserType = USER_TYPES[userType as keyof typeof USER_TYPES]
  const IconComponent = currentUserType.icon

  return (
    <div className="container flex flex-col items-center justify-center px-4 py-12 md:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Join the Film Community</h1>
          <p className="text-muted-foreground">Connect with independent filmmakers and build your career</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="professional" onValueChange={setUserType}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Creative
            </TabsTrigger>
            <TabsTrigger value="service" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Service
            </TabsTrigger>
            <TabsTrigger value="recruiter" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Casting
            </TabsTrigger>
          </TabsList>

          {Object.entries(USER_TYPES).map(([type, config]) => (
            <TabsContent key={type} value={type} className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <config.icon className="h-5 w-5" />
                    {config.title}
                  </CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {type === "service" ? (
                        <div className="space-y-2">
                          <Label htmlFor="company_name">Company Name *</Label>
                          <Input
                            id="company_name"
                            placeholder="Your company name"
                            value={formData.company_name}
                            onChange={(e) => handleInputChange("company_name", e.target.value)}
                            required
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name *</Label>
                          <Input
                            id="full_name"
                            placeholder="Your full name"
                            value={formData.full_name}
                            onChange={(e) => handleInputChange("full_name", e.target.value)}
                            required
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+91 9876543210"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          placeholder="City, State"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="category">
                        {type === "professional" ? "Profession" : type === "service" ? "Service Type" : "Role"} *
                      </Label>
                      <Select onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Select your ${type === "professional" ? "profession" : type === "service" ? "service type" : "role"}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {config.categories.map((category) => (
                            <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, "-")}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-2">
                      <Label htmlFor="experience_level">Experience Level</Label>
                      <Select onValueChange={(value) => handleInputChange("experience_level", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                          <SelectItem value="experienced">Experienced (5-10 years)</SelectItem>
                          <SelectItem value="expert">Expert (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Specialization */}
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization/Focus Area</Label>
                      <Input
                        id="specialization"
                        placeholder="e.g., Independent Films, Documentaries, Short Films"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange("specialization", e.target.value)}
                      />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        `Create ${config.title} Account`
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
