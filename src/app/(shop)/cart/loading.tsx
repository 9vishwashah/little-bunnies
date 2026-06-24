export default function CartLoading() {
  return (
    <div className="section-container py-10 pt-24 md:pt-32 min-h-screen">
      <div className="h-10 w-32 bg-ink/5 rounded-2xl animate-pulse mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-ink/5 animate-pulse">
              <div className="w-24 h-24 rounded-xl bg-ink/10 flex-shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-5 w-3/4 bg-ink/10 rounded-full" />
                <div className="h-4 w-1/3 bg-ink/10 rounded-full" />
                <div className="h-8 w-28 bg-ink/10 rounded-xl" />
              </div>
              <div className="h-6 w-16 bg-ink/10 rounded-full" />
            </div>
          ))}
        </div>
        {/* Order summary */}
        <div className="space-y-4 p-6 rounded-2xl bg-ink/5 animate-pulse h-fit">
          <div className="h-7 w-40 bg-ink/10 rounded-full" />
          <div className="space-y-3 py-4 border-t border-ink/10">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 bg-ink/10 rounded-full" />
                <div className="h-4 w-16 bg-ink/10 rounded-full" />
              </div>
            ))}
          </div>
          <div className="h-12 w-full bg-ink/10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
