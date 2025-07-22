export default function UsersLoading() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <div className="animate-pulse h-8 w-64 bg-muted rounded mb-2"></div>
        <div className="animate-pulse h-4 w-48 bg-muted rounded"></div>
      </div>

      <div className="border rounded-lg">
        <div className="p-6 border-b">
          <div className="animate-pulse h-6 w-32 bg-muted rounded mb-2"></div>
          <div className="animate-pulse h-4 w-64 bg-muted rounded mb-4"></div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="animate-pulse h-10 flex-1 bg-muted rounded"></div>
            <div className="animate-pulse h-10 w-48 bg-muted rounded"></div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded">
                <div className="flex items-center gap-4">
                  <div className="animate-pulse h-10 w-10 bg-muted rounded-full"></div>
                  <div>
                    <div className="animate-pulse h-4 w-32 bg-muted rounded mb-1"></div>
                    <div className="animate-pulse h-3 w-48 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
