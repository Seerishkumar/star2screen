import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, Calendar, Share2 } from "lucide-react"
import type { Article } from "@/types/blog"

interface ArticleHeaderProps {
  article: Article
}

export function ArticleHeader({ article }: ArticleHeaderProps) {
  return (
    <div className="mb-8">
      {/* Category and metadata */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {article.category && (
          <Link href={`/articles?category=${article.category.slug}`}>
            <Badge style={{ backgroundColor: article.category.color || "#2B5AA7" }} className="hover:opacity-80">
              {article.category.name}
            </Badge>
          </Link>
        )}

        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <time dateTime={article.published_at || article.created_at}>
            {article.published_at
              ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
              : formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
          </time>
        </div>

        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{article.reading_time || 5} min read</span>
        </div>

        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{article.view_count || 0} views</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-4 md:text-4xl">{article.title}</h1>

      {/* Author */}
      {article.author && (
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
            {article.author.avatar_url ? (
              <Image
                src={article.author.avatar_url || "/placeholder.svg"}
                alt={article.author.display_name || ""}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm font-medium">
                {(article.author.display_name || "A").charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{article.author.display_name || "Anonymous"}</div>
            {article.author.specialties && article.author.specialties.length > 0 && (
              <div className="text-sm text-muted-foreground">{article.author.specialties.join(", ")}</div>
            )}
          </div>
        </div>
      )}

      {/* Featured Image */}
      {article.featured_image && (
        <div className="aspect-[16/9] relative rounded-lg overflow-hidden mb-6">
          <Image
            src={article.featured_image || "/placeholder.svg"}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map((tag) => (
            <Link key={tag} href={`/articles?tag=${tag}`}>
              <Badge variant="outline" className="hover:bg-secondary/10">
                #{tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Share buttons */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-medium">Share:</span>
        <button className="rounded-full bg-[#1877F2] p-2 text-white hover:opacity-90">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"></path>
          </svg>
        </button>
        <button className="rounded-full bg-[#1DA1F2] p-2 text-white hover:opacity-90">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
          </svg>
        </button>
        <button className="rounded-full bg-[#0A66C2] p-2 text-white hover:opacity-90">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
          </svg>
        </button>
        <button className="rounded-full bg-[#E60023] p-2 text-white hover:opacity-90">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"></path>
          </svg>
        </button>
        <button className="rounded-full bg-gray-200 p-2 text-gray-600 hover:bg-gray-300">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
