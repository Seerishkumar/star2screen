"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Eye, User } from "lucide-react"

interface Article {
  id: string
  title: string
  excerpt: string | null
  content: string
  featured_image_url: string | null
  category: string | null
  author_name: string | null
  published_at: string
  reading_time_minutes: number | null
  view_count: number
  tags: string[] | null
}

interface ArticlesSectionProps {
  articles: Article[]
}

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  if (articles.length === 0) {
    return null
  }

  const featuredArticle = articles[0]
  const otherArticles = articles.slice(1)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-primary">Latest Articles & News</h2>
          <Button asChild variant="outline">
            <Link href="/articles">View All Articles</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Article */}
          <Link href={`/articles/${featuredArticle.id}`} className="group">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-64">
                <Image
                  src={featuredArticle.featured_image_url || "/placeholder.svg?height=300&width=500"}
                  alt={featuredArticle.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {featuredArticle.category && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    {featuredArticle.category}
                  </Badge>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {featuredArticle.title}
                </h3>
                {featuredArticle.excerpt && (
                  <p className="text-muted-foreground mb-4 line-clamp-3">{featuredArticle.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {featuredArticle.author_name && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {featuredArticle.author_name}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(featuredArticle.published_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {featuredArticle.reading_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {featuredArticle.reading_time_minutes} min
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {featuredArticle.view_count}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Other Articles */}
          <div className="space-y-4">
            {otherArticles.map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`} className="group">
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={article.featured_image_url || "/placeholder.svg?height=100&width=100"}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="96px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {article.category && (
                            <Badge variant="secondary" className="text-xs">
                              {article.category}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(article.published_at)}
                          </div>
                          {article.reading_time_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {article.reading_time_minutes} min
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.view_count}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
