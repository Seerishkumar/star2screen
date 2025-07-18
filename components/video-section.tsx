import { Play } from "lucide-react"

export function VideoSection() {
  const videos = [
    {
      id: 1,
      title: "Behind the Scenes",
      thumbnail: "/bustling-film-set.png",
    },
    {
      id: 2,
      title: "Director Interview",
      thumbnail: "/director-in-discussion.png",
    },
    {
      id: 3,
      title: "New Movie Clip",
      thumbnail: "/bustling-city-street.png",
    },
  ]

  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <h2 className="mb-8 text-2xl font-bold text-center text-primary">Video Linked with us</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {videos.map((video) => (
            <div key={video.id} className="group relative overflow-hidden rounded-lg">
              <div className="aspect-video overflow-hidden">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-400">V</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                  <Play className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
