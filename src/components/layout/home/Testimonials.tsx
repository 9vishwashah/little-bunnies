"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The Egg Pram is an absolute dream! It glides so smoothly and the suspension is fantastic — my baby falls asleep within minutes. The premium build quality is obvious the moment you touch it. Worth every rupee!",
    initials: "PS",
    color: "bg-blush/30",
  },
  {
    id: 2,
    name: "Rahul & Sneha",
    location: "Mumbai",
    rating: 5,
    text: "We got the Comfy Rider for our 3-month-old and it's been a game changer for our morning walks. The one-hand fold mechanism is brilliant — I can manage the baby and the pram easily. Super lightweight yet sturdy!",
    initials: "RS",
    color: "bg-sky-brand",
  },
  {
    id: 3,
    name: "Anjali Mehta",
    location: "Mumbai",
    rating: 5,
    text: "The Cocoon pram is everything I wanted for my newborn. The bassinet-style seat is so cosy and the canopy provides amazing sun protection. Assembly was a breeze and the Little Bunnies team was super helpful!",
    initials: "AM",
    color: "bg-sage/30",
  },
  {
    id: 4,
    name: "Vikram Patel",
    location: "Mumbai",
    rating: 5,
    text: "Ordered a diaper bag from Little Bunnies and I'm blown away by the storage. It has separate compartments for bottles, wipes, and clothes. The insulated pockets keep milk warm for hours. Looks stylish too!",
    initials: "VP",
    color: "bg-lavender-brand/30",
  },
];

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
    setActiveIndex((prev) =>
      direction === "left"
        ? Math.max(0, prev - 1)
        : Math.min(TESTIMONIALS.length - 1, prev + 1)
    );
  };

  return (
    <section className="section-spacing">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-xs font-semibold text-sage-dark uppercase tracking-widest mb-3">
            Happy Parents
          </p>
          <h2 className="font-display text-2xl md:text-3xl xl:text-4xl font-bold text-ink">
            What Parents Are Saying
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          >
            {TESTIMONIALS.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`flex-shrink-0 w-[300px] md:w-[340px] p-6 rounded-brand ${review.color} flex flex-col gap-4`}
              >
                {/* Quote icon */}
                <Quote size={24} className="text-ink/20" />

                {/* Stars */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={
                        star <= review.rating
                          ? "text-peach fill-peach"
                          : "text-ink/20 fill-ink/10"
                      }
                    />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-ink-light text-sm leading-relaxed font-medium flex-1">
                  &ldquo;{review.text}&rdquo;
                </p>



                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-ink/8">
                  <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center font-bold text-ink text-sm">
                    {review.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-ink text-sm">{review.name}</p>
                    <p className="text-xs text-ink-muted">{review.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-xl bg-cream-dark hover:bg-sky-brand transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-xl bg-cream-dark hover:bg-sky-brand transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
