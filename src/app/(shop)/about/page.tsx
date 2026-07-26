import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="section-container py-12 md:py-20 flex flex-col items-center relative overflow-hidden min-h-screen">
      {/* Background Watermark */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none w-[150vw] h-[150vh] max-w-[1200px] max-h-[1200px] z-0 flex items-center justify-center">
        <Image 
          src="/images/only-bunny-removebg-preview.png" 
          alt="Little Bunny Watermark"
          fill
          sizes="150vw"
          className="object-contain"
          priority
        />
      </div>

      <div className="text-center mb-10 z-10 relative">
        <h1 className="text-5xl md:text-6xl font-display font-black text-ink mb-4 drop-shadow-sm tracking-tight flex items-center justify-center gap-3 md:gap-4">
          About Us
          <div className="relative w-12 h-12 md:w-16 md:h-16">
            <Image
              src="/images/only-bunny-removebg-preview.png"
              alt="Little Bunny Icon"
              fill
              sizes="64px"
              className="object-contain opacity-90"
            />
          </div>
        </h1>
        <div className="w-24 h-1.5 bg-peach mx-auto rounded-full shadow-sm"></div>
      </div>

      {/* Card - Narrow width, lengthy */}
      <div className="bg-white/85 backdrop-blur-xl p-8 md:p-12 lg:p-16 rounded-[2.5rem] shadow-soft-xl max-w-2xl w-full relative z-10 border border-ink/5">
        
        <div className="prose prose-lg text-ink-light space-y-8 max-w-none">
          
          <section>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-ink mb-6 text-center leading-tight">
              The Story of Little Bunnies:<br className="hidden md:block" /> Where Comfort Meets Wonder
            </h2>
            <p className="leading-relaxed">
              Once upon a time, in a world that often moves a little too fast, a simple idea was born: childhood should be a place of soft edges, quiet wonders, and gentle comfort.
            </p>
            <p className="leading-relaxed">
              The story of Little Bunnies began not in a corporate boardroom, but in a sunlit nursery. It started with a parent watching their little one sleep, realizing that the moments that truly matter are the quiet ones—the soft touch of a favorite blanket, the gentle lull of a bedtime story, and the pure, innocent curiosity of a child exploring their world for the very first time.
            </p>
            <p className="leading-relaxed font-semibold text-ink text-lg mt-6 bg-cream/50 p-6 rounded-2xl border border-ink/5">
              We wanted to create a brand that felt like a warm hug. A brand that didn't just make products, but created keepsakes.
            </p>
          </section>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-ink/10 to-transparent my-10"></div>

          <section>
            <h2 className="text-2xl font-display font-bold text-ink mb-6 text-center">
              The Meaning Behind Our Look
            </h2>
            <p className="leading-relaxed mb-8 text-center text-ink-muted">
              Every detail of our name and logo is a piece of our heart:
            </p>
            
            <div className="space-y-8">
              <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-peach before:rounded-full">
                <h3 className="font-bold text-peach-dark text-xl mb-2">The Little Bunny</h3>
                <p className="leading-relaxed">
                  Symbolizes innocence, playfulness, and the gentle nature of childhood. Just like a little bunny hopping through a meadow, every child deserves a world where they can explore safely and joyfully.
                </p>
              </div>
              
              <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-sage before:rounded-full">
                <h3 className="font-bold text-sage-dark text-xl mb-2">Our Color Palette</h3>
                <p className="leading-relaxed">
                  We purposely chose soft, muted earthy tones—sage greens, dusty blues, warm terracottas, and gentle creams. These colors reflect the natural world and bring a sense of calm, peace, and serenity into your home.
                </p>
              </div>

              <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-ink-light before:rounded-full">
                <h3 className="font-bold text-ink text-xl mb-2">The Lavender & Wildflowers</h3>
                <p className="leading-relaxed">
                  A nod to nature, growth, and the soothing scents of bedtime. It’s a reminder of the beauty in simple things.
                </p>
              </div>
            </div>
          </section>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-ink/10 to-transparent my-10"></div>

          <section className="text-center">
            <h2 className="text-2xl font-display font-bold text-ink mb-6">
              Our Promise
            </h2>
            <p className="leading-relaxed mb-6">
              At Little Bunnies, we believe that the items surrounding your children should be crafted with love, kindness, and the utmost care. We curate and create with a dedication to quality, sustainability, and timeless design.
            </p>
            <p className="leading-relaxed mb-10">
              We aren't just building a brand; we are building a family. Thank you for letting us be a small part of your little bunny's journey.
            </p>
            
            <div className="inline-block relative">
              <div className="absolute -inset-4 bg-peach/10 blur-xl rounded-full z-0"></div>
              <h3 className="text-3xl md:text-4xl font-display font-black text-peach-dark italic relative z-10 px-6 py-2">
                Welcome To Our Burrow
              </h3>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
