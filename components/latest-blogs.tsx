import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar, User, Eye, ArrowRight } from "lucide-react"

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  category?: {
    name: string
    slug: string
  }
  author?: {
    display_name: string | null
  }
  published_at: string | null
  view_count: number
}

interface LatestBlogsProps {
  blogs?: Blog[]
}

export function LatestBlogs({ blogs = [] }: LatestBlogsProps) {
  // Default blogs if none provided
  const defaultBlogs = [
    {
      id: "1",
      title: "The Future of Film Industry Technology",
      slug: "future-film-technology",
      excerpt: "Exploring how AI and VR are revolutionizing filmmaking processes and audience experiences.",
      featured_image: "/bustling-film-set.png",
      category: { name: "Technology", slug: "technology" },
      author: { display_name: "Sarah Johnson" },
      published_at: "2024-01-15T10:00:00Z",
      view_count: 1250,
    },
    {
      id: "2",
      title: "Breaking Into Hollywood: A Complete Guide",
      slug: "breaking-into-hollywood",
      excerpt: "Essential tips and strategies for aspiring actors and filmmakers to make their mark in the industry.",
      featured_image: "/director-in-discussion.png",
      category: { name: "Career", slug: "career" },
      author: { display_name: "Michael Chen" },
      published_at: "2024-01-12T14:30:00Z",
      view_count: 2100,
    },
    {
      id: "3",
      title: "Independent Film Financing Options",
      slug: "indie-film-financing",
      excerpt: "A comprehensive look at funding sources and strategies for independent filmmakers.",
      featured_image: "/confident-businessman.png",
      category: { name: "Business", slug: "business" },
      author: { display_name: "Emma Rodriguez" },
      published_at: "2024-01-10T09:15:00Z",
      view_count: 890,
    },
    {
      id: "4",
      title: "Method Acting: Techniques and Controversies",
      slug: "method-acting-techniques",
      excerpt: "Diving deep into the world of method acting and its impact on modern performances.",
      featured_image: "/elegant-actress.png",
      category: { name: "Acting", slug: "acting" },
      author: { display_name: "David Thompson" },
      published_at: "2024-01-08T16:45:00Z",
      view_count: 1680,
    },
  ]

  const displayBlogs = blogs.length > 0 ? blogs : defaultBlogs

  return (
    <section className="py-12 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-primary">Industry Insights</h2>
            <p className="text-muted-foreground">Latest news, articles, and expert opinions from the film industry</p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex bg-transparent">
            <Link href="/articles" className="flex items-center space-x-2">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayBlogs.slice(0, 4).map((blog) => (
            <Link
              key={blog.id}
              href={`/articles/${blog.slug}`}
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={blog.featured_image || "/placeholder.svg?height=200&width=300"}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {blog.category && (
                  <div className="absolute top-3 left-3 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                    {blog.category.name}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                {blog.excerpt && <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{blog.excerpt}</p>}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    {blog.author?.display_name && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-20">{blog.author.display_name}</span>
                      </div>
                    )}
                    {blog.published_at && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{blog.view_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link href="/articles" className="flex items-center space-x-2">
              <span>View All Articles</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
