// Home page loading skeleton — shown immediately while server fetches data
export default function HomeLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="relative w-full h-[70vh] md:h-[85vh] bg-ink/5 animate-pulse" />

      {/* Category section skeleton */}
      <div className="section-container py-12 md:py-16">
        <div className="text-center mb-8 space-y-3">
          <div className="h-4 w-24 bg-ink/5 rounded-full animate-pulse mx-auto" />
          <div className="h-9 w-64 bg-ink/5 rounded-2xl animate-pulse mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-ink/5 animate-pulse" />
              <div className="h-4 w-16 bg-ink/5 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges skeleton */}
      <div className="section-container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-ink/5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-ink/10 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-ink/10 rounded-full" />
                <div className="h-3 w-1/2 bg-ink/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured products skeleton */}
      <div className="section-container py-12 md:py-16">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div className="space-y-3">
            <div className="h-4 w-28 bg-ink/5 rounded-full animate-pulse" />
            <div className="h-9 w-52 bg-ink/5 rounded-2xl animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-ink/5 rounded-xl animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-52 md:w-64">
              <div className="aspect-[4/5] bg-ink/5 rounded-2xl mb-4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-1/3 bg-ink/5 rounded-full animate-pulse" />
                <div className="h-5 w-3/4 bg-ink/5 rounded-full animate-pulse" />
                <div className="h-5 w-1/2 bg-ink/5 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
