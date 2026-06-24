"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";

export default function PromoBanner() {
  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="section-container">
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-peach-light/80 to-peach/80 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between">
          
          {/* Decorative Elements */}
          <Sparkles className="absolute top-8 left-8 text-white opacity-60" size={32} />
          <Sparkles className="absolute bottom-8 right-[40%] text-white opacity-60" size={24} />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center text-center md:items-start md:text-left mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-ink mb-4 leading-tight">
              Crafted for <br className="hidden md:block" />
              little luxuries.
            </h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {["Care & Comfort", "Premium Quality", "Safe for Baby", "Made with Love"].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-4 py-1.5 rounded-pill bg-white/70 text-ink text-sm font-semibold shadow-soft-sm border border-ink/10"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link 
              href="/products?sale=true"
              className="group inline-flex items-center gap-2 bg-sky-brand-dark hover:bg-sky-brand-dark/90 text-white px-6 py-3 rounded-pill font-bold transition-all shadow-soft"
            >
              Shop Deals
              <div className="bg-white text-sky-brand-dark rounded-full p-0.5 group-hover:translate-x-1 transition-transform">
                <ChevronRight size={16} strokeWidth={3} />
              </div>
            </Link>
          </div>

          {/* Graphic / Image Area Placeholder */}
          <div className="relative z-10 w-full md:w-1/2 h-64 md:h-80 bg-white/40 rounded-2xl border-2 border-dashed border-white flex flex-col items-center justify-center text-ink/40">
            <span className="font-bold text-lg">Product Showcase Image</span>
            <span className="text-sm">(Drop your transparent PNGs here)</span>
            
            {/* Limited Time Offer Badge */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-sage-dark text-white rounded-full flex flex-col items-center justify-center rotate-12 shadow-soft-lg border-4 border-white">
              <span className="text-sm font-bold leading-tight text-center">Limited<br/>Time<br/>Offer!</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
