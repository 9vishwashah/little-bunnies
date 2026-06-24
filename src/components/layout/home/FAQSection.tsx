"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "1. What products does Little Bunnies offer?",
    answer: "Little Bunnies offers a carefully curated collection of baby essentials including prams, strollers, diaper bags, feeding accessories, baby care products, nursery essentials, toys, clothing, and more for newborns and growing babies."
  },
  {
    question: "2. Are your products safe for newborn babies?",
    answer: "Yes. We prioritize baby-safe materials and partner with trusted manufacturers. Product safety information and age recommendations are clearly mentioned on each product page."
  },
  {
    question: "3. How long does shipping take?",
    answer: "Most orders are dispatched within 24–48 hours and typically delivered within 3–7 business days depending on your location."
  },
  {
    question: "4. Do you offer Cash on Delivery (COD)?",
    answer: "Yes, Cash on Delivery is available on selected products and serviceable pin codes."
  },
  {
    question: "5. Can I return or exchange a product?",
    answer: "Yes. We offer easy returns and exchanges for eligible products within the specified return window. Please refer to our Return Policy for complete details."
  },
  {
    question: "6. How can I track my order?",
    answer: "Once your order is shipped, you will receive a tracking link via SMS and email. You can also track your order from the My Account section."
  },
  {
    question: "7. Are the product images shown on the website accurate?",
    answer: "We strive to display products as accurately as possible. However, slight color variations may occur due to lighting conditions and screen settings."
  },
  {
    question: "8. Do you provide warranty on baby gear products?",
    answer: "Yes. Selected products such as strollers, prams, and baby gear may include manufacturer warranties. Warranty information is available on the respective product pages."
  },
  {
    question: "9. How do I choose the right product for my baby?",
    answer: "Each product includes detailed descriptions, specifications, age recommendations, and usage guidelines to help parents make informed decisions."
  },
  {
    question: "10. What payment methods do you accept?",
    answer: "We accept:\n\n- UPI\n- Credit Cards\n- Debit Cards\n- Net Banking\n- Wallets\n- Cash on Delivery (where applicable)"
  },
  {
    question: "11. Can I cancel my order after placing it?",
    answer: "Orders can be cancelled before they are shipped. Once dispatched, cancellations may not be possible."
  },
  {
    question: "12. How can I contact customer support?",
    answer: "You can reach us through:\n\n- WhatsApp Support\n- Email Support\n- Contact Form\n- Phone Support\n\nOur team is happy to assist you with any queries."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-cream relative overflow-hidden">
      <div className="section-container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-ink mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-ink-light">
            Everything you need to know about our products, shipping, and returns.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={cn(
                  "bg-white rounded-2xl border transition-all duration-300",
                  isOpen ? "border-ink/20 shadow-soft" : "border-ink/5"
                )}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex items-center justify-between w-full p-5 md:p-6 text-left"
                >
                  <span className="font-semibold text-ink md:text-lg">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={cn(
                      "text-ink-muted transition-transform duration-300 flex-shrink-0 ml-4",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 text-ink-light leading-relaxed whitespace-pre-wrap">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
