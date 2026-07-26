"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Heart, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import PreOrderModal from "@/components/ui/PreOrderModal";

// Add more image paths here as you get them!
const SLIDES = [
  "/images/littlebunnies-banner1.png",
  "/images/banner2.png",
  "/images/banner3.png",
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);

  // Auto-sliding logic
  useEffect(() => {
    if (SLIDES.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 3000); // Slides every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
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
                sizes="100vw"
                className="object-cover object-[75%_center] sm:object-center"
                priority={currentSlide === 0}
                unoptimized
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
              <div className="inline-flex items-center gap-2.5 sm:gap-3 px-6 py-2 sm:px-10 sm:py-2.5 rounded-pill bg-white shadow-soft mb-4 sm:mb-6">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-peach fill-peach" />
                <span className="text-xs sm:text-sm font-extrabold text-ink-light tracking-wider uppercase sm:tracking-widest">
                  Crafted with love
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-black text-ink leading-[1.1] mb-6 drop-shadow-sm tracking-tight">
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

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsPreOrderOpen(true)}
                  className="group inline-flex items-center gap-2 sm:gap-3 min-h-[38px] sm:min-h-[44px] bg-peach hover:bg-peach-dark text-white px-4 py-2 sm:px-8 sm:py-4 rounded-pill font-bold text-xs sm:text-lg transition-all shadow-soft hover:shadow-soft-lg hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 w-fit self-start"
                >
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  <span>Pre-Order Now</span>
                  <div className="bg-white text-peach rounded-full p-0.5 sm:p-1 group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4 lg:h-4" strokeWidth={3} />
                  </div>
                </button>
              </div>
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

      <PreOrderModal
        isOpen={isPreOrderOpen}
        onClose={() => setIsPreOrderOpen(false)}
        productName=""
        productPrice=""
      />
    </>
  );
}
