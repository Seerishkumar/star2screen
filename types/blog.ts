export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  icon: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type Article = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  category_id: string | null
  author_id: string
  status: "draft" | "published" | "archived"
  is_featured: boolean
  view_count: number
  reading_time: number | null
  seo_title: string | null
  seo_description: string | null
  tags: string[] | null
  published_at: string | null
  created_at: string
  updated_at: string

  // Joined fields
  category?: Category
  author?: AuthorProfile
}

export type Comment = {
  id: string
  article_id: string
  user_id: string
  parent_id: string | null
  content: string
  is_approved: boolean
  created_at: string
  updated_at: string

  // Joined fields
  user?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  }
  replies?: Comment[]
}

export type AuthorProfile = {
  id: string
  user_id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  social_links: {
    twitter?: string
    linkedin?: string
    instagram?: string
    website?: string
  } | null
  specialties: string[] | null
  is_verified: boolean
  created_at: string

  // Joined fields
  user?: {
    id: string
    email: string
  }
}
