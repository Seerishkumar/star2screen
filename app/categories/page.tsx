import { CategoryGrid } from "@/components/category-grid"

export default function CategoriesPage() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">Film Industry Categories</h1>
        <p className="text-muted-foreground mt-2">
          Browse professionals by category to find the perfect talent for your project
        </p>
      </div>

      <CategoryGrid />
    </div>
  )
}
