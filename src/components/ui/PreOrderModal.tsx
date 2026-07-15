"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle, Phone, User, MessageSquare, ShoppingBag } from "lucide-react";

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productPrice: string;
  productImage?: string;
}

export default function PreOrderModal({
  isOpen,
  onClose,
  productName,
  productPrice,
  productImage,
}: PreOrderModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<{name: string, price: number}[]>([]);
  const [selectedProduct, setSelectedProduct] = useState(productName || "");

  useEffect(() => {
    if (productName) setSelectedProduct(productName);
  }, [productName]);

  useEffect(() => {
    fetch("/api/products?limit=50")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);

    // Simulate a short delay for UX polish
    await new Promise((res) => setTimeout(res, 900));

    const activeProduct = selectedProduct || productName || "General Pre-Order";

    // Build WhatsApp message for business owner
    const msg = encodeURIComponent(
      `🐰 *New Pre-Order Interest!*\n\n` +
        `*Product:* ${activeProduct}\n` +
        (productPrice ? `*Price:* ${productPrice}\n` : "") +
        `*Name:* ${name}\n` +
        `*Phone:* ${phone}\n` +
        (note ? `*Note:* ${note}\n` : "") +
        `\n_Submitted via Little Bunnies Pre-Order_`
    );

    const waUrl = `https://wa.me/918976077070?text=${msg}`;

    setLoading(false);
    setSubmitted(true);

    // Open WhatsApp after short delay
    setTimeout(() => {
      window.open(waUrl, "_blank");
    }, 1200);
  };

  const handleClose = () => {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setPhone("");
      setNote("");
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            onClick={handleClose}
          >
            <div
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-peach via-peach-dark to-sage" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-cream-dark hover:bg-cream-darker transition-colors z-10"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="p-6 md:p-8">
                {!submitted ? (
                  <>
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                      {productImage && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-peach/10 mb-2">
                          <Clock size={12} className="text-peach" />
                          <span className="text-xs font-bold text-peach tracking-wide uppercase">
                            Pre-Order
                          </span>
                        </div>
                        <h2 className="font-display font-bold text-ink text-lg leading-snug line-clamp-2">
                          {productName}
                        </h2>
                        <p className="text-sm font-semibold text-peach mt-0.5">
                          {productPrice}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-ink-muted font-medium mb-6 leading-relaxed">
                      Register your interest! We'll contact you as soon as this product is ready to order. No payment required now.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Product Selection */}
                      <div>
                        <label className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5 block">
                          Select Product <span className="text-blush-dark">*</span>
                        </label>
                        <div className="relative">
                          <ShoppingBag
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
                          />
                          <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            required
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-ink/10 bg-cream/50 text-ink text-sm font-medium outline-none focus:border-peach focus:ring-2 focus:ring-peach/20 transition-all appearance-none"
                          >
                            <option value="" disabled>Select a product to pre-order</option>
                            {productName && !products.find(p => p.name === productName) && (
                              <option value={productName}>{productName}</option>
                            )}
                            {products.map((p, i) => (
                              <option key={i} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5 block">
                          Your Name
                        </label>
                        <div className="relative">
                          <User
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                          />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 bg-cream/50 text-ink text-sm font-medium placeholder:text-ink-muted/60 outline-none focus:border-peach focus:ring-2 focus:ring-peach/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5 block">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                          />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 bg-cream/50 text-ink text-sm font-medium placeholder:text-ink-muted/60 outline-none focus:border-peach focus:ring-2 focus:ring-peach/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Optional note */}
                      <div>
                        <label className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5 block">
                          Message{" "}
                          <span className="font-normal normal-case">(optional)</span>
                        </label>
                        <div className="relative">
                          <MessageSquare
                            size={16}
                            className="absolute left-3.5 top-3.5 text-ink-muted"
                          />
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Any specific requirements or questions?"
                            rows={2}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 bg-cream/50 text-ink text-sm font-medium placeholder:text-ink-muted/60 outline-none focus:border-peach focus:ring-2 focus:ring-peach/20 transition-all resize-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !name.trim() || !phone.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-peach hover:bg-peach-dark text-white font-bold py-3.5 rounded-pill text-sm transition-all hover:shadow-soft-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin w-4 h-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                            Submitting…
                          </>
                        ) : (
                          <>
                            <Clock size={15} />
                            Register Interest via WhatsApp
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-ink-muted font-medium">
                        We'll reach out on WhatsApp. No spam, ever. 🐰
                      </p>
                    </form>
                  </>
                ) : (
                  /* Success state */
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 14, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-sage/15 flex items-center justify-center mb-5"
                    >
                      <CheckCircle size={40} className="text-sage-dark" />
                    </motion.div>
                    <h2 className="font-display font-bold text-ink text-xl mb-2">
                      You're on the list! 🎉
                    </h2>
                    <p className="text-ink-muted font-medium text-sm leading-relaxed mb-6">
                      Thanks <strong className="text-ink">{name}</strong>! We've noted your interest in{" "}
                      <strong className="text-ink">{selectedProduct || productName}</strong>. Opening WhatsApp now to connect you with us!
                    </p>
                    <button
                      onClick={handleClose}
                      className="btn-primary text-sm"
                    >
                      Continue Shopping
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
