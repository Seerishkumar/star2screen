import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Users, Award, Globe, ArrowRight, CheckCircle } from "lucide-react"
import Image from "next/image"

const partners = [
  {
    id: 1,
    name: "Hollywood Studios Alliance",
    logo: "/confident-businessman.png",
    category: "Production Studios",
    description: "Leading alliance of major Hollywood production studios providing opportunities for emerging talent.",
    benefits: ["Exclusive casting calls", "Studio tours", "Mentorship programs"],
    tier: "Premium",
    established: "2018",
  },
  {
    id: 2,
    name: "Independent Filmmakers Network",
    logo: "/confident-indian-professional.png",
    category: "Independent Cinema",
    description: "Supporting independent filmmakers and connecting them with talented professionals worldwide.",
    benefits: ["Project funding assistance", "Distribution support", "Creative workshops"],
    tier: "Gold",
    established: "2020",
  },
  {
    id: 3,
    name: "Casting Directors Guild",
    logo: "/confident-young-professional.png",
    category: "Casting Services",
    description: "Professional association of certified casting directors committed to discovering new talent.",
    benefits: ["Direct casting submissions", "Industry workshops", "Career guidance"],
    tier: "Premium",
    established: "2015",
  },
  {
    id: 4,
    name: "Film Equipment Rentals Co.",
    logo: "/film-scene-woman.png",
    category: "Equipment & Services",
    description: "Comprehensive film equipment rental services with special rates for Stars2Screen members.",
    benefits: ["20% member discount", "Priority booking", "Technical support"],
    tier: "Silver",
    established: "2019",
  },
  {
    id: 5,
    name: "Entertainment Law Associates",
    logo: "/confident-actress.png",
    category: "Legal Services",
    description: "Specialized legal services for entertainment industry professionals and productions.",
    benefits: ["Free initial consultation", "Contract review", "Industry legal advice"],
    tier: "Gold",
    established: "2017",
  },
  {
    id: 6,
    name: "Digital Media Academy",
    logo: "/elegant-actress.png",
    category: "Education & Training",
    description: "Professional training programs for digital media, film production, and entertainment technology.",
    benefits: ["Course discounts", "Certification programs", "Career placement"],
    tier: "Silver",
    established: "2021",
  },
]

const partnershipTiers = [
  {
    name: "Premium",
    color: "bg-purple-500",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50",
    benefits: ["Exclusive opportunities", "Priority support", "Advanced features"],
  },
  {
    name: "Gold",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    benefits: ["Special discounts", "Member perks", "Industry access"],
  },
  {
    name: "Silver",
    color: "bg-gray-400",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50",
    benefits: ["Basic benefits", "Network access", "Resource sharing"],
  },
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Partners</h1>
            <p className="text-xl mb-8">
              Collaborating with industry leaders to provide exceptional opportunities and services
            </p>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>50+ Partners</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span>Global Network</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span>Industry Leaders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Partnership Tiers</h2>
            <p className="text-gray-600">
              Our partners are categorized into different tiers based on their collaboration level and benefits offered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {partnershipTiers.map((tier) => (
              <Card key={tier.name} className={`${tier.bgColor} border-2`}>
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${tier.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className={tier.textColor}>{tier.name} Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Meet Our Partners</h2>
              <p className="text-gray-600">
                Trusted organizations that help make Stars2Screen the premier platform for entertainment professionals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partners.map((partner) => {
                const tier = partnershipTiers.find((t) => t.name === partner.tier)
                return (
                  <Card key={partner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={partner.logo || "/placeholder.svg"}
                        alt={partner.name}
                        fill
                        className="object-cover"
                      />
                      <Badge className={`absolute top-4 right-4 ${tier?.color} text-white`}>{partner.tier}</Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{partner.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {partner.category}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">Est. {partner.established}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">{partner.description}</p>

                      <div className="space-y-2 mb-4">
                        <h4 className="font-semibold text-sm">Member Benefits:</h4>
                        <ul className="space-y-1">
                          {partner.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Learn More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Partner With Us?</h2>
              <p className="text-gray-600">
                Join our network of industry leaders and help shape the future of entertainment
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Access to Talent Pool
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Connect with thousands of verified entertainment professionals across all categories and skill
                    levels.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    Global Reach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Expand your reach to international markets and connect with professionals worldwide.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Brand Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Increase your brand visibility within the entertainment industry through our platform.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Exclusive Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Offer exclusive opportunities and services to our premium member base.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Become a Partner</h2>
            <p className="text-xl mb-8">
              Join our network of industry leaders and help us connect talent with opportunity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Partnership Inquiry
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Download Partnership Guide
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
