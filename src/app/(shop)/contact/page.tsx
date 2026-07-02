"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Mail, Clock, CheckCircle, Send } from "lucide-react";

const WEB3FORMS_KEY = "320b89a4-0fe3-474a-a848-a2f415284ec5";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      access_key: WEB3FORMS_KEY,
      subject: "New Contact Form Submission — Little Bunnies",
      from_name: formData.get("name") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || "Not provided",
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      message: formData.get("message") as string,
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Failed to send. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again later or email us at info@littlebunnies.co.in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-brand via-cream to-peach-light py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <Mail size={14} className="text-peach-dark" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">We&apos;d Love to Hear From You</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-4">
            Contact Us
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-xl mx-auto font-medium">
            Have a question, need help with an order, or just want to say hello? We&apos;re here for you.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="section-container py-12 md:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left — Info */}
          <div className="lg:col-span-2 space-y-5">
            <a
              href="https://wa.me/919725252421"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 bg-white rounded-brand shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
            >
              <div className="p-3 rounded-xl bg-[#25D366]/10 flex-shrink-0">
                <FaWhatsapp size={22} className="text-[#25D366]" />
              </div>
              <div>
                <h3 className="font-bold text-ink mb-0.5 group-hover:text-[#25D366] transition-colors">WhatsApp Us</h3>
                <p className="text-xs text-ink-muted/70 mt-1">Fastest response — usually within minutes</p>
              </div>
            </a>

            <a
              href="mailto:info@littlebunnies.co.in"
              className="flex items-start gap-4 bg-white rounded-brand shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
            >
              <div className="p-3 rounded-xl bg-peach-light flex-shrink-0">
                <Mail size={22} className="text-peach-dark" />
              </div>
              <div>
                <h3 className="font-bold text-ink mb-0.5 group-hover:text-peach-dark transition-colors">Email</h3>
                <p className="text-ink-muted text-sm">info@littlebunnies.co.in</p>
                <p className="text-xs text-ink-muted/70 mt-1">We reply within 24 hours</p>
              </div>
            </a>

            <div className="flex items-start gap-4 bg-white rounded-brand shadow-card p-5">
              <div className="p-3 rounded-xl bg-sage-light flex-shrink-0">
                <Clock size={22} className="text-sage-dark" />
              </div>
              <div>
                <h3 className="font-bold text-ink mb-0.5">Support Hours</h3>
                <p className="text-ink-muted text-sm">Mon – Sat: 10 AM – 6 PM IST</p>
                <p className="text-xs text-ink-muted/70 mt-1">Closed on national holidays</p>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-3 bg-white rounded-brand shadow-card p-6 md:p-8">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-sage-light rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-sage-dark" />
                </div>
                <h3 className="text-xl font-display font-bold text-ink mb-2">Message Sent!</h3>
                <p className="text-ink-muted text-sm max-w-xs mb-6">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button onClick={() => setStatus("idle")} className="btn-secondary text-sm">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl md:text-2xl font-display font-bold text-ink mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-semibold text-ink mb-1.5">
                        Full Name <span className="text-blush-dark">*</span>
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        required
                        placeholder="Jane Doe"
                        className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream/30 focus:bg-white focus:border-ink/20 focus:ring-2 focus:ring-peach/20 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-semibold text-ink mb-1.5">
                        Phone <span className="text-ink-muted/50 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        id="contact-phone"
                        name="phone"
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream/30 focus:bg-white focus:border-ink/20 focus:ring-2 focus:ring-peach/20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-city" className="block text-sm font-semibold text-ink mb-1.5">
                        City <span className="text-blush-dark">*</span>
                      </label>
                      <input
                        type="text"
                        id="contact-city"
                        name="city"
                        required
                        placeholder="Mumbai"
                        className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream/30 focus:bg-white focus:border-ink/20 focus:ring-2 focus:ring-peach/20 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-state" className="block text-sm font-semibold text-ink mb-1.5">
                        State <span className="text-blush-dark">*</span>
                      </label>
                      <input
                        type="text"
                        id="contact-state"
                        name="state"
                        required
                        placeholder="Maharashtra"
                        className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream/30 focus:bg-white focus:border-ink/20 focus:ring-2 focus:ring-peach/20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-semibold text-ink mb-1.5">
                      Email Address <span className="text-blush-dark">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      required
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream/30 focus:bg-white focus:border-ink/20 focus:ring-2 focus:ring-peach/20 outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-semibold text-ink mb-1.5">
                      Message <span className="text-blush-dark">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream/30 focus:bg-white focus:border-ink/20 focus:ring-2 focus:ring-peach/20 outline-none transition-all resize-none text-sm"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
