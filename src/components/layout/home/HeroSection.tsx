"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Add more image paths here as you get them!
const SLIDES = [
  "/images/littlebunnies-banner1.png",
  "/images/banner2.png",
  "/images/banner3.png",
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-sliding logic
  useEffect(() => {
    if (SLIDES.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 3000); // Slides every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full px-4 md:px-8 pt-2 pb-6">
      {/* Smaller view container with smooth rounded edges */}
      <div className="relative w-full max-w-7xl mx-auto rounded-[2rem] md:rounded-[3rem] overflow-hidden aspect-square sm:aspect-[2/1] lg:aspect-[21/9] shadow-soft-xl bg-sky-brand/10">
        
        {/* Background Image Slider */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image 
              src={SLIDES[currentSlide]}
              alt={`Banner Slide ${currentSlide + 1}`}
              fill
              className="object-cover object-[75%_center] sm:object-center"
              priority={currentSlide === 0}
            />
            {/* Gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent sm:from-white/90 sm:via-white/50" />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-16 lg:px-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-xl"
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-pill bg-white shadow-soft-sm mb-4 sm:mb-6">
              <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-peach fill-peach" />
              <span className="text-[10px] sm:text-xs font-bold text-ink-light tracking-wide">
                Everything for your little one
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-black text-ink leading-[1.1] mb-3 drop-shadow-sm tracking-tight">
              Joy for Every <br />
              <span>
                <span className="text-sage-dark">L</span>
                <span className="text-sage">i</span>
                <span className="text-peach">t</span>
                <span className="text-peach-dark">t</span>
                <span className="text-ink-light">l</span>
                <span className="text-ink">e</span>
              </span> One!
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-ink-muted mb-6 max-w-md font-medium">
              Premium baby essentials, toys & more handpicked with love for your baby.
            </p>

            <Link 
              href="/products"
              className="group inline-flex items-center gap-3 bg-peach hover:bg-peach-dark text-white px-6 py-3 sm:px-8 sm:py-4 rounded-pill font-bold text-base sm:text-lg transition-all shadow-soft hover:shadow-soft-lg hover:-translate-y-1"
            >
              Shop Now
              <div className="bg-white text-peach rounded-full p-1 group-hover:translate-x-1 transition-transform">
                <ChevronRight size={18} strokeWidth={3} />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Slider Dots */}
        {SLIDES.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  currentSlide === index ? "w-8 bg-peach" : "w-2.5 bg-white/60 hover:bg-white"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
