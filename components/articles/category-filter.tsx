"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Category } from "@/types/blog"

interface CategoryFilterProps {
  categories: Category[]
  selectedSlug?: string | null
}

export function CategoryFilter({ categories, selectedSlug }: CategoryFilterProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Create a new URLSearchParams object to manipulate
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)

    // Reset to page 1 when changing category
    params.set("page", "1")

    return params.toString()
  }

  return (
    <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 scrollbar-hide">
      <Link
        href={pathname}
        className={cn(
          "whitespace-nowrap px-4 py-2 rounded-full border transition-colors",
          !selectedSlug ? "bg-primary text-white border-primary" : "bg-transparent hover:bg-gray-100",
        )}
      >
        All
      </Link>

      {categories.map((category) => (
        <Link
          key={category.id}
          href={`${pathname}?${createQueryString("category", category.slug)}`}
          className={cn(
            "whitespace-nowrap px-4 py-2 rounded-full border transition-colors",
            selectedSlug === category.slug
              ? "bg-primary text-white border-primary"
              : "bg-transparent hover:bg-gray-100",
          )}
          style={
            selectedSlug === category.slug && category.color
              ? { backgroundColor: category.color, borderColor: category.color }
              : {}
          }
        >
          {category.name}
        </Link>
      ))}
    </div>
  )
}
