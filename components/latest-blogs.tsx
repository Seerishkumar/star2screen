import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function LatestBlogs() {
  const blogs = [
    {
      id: 1,
      title: "Latest Movie Release",
      image: "/inferno-escape.png",
      date: "April 10, 2024",
      category: "Movies",
    },
  ]

  return (
    <section className="py-12 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-primary">Latest Blogs</h2>
          <p className="text-muted-foreground">
            View the latest blogs list of new Movies, Banners, News, Articles, etc
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blogs/${blog.id}`}
              className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="aspect-[3/4] overflow-hidden">
                {blog.image ? (
                  <Image
                    src={blog.image || "/placeholder.svg"}
                    alt={blog.title}
                    width={300}
                    height={400}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-400">B</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="mb-2 text-xs text-muted-foreground">
                  {blog.date} • {blog.category}
                </div>
                <h3 className="font-medium group-hover:text-primary">{blog.title}</h3>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
            View all insights
          </Button>
        </div>
      </div>
    </section>
  )
}
