import Link from "next/link"
import Image from "next/image"

export function CategoryGrid() {
  const categories = [
    { name: "Producer", icon: "/icons/producer.png", href: "/categories/producer", color: "bg-accent-gold" },
    { name: "Director", icon: "/icons/director.png", href: "/categories/director", color: "bg-primary" },
    { name: "Actress", icon: "/icons/actress.png", href: "/categories/actress", color: "bg-accent-purple" },
    { name: "Actor", icon: "/icons/actor.png", href: "/categories/actor", color: "bg-accent-red" },
    {
      name: "Cinematographer",
      icon: "/icons/cinematographer.png",
      href: "/categories/cinematographer",
      color: "bg-accent-blue",
    },
    {
      name: "Stunt Director",
      icon: "/icons/stunt-director.png",
      href: "/categories/stunt-director",
      color: "bg-accent-red",
    },
    {
      name: "Choreographer",
      icon: "/icons/choreographer.png",
      href: "/categories/choreographer",
      color: "bg-secondary",
    },
    { name: "Music Director", icon: "/icons/music.png", href: "/categories/music-director", color: "bg-accent-purple" },
  ]

  const allCategories = [
    { name: "Producer", href: "/categories/producer" },
    { name: "Director", href: "/categories/director" },
    { name: "Actress", href: "/categories/actress" },
    { name: "Actor", href: "/categories/actor" },
    { name: "Cinematographer", href: "/categories/cinematographer" },
    { name: "Stunt Director", href: "/categories/stunt-director" },
    { name: "Stunt Artists", href: "/categories/stunt-artists" },
    { name: "Choreographer", href: "/categories/choreographer" },
    { name: "Art Director", href: "/categories/art-director" },
    { name: "Music Director", href: "/categories/music-director" },
    { name: "Editor", href: "/categories/editor" },
    { name: "Cine Artists", href: "/categories/cine-artists" },
    { name: "Dubbing Artists", href: "/categories/dubbing-artists" },
    { name: "Still Photographer", href: "/categories/still-photographer" },
    { name: "Movie Writers", href: "/categories/movie-writers" },
    { name: "Production Executive", href: "/categories/production-executive" },
    { name: "Makeup Artist", href: "/categories/makeup-artist" },
    { name: "Costume Designers", href: "/categories/costume-designers" },
    { name: "Publicity Designers", href: "/categories/publicity-designers" },
    { name: "Audiographer", href: "/categories/audiographer" },
    { name: "Outdoor Lightmen", href: "/categories/outdoor-lightmen" },
    { name: "Studio Workers", href: "/categories/studio-workers" },
    { name: "Production Assistants", href: "/categories/production-assistants" },
    { name: "Cinema Drivers", href: "/categories/cinema-drivers" },
    { name: "Junior Artist Agent", href: "/categories/junior-artist-agent" },
    { name: "Outdoor Unit Technicians", href: "/categories/outdoor-unit-technicians" },
    { name: "Production Women", href: "/categories/production-women" },
    { name: "Jr. Artists", href: "/categories/jr-artists" },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-8">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="flex flex-col items-center justify-center rounded-lg border bg-white p-4 text-center transition-colors hover:bg-gray-50 hover:shadow-md"
          >
            <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${category.color}`}>
              {category.icon ? (
                <Image
                  src={category.icon || "/placeholder.svg?height=48&width=48&query=film icon"}
                  alt={category.name}
                  width={48}
                  height={48}
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center text-white">{category.name.charAt(0)}</div>
              )}
            </div>
            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <h3 className="text-lg font-medium mb-4">All Categories</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {allCategories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-primary hover:text-white transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
