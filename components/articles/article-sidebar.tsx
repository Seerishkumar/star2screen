import Link from "next/link"
import { ArticleCard } from "./article-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import type { Article } from "@/types/blog"

interface ArticleSidebarProps {
  article: Article
  relatedArticles: Article[]
}

export function ArticleSidebar({ article, relatedArticles }: ArticleSidebarProps) {
  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="rounded-lg border p-4">
        <h3 className="font-bold mb-4">Search Articles</h3>
        <form action="/articles" className="flex gap-2">
          <Input name="search" placeholder="Search..." className="flex-1" />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="font-bold mb-4">Related Articles</h3>
          <div className="space-y-4">
            {relatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="rounded-lg border p-4">
        <h3 className="font-bold mb-4">Categories</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/articles?category=industry-news">
            <Badge variant="outline" className="hover:bg-primary/10">
              Industry News
            </Badge>
          </Link>
          <Link href="/articles?category=movie-reviews">
            <Badge variant="outline" className="hover:bg-primary/10">
              Movie Reviews
            </Badge>
          </Link>
          <Link href="/articles?category=interviews">
            <Badge variant="outline" className="hover:bg-primary/10">
              Interviews
            </Badge>
          </Link>
          <Link href="/articles?category=behind-the-scenes">
            <Badge variant="outline" className="hover:bg-primary/10">
              Behind the Scenes
            </Badge>
          </Link>
          <Link href="/articles?category=career-guidance">
            <Badge variant="outline" className="hover:bg-primary/10">
              Career Guidance
            </Badge>
          </Link>
          <Link href="/articles?category=technology">
            <Badge variant="outline" className="hover:bg-primary/10">
              Technology
            </Badge>
          </Link>
          <Link href="/articles">
            <Badge variant="outline" className="hover:bg-primary/10">
              View All
            </Badge>
          </Link>
        </div>
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="font-bold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link key={tag} href={`/articles?tag=${tag}`}>
                <Badge variant="outline" className="hover:bg-secondary/10">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="rounded-lg border p-4 bg-primary/5">
        <h3 className="font-bold mb-2">Subscribe to Newsletter</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get the latest film industry news and updates delivered to your inbox
        </p>
        <form className="space-y-2">
          <Input placeholder="Your email address" type="email" required />
          <Button className="w-full">Subscribe</Button>
        </form>
      </div>
    </div>
  )
}
