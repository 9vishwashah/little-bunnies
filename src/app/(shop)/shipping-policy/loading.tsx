// Generic page skeleton - shows immediately while server renders content
export default function PageLoading() {
  return (
    <div className="section-container py-10 pt-24 md:pt-32 min-h-screen">
      <div className="text-center mb-12 space-y-4">
        <div className="h-4 w-24 bg-ink/5 rounded-full animate-pulse mx-auto" />
        <div className="h-12 w-72 md:w-96 bg-ink/5 rounded-2xl animate-pulse mx-auto" />
        <div className="h-4 w-64 bg-ink/5 rounded-full animate-pulse mx-auto" />
      </div>
      <div className="max-w-3xl mx-auto space-y-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-1/3 bg-ink/5 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-ink/5 rounded-full animate-pulse" />
              <div className="h-4 w-full bg-ink/5 rounded-full animate-pulse" />
              <div className="h-4 w-4/5 bg-ink/5 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}