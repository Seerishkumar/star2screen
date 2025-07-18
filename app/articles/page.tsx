import { Suspense } from "react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { ArticleCard } from "@/components/articles/article-card"
import { ArticleListSkeleton } from "@/components/articles/article-list-skeleton"
import { Pagination } from "@/components/ui/pagination"
import { CategoryFilter } from "@/components/articles/category-filter"

export const revalidate = 3600 // Revalidate every hour

interface ArticlesPageProps {
  searchParams: {
    page?: string
    category?: string
    tag?: string
    search?: string
  }
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const page = Number.parseInt(searchParams.page || "1")
  const category = searchParams.category
  const tag = searchParams.tag
  const search = searchParams.search

  const supabase = createServerSupabaseClient()

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .is("parent_id", null) // Only parent categories
    .order("sort_order", { ascending: true })

  // Fetch featured article
  const { data: featuredArticle } = await supabase
    .from("articles")
    .select(`
      *,
      category:categories(*),
      author:author_profiles(*)
    `)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .single()

  // Fetch articles with pagination
  const limit = 9
  const offset = (page - 1) * limit

  let query = supabase
    .from("articles")
    .select(
      `
      *,
      category:categories(*),
      author:author_profiles(*)
    `,
      { count: "exact" },
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) {
    // Join with categories to filter by slug
    query = query.eq("categories.slug", category)
  }

  if (tag) {
    query = query.contains("tags", [tag])
  }

  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  const { data: articles, count: totalCount } = await query

  const totalPages = Math.ceil((totalCount || 0) / limit)

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Articles & News</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest news, reviews, and insights from the film industry
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <CategoryFilter categories={categories || []} selectedSlug={category} />
      </div>

      {/* Featured Article */}
      {featuredArticle && !category && !tag && !search && page === 1 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Featured Article</h2>
          <ArticleCard article={featuredArticle} variant="featured" />
        </div>
      )}

      {/* Articles Grid */}
      <Suspense fallback={<ArticleListSkeleton />}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles?.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {articles?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} baseUrl="/articles" searchParams={searchParams} />
          </div>
        )}
      </Suspense>
    </div>
  )
}
