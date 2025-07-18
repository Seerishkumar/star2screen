"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User } from "lucide-react"

interface Article {
  id: number
  title: string
  slug: string
  excerpt?: string
  featured_image_url?: string
  author_name?: string
  published_at?: string
}

interface ArticlesSectionProps {
  articles?: Article[]
}

export function ArticlesSection({ articles = [] }: ArticlesSectionProps) {
  const validArticles = articles.filter((article) => article && article.title && article.slug)

  if (validArticles.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-primary">Latest Articles & News</h2>
          <Button variant="outline" asChild>
            <Link href="/articles">View All Articles</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validArticles.slice(0, 6).map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="relative h-48">
                  <Image
                    src={article.featured_image_url || "/placeholder.svg?height=200&width=400"}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
                  {article.excerpt && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{article.excerpt}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {article.author_name && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{article.author_name}</span>
                      </div>
                    )}
                    {article.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
