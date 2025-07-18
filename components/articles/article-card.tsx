import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Clock, Eye, MessageSquare } from "lucide-react"
import type { Article } from "@/types/blog"

interface ArticleCardProps {
  article: Article
  variant?: "default" | "featured" | "compact"
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const isFeatured = variant === "featured"
  const isCompact = variant === "compact"

  return (
    <Card className={`overflow-hidden ${isFeatured ? "h-full" : ""}`}>
      <div className={`relative ${isFeatured ? "aspect-[16/9]" : isCompact ? "aspect-[3/2]" : "aspect-[16/9]"}`}>
        <Link href={`/articles/${article.slug}`}>
          <Image
            src={article.featured_image || "/placeholder.svg?height=400&width=600&query=film article"}
            alt={article.title}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </Link>
        {article.category && (
          <Badge className="absolute top-2 left-2" style={{ backgroundColor: article.category.color || "#2B5AA7" }}>
            {article.category.name}
          </Badge>
        )}
      </div>

      <CardContent className={`${isFeatured ? "p-6" : "p-4"}`}>
        <Link href={`/articles/${article.slug}`} className="hover:underline">
          <h3 className={`font-bold ${isFeatured ? "text-2xl mb-3" : "text-lg mb-2"}`}>{article.title}</h3>
        </Link>

        {!isCompact && (
          <p className="text-muted-foreground line-clamp-2 mb-3">
            {article.excerpt || article.content.replace(/<[^>]*>/g, "").slice(0, 150) + "..."}
          </p>
        )}

        {article.author && (
          <div className="flex items-center gap-2 text-sm">
            <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-200">
              {article.author.avatar_url ? (
                <Image
                  src={article.author.avatar_url || "/placeholder.svg"}
                  alt={article.author.display_name || ""}
                  width={24}
                  height={24}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs font-medium">
                  {(article.author.display_name || "A").charAt(0)}
                </div>
              )}
            </div>
            <span className="font-medium">{article.author.display_name || "Anonymous"}</span>
            {article.published_at && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                </span>
              </>
            )}
          </div>
        )}
      </CardContent>

      {!isCompact && (
        <CardFooter className="px-4 py-3 border-t flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{article.reading_time || 5} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{article.view_count || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>0 comments</span>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
