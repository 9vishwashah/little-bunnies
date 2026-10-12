import Link from "next/link";

/**
 * Crawlable, human-readable introduction to the brand and its two product
 * lines. The homepage was previously almost all imagery and carousels with
 * no text telling search engines (or new visitors) what Little Bunnies
 * actually is — this block names the brand, the product types people search
 * for, and links straight to the two landing pages meant to rank for them.
 */
export default function HomeSeoContent() {
  return (
    <section className="py-12 md:py-20 bg-white" aria-labelledby="about-little-bunnies">
      <div className="section-container max-w-4xl mx-auto">
        <h2
          id="about-little-bunnies"
          className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-5 text-center"
        >
          Baby Strollers, Prams &amp; Diaper Bags by Little Bunnies
        </h2>

        <div className="space-y-4 text-ink-light text-sm md:text-base leading-relaxed">
          <p>
            Little Bunnies makes lightweight <strong>baby strollers and prams</strong> and practical{" "}
            <strong>diaper bags</strong> for parents who are always on the move. Our stroller range
            includes 360° rotating reversible-seat strollers like the <strong>Comfy Rider</strong> and{" "}
            <strong>Cocoon</strong>, compact travel strollers such as the <strong>Eco Pro</strong>{" "}
            (just 5.3 kg) and the <strong>Cabin Stroller</strong>, the <strong>Urban Glider</strong>{" "}
            reversible stroller, a <strong>twin stroller</strong> for two babies, and a{" "}
            <strong>new born stroller</strong> with a reversible handle and rocking mode.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <Link
              href="/prams-strollers"
              className="block rounded-2xl bg-cream p-5 border border-ink/5 hover:shadow-soft transition-shadow"
            >
              <h3 className="font-display font-bold text-ink text-lg mb-1">Prams &amp; Strollers →</h3>
              <p className="text-sm text-ink-light">
                Newborn-friendly recline, reversible seats, UV canopies and compact folds for car
                boots and airplane travel.
              </p>
            </Link>
            <Link
              href="/diaper-bags"
              className="block rounded-2xl bg-cream p-5 border border-ink/5 hover:shadow-soft transition-shadow"
            >
              <h3 className="font-display font-bold text-ink text-lg mb-1">Diaper Bags →</h3>
              <p className="text-sm text-ink-light">
                Water-resistant diaper backpacks with insulated bottle pockets, wet &amp; dry
                compartments and stroller straps.
              </p>
            </Link>
          </div>

          <h3 className="font-display font-bold text-ink text-xl pt-4">Which stroller is right for your baby?</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Newborns:</strong> choose a reversible seat with a deep recline so your baby
              can face you — the Comfy Rider, Cocoon and Urban Glider are built for this.
            </li>
            <li>
              <strong>Travel &amp; flights:</strong> the Eco Pro and Cabin Stroller fold compactly
              for airplane cabins and small car boots.
            </li>
            <li>
              <strong>Two little ones:</strong> the Twin Stroller has independently reclining seats
              and an XL canopy.
            </li>
          </ul>

          <p className="pt-2">
            Little Bunnies is a brand of Little Bunnies Creations LLP. Order directly on
            littlebunnies.co.in with secure checkout by card, UPI or net banking, free shipping above
            ₹5,999 and a 15-day exchange policy. Selected stroller models are also available on
            Amazon.in.
          </p>
        </div>
      </div>
    </section>
  );
}
