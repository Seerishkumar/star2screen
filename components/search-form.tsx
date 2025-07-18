"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Users } from "lucide-react"

export function SearchForm() {
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")

  const categories = [
    { value: "producer", label: "Producer" },
    { value: "director", label: "Director" },
    { value: "actress", label: "Actress" },
    { value: "actor", label: "Actor" },
    { value: "cinematographer", label: "Cinematographer" },
    { value: "stunt-director", label: "Stunt Director" },
    { value: "stunt-artists", label: "Stunt Artists" },
    { value: "choreographer", label: "Choreographer (Dance Director)" },
    { value: "art-director", label: "Art Director" },
    { value: "music-director", label: "Music Director" },
    { value: "editor", label: "Editor" },
    { value: "cine-artists", label: "Cine Artists" },
    { value: "dubbing-artists", label: "Dubbing Artists" },
    { value: "still-photographer", label: "Still Photographer" },
    { value: "movie-writers", label: "Movie Writers" },
    { value: "production-executive", label: "Production Executive" },
    { value: "makeup-artist", label: "Makeup Artist" },
    { value: "costume-designers", label: "Costume Designers" },
    { value: "publicity-designers", label: "Publicity Designers (Poster Designing)" },
    { value: "audiographer", label: "Audiographer (Dubbing, Re-recording, Sound Effects)" },
    { value: "outdoor-lightmen", label: "Outdoor Lightmen" },
    { value: "studio-workers", label: "Studio Workers (Moulders, Carpenters, Painters, etc.)" },
    { value: "production-assistants", label: "Production Assistants (Set Assistants)" },
    { value: "cinema-drivers", label: "Cinema Drivers" },
    { value: "junior-artist-agent", label: "Junior Artist Agent" },
    { value: "outdoor-unit-technicians", label: "Outdoor Unit Technicians" },
    { value: "production-women", label: "Production Women (Cleaners)" },
    { value: "jr-artists", label: "Jr. Artists" },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input type="text" placeholder="Enter Name" className="border-0 p-0 shadow-none focus-visible:ring-0" />
      </div>
      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="border-0 p-0 shadow-none focus:ring-0">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="border-0 p-0 shadow-none focus:ring-0">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full bg-secondary hover:bg-secondary/90">
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </div>
  )
}
