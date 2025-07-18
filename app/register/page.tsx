"use client"

import { useState } from "react"
import Link from "next/link"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RegisterPage() {
  const [userType, setUserType] = useState("professional")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    company_name: "",
    profession: "",
    service_type: "",
    location: "",
  })
  const [userId, setUserId] = useState(null)
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        user_type: userType,
        ...(userType === "professional"
          ? {
              full_name: formData.full_name,
              profession: formData.profession,
              location: formData.location,
            }
          : {
              company_name: formData.company_name,
              service_type: formData.service_type,
              location: formData.location,
            }),
      }
      const res = await axios.post("http://localhost:5000/api/register", payload)
      setUserId(res.data.userId)
      setSuccess("OTP sent to your email")
      setError("")
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed")
      setSuccess("")
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post("http://localhost:5000/api/verify-otp", { userId, code: otp })
      localStorage.setItem("token", res.data.token)
      setSuccess("Email verified! Redirecting...")
      setError("")
      setTimeout(() => (window.location.href = "/profile"), 2000)
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP")
      setSuccess("")
    }
  }

  return (
    <div className="container flex flex-col items-center justify-center px-4 py-12 md:px-6">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">Join our platform to connect with film industry professionals</p>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}

        {!userId ? (
          <Tabs defaultValue="professional" onValueChange={setUserType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="service">Service Provider</TabsTrigger>
            </TabsList>

            <TabsContent value="professional" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Select onValueChange={(value) => handleInputChange("profession", value)}>
                  <SelectTrigger>
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
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter your location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleRegister}>
                Create Professional Account
              </Button>
            </TabsContent>

            <TabsContent value="service" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="Enter your company name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-email">Email</Label>
                <Input
                  id="service-email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-password">Password</Label>
                <Input
                  id="service-password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-type">Service Type</Label>
                <Select onValueChange={(value) => handleInputChange("service_type", value)}>
                  <SelectTrigger>
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
                <Label htmlFor="service-location">Location</Label>
                <Input
                  id="service-location"
                  placeholder="Enter your location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleRegister}>
                Create Service Account
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Verify Email</h2>
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input id="otp" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleVerify}>
              Verify OTP
            </Button>
          </div>
        )}

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
