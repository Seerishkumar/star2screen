import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, User, Search, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  category: string
  publishedAt: string
  imageUrl: string
  readTime: string
  tags: string[]
}

async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/blog`, {
      cache: "no-store",
    })
    if (response.ok) {
      const data = await response.json()
      return Array.isArray(data) ? data : data.data || []
    }
  } catch (error) {
    console.error("Failed to fetch blog posts:", error)
  }

  // Fallback static data
  return [
    {
      id: "1",
      title: "Breaking into the Film Industry: A Complete Guide",
      excerpt:
        "Essential tips and strategies for newcomers looking to establish their career in the entertainment industry.",
      content: "The film industry can seem daunting to newcomers...",
      author: "Sarah Johnson",
      category: "Career Advice",
      publishedAt: "2024-01-15",
      imageUrl: "/bustling-film-set.png",
      readTime: "8 min read",
      tags: ["Career", "Tips", "Industry"],
    },
    {
      id: "2",
      title: "The Rise of Independent Cinema in 2024",
      excerpt:
        "How independent filmmakers are reshaping the industry with innovative storytelling and distribution methods.",
      content: "Independent cinema has experienced unprecedented growth...",
      author: "Michael Chen",
      category: "Industry News",
      publishedAt: "2024-01-12",
      imageUrl: "/director-in-discussion.png",
      readTime: "6 min read",
      tags: ["Independent", "Cinema", "Trends"],
    },
    {
      id: "3",
      title: "Networking Events That Changed Careers",
      excerpt: "Real stories from professionals who found their breakthrough opportunities at industry events.",
      content: "Networking remains one of the most powerful tools...",
      author: "Emma Rodriguez",
      category: "Success Stories",
      publishedAt: "2024-01-10",
      imageUrl: "/city-cafe-meetup.png",
      readTime: "5 min read",
      tags: ["Networking", "Success", "Events"],
    },
    {
      id: "4",
      title: "Technology Trends Shaping Film Production",
      excerpt: "From AI-assisted editing to virtual production, explore the technologies revolutionizing filmmaking.",
      content: "The film industry is embracing cutting-edge technology...",
      author: "David Kim",
      category: "Technology",
      publishedAt: "2024-01-08",
      imageUrl: "/bustling-city-street.png",
      readTime: "7 min read",
      tags: ["Technology", "Production", "Innovation"],
    },
    {
      id: "5",
      title: "Building Your Portfolio: What Casting Directors Want to See",
      excerpt: "Industry insights on creating a compelling portfolio that gets you noticed by casting professionals.",
      content: "Your portfolio is your calling card in the entertainment industry...",
      author: "Lisa Thompson",
      category: "Portfolio Tips",
      publishedAt: "2024-01-05",
      imageUrl: "/confident-actress.png",
      readTime: "9 min read",
      tags: ["Portfolio", "Casting", "Tips"],
    },
  ]
}

export default async function BlogPage() {
  const posts = await fetchBlogPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Stars2Screen Blog</h1>
            <p className="text-xl mb-8">
              Industry insights, career advice, and success stories from the world of entertainment
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search articles..." className="pl-10 bg-white text-gray-900" />
              </div>
              <Button variant="secondary">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {["All", "Career Advice", "Industry News", "Success Stories", "Technology", "Portfolio Tips"].map(
              (category) => (
                <Badge key={category} variant="outline" className="cursor-pointer hover:bg-blue-50">
                  {category}
                </Badge>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image src={post.imageUrl || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                  <Badge className="absolute top-4 left-4 bg-blue-600">{post.category}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 hover:text-blue-600 transition-colors">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/blog/${post.id}`}>Read More</Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-8">
              Get the latest industry insights and career tips delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
