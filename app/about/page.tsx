import type { Metadata } from "next"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Globe, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us - Stars2Screen",
  description: "Learn about Stars2Screen's mission to connect film industry professionals and talent worldwide.",
}

export default function AboutPage() {
  const stats = [
    { icon: Users, label: "Active Users", value: "50,000+" },
    { icon: Award, label: "Successful Projects", value: "10,000+" },
    { icon: Globe, label: "Countries", value: "25+" },
    { icon: Heart, label: "Success Stories", value: "5,000+" },
  ]

  const team = [
    {
      name: "Sudheer Talasila",
      role: "CEO & Founder",
      image: "",
      bio: "Former casting director with 15+ years in the film industry.",
    },
    {
      name: "Avan Alla",
      role: "Marketing Head",
      image: "",
      bio: "Marketing Headpassionate about connecting creative professionals.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About Stars2Screen</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Connecting talent with opportunity in the film industry since 2020
          </p>
          <div className="flex justify-center">
            <Image
              src="/hero-illustration.png"
              alt="About Us Hero"
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              Stars2Screen was founded with a simple yet powerful vision: to democratize access to opportunities in the
              film industry. We believe that talent exists everywhere, and our platform serves as the bridge between
              creative professionals and the projects that need them.
            </p>
            <p className="text-lg text-gray-600">
              Whether you're an aspiring actor, an experienced director, a skilled cinematographer, or any other film
              industry professional, Stars2Screen provides the tools and connections you need to advance your career.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      fill
                      className="rounded-full object-cover"
                      sizes="128px"
                      priority={index < 2}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <Badge variant="secondary" className="mb-3">
                    {member.role}
                  </Badge>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Inclusivity</h3>
                <p className="text-gray-600">
                  We believe in creating opportunities for everyone, regardless of background, experience level, or
                  location.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Excellence</h3>
                <p className="text-gray-600">
                  We strive for excellence in everything we do, from our platform features to our customer support.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Community</h3>
                <p className="text-gray-600">
                  We foster a supportive community where professionals can learn, grow, and succeed together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
