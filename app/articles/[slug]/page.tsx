import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import { ArticleHeader } from "@/components/articles/article-header"
import { ArticleContent } from "@/components/articles/article-content"
import { ArticleSidebar } from "@/components/articles/article-sidebar"
import { CommentSection } from "@/components/articles/comment-section"
import type { Metadata } from "next"
import type { Article } from "@/types/blog"

export const revalidate = 3600 // Revalidate every hour

interface ArticlePageProps {
  params: {
    slug: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient()

  const { data: article } = await supabase
    .from("articles")
    .select(`
      *,
      category:categories(*),
      author:author_profiles(*)
    `)
    .eq("slug", params.slug)
    .eq("status", "published")
    .single()

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    }
  }

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt || article.content.substring(0, 160),
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || article.content.substring(0, 160),
      type: "article",
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      authors: [article.author?.display_name || "Stars2Screen"],
      images: [
        {
          url: article.featured_image || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      tags: article.tags || [],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const supabase = createServerSupabaseClient()

  // Fetch the article
  const { data: article } = await supabase
    .from("articles")
    .select(`
      *,
      category:categories(*),
      author:author_profiles(*)
    `)
    .eq("slug", params.slug)
    .eq("status", "published")
    .single()

  if (!article) {
    notFound()
  }

  // Increment view count
  await supabase
    .from("articles")
    .update({ view_count: (article.view_count || 0) + 1 })
    .eq("id", article.id)

  // Fetch related articles
  const { data: relatedArticles } = await supabase
    .from("articles")
    .select(`
      *,
      category:categories(*),
      author:author_profiles(*)
    `)
    .eq("status", "published")
    .eq("category_id", article.category_id)
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(3)

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ArticleHeader article={article as Article} />
          <ArticleContent content={article.content} />
          <CommentSection articleId={article.id} />
        </div>

        <div className="lg:col-span-1">
          <ArticleSidebar article={article as Article} relatedArticles={relatedArticles as Article[]} />
        </div>
      </div>
    </div>
  )
}
