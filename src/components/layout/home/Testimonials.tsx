"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Aarohi S.",
    location: "Mumbai",
    rating: 4.9,
    ratingDisplay: "4.9/5",
    text: "The stroller feels incredibly premium and is so easy to maneuver. The suspension is smooth, the canopy offers great coverage, and my baby falls asleep within minutes every time we go out.",
    initials: "AS",
    color: "bg-blush/30",
  },
  {
    id: 2,
    name: "Priyanshi M.",
    location: "Mumbai",
    rating: 5,
    ratingDisplay: "5/5",
    text: "We wanted a stroller that looked luxurious without compromising on comfort, and Little Bunnies delivered exactly that. Lightweight, sturdy, and folds effortlessly. Worth every penny.",
    initials: "PM",
    color: "bg-sky-brand",
  },
  {
    id: 3,
    name: "Rohan & Sneha P.",
    location: "Mumbai",
    rating: 5,
    ratingDisplay: "5/5",
    text: "We've used it for shopping malls, airports, and daily walks. Steering is effortless, storage is spacious, and the quality is far better than many expensive international brands.",
    initials: "RP",
    color: "bg-sage/30",
  },
  {
    id: 4,
    name: "Neha K.",
    location: "Mumbai",
    rating: 4.8,
    ratingDisplay: "4.8/5",
    text: "Beautiful finish, premium materials, and extremely comfortable for our newborn. We've received so many compliments on it. Highly recommended for new parents.",
    initials: "NK",
    color: "bg-lavender-brand/30",
  },
  {
    id: 5,
    name: "Shreya V.",
    location: "Mumbai",
    rating: 5,
    ratingDisplay: "5/5",
    text: "Finally, a diaper bag that doesn't look like a diaper bag! Elegant, spacious, and beautifully organized. It fits everything we need while still looking stylish.",
    initials: "SV",
    color: "bg-peach/20",
    bagReview: true,
  },
  {
    id: 6,
    name: "Ankit & Riya D.",
    location: "Mumbai",
    rating: 4.9,
    ratingDisplay: "4.9/5",
    text: "Excellent build quality with plenty of compartments. The insulated bottle pockets are a lifesaver, and the bag matches perfectly with our stroller. Functional and premium in every way.",
    initials: "AD",
    color: "bg-cream-dark",
    bagReview: true,
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

                {/* Stars + rating */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className="text-peach fill-peach"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-ink/60">{review.ratingDisplay}</span>
                  {review.bagReview && (
                    <span className="ml-auto text-xs font-semibold text-ink/50">🎒 Diaper Bag</span>
                  )}
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
