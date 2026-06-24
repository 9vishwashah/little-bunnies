export default function CheckoutLoading() {
  return (
    <div className="section-container py-10 pt-24 md:pt-32 min-h-screen">
      <div className="h-10 w-40 bg-ink/5 rounded-2xl animate-pulse mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Form skeleton */}
        <div className="space-y-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-ink/5 rounded-full animate-pulse" />
              <div className="h-12 w-full bg-ink/5 rounded-xl animate-pulse" />
            </div>
          ))}
          <div className="h-14 w-full bg-ink/5 rounded-2xl animate-pulse mt-4" />
        </div>
        {/* Order summary skeleton */}
        <div className="space-y-4 p-6 rounded-2xl bg-ink/5 animate-pulse h-fit">
          <div className="h-7 w-40 bg-ink/10 rounded-full mb-4" />
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-ink/10 flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 bg-ink/10 rounded-full" />
                <div className="h-4 w-1/3 bg-ink/10 rounded-full" />
              </div>
            </div>
          ))}
          <div className="border-t border-ink/10 pt-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 bg-ink/10 rounded-full" />
                <div className="h-4 w-16 bg-ink/10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
