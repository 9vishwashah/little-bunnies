export default function ProductsLoading() {
  return (
    <div className="section-container py-3 md:py-5 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
        <div className="space-y-4">
          <div className="h-4 w-24 bg-ink/5 rounded-full animate-pulse" />
          <div className="h-10 w-64 md:w-96 bg-ink/5 rounded-2xl animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-12 w-32 bg-ink/5 rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="group relative">
            <div className="aspect-[4/5] bg-ink/5 rounded-2xl mb-4 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 w-1/3 bg-ink/5 rounded-full animate-pulse" />
              <div className="h-5 w-3/4 bg-ink/5 rounded-full animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 bg-ink/5 rounded-full animate-pulse" />
                <div className="h-4 w-12 bg-ink/5 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
