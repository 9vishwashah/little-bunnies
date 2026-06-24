export default function ProductDetailLoading() {
  return (
    <div className="section-container py-10 md:py-16 pt-24 md:pt-32">
      <div className="mb-6 md:mb-8">
        <div className="h-4 w-48 bg-ink/5 rounded-full animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        {/* Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-ink/5 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-5 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-ink/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="flex flex-col pt-2 md:pt-6">
          <div className="h-4 w-32 bg-ink/5 rounded-full mb-4 animate-pulse" />
          <div className="h-10 md:h-12 w-3/4 bg-ink/5 rounded-2xl mb-4 animate-pulse" />
          
          <div className="flex items-center gap-4 mb-6">
            <div className="h-8 w-32 bg-ink/5 rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-ink/5 rounded-full animate-pulse" />
          </div>

          <div className="space-y-3 mb-8">
            <div className="h-4 w-full bg-ink/5 rounded-full animate-pulse" />
            <div className="h-4 w-full bg-ink/5 rounded-full animate-pulse" />
            <div className="h-4 w-2/3 bg-ink/5 rounded-full animate-pulse" />
          </div>

          <div className="h-14 w-full bg-ink/5 rounded-2xl mb-4 animate-pulse" />
          <div className="h-14 w-full bg-ink/5 rounded-2xl mb-8 animate-pulse" />

          <div className="space-y-4 pt-8 border-t border-ink/5">
            <div className="h-6 w-48 bg-ink/5 rounded-full animate-pulse" />
            <div className="h-4 w-full bg-ink/5 rounded-full animate-pulse" />
            <div className="h-4 w-5/6 bg-ink/5 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
