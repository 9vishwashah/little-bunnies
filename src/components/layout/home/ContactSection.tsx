"use client";

import { useState } from "react";

const WEB3FORMS_KEY = "320b89a4-0fe3-474a-a848-a2f415284ec5";

export default function ContactSection() {
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
        setErrorMessage(data.message || "Failed to submit. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please WhatsApp us at +91 97252 52421.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="section-container relative z-10 max-w-4xl mx-auto">
        <div className="bg-sage-light/20 rounded-[2.5rem] p-8 md:p-12 border border-sage-brand/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-ink mb-4">
                Contact Us
              </h2>
              <p className="text-ink-light mb-8">
                Have a question or need help? Send us a message and our team will get back to you within 24 hours.
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-ink mb-1">WhatsApp &amp; Call</h4>
                  <p className="text-ink-light">+91 97252 52421</p>
                </div>
                <div>
                  <h4 className="font-semibold text-ink mb-1">Email Support</h4>
                  <p className="text-ink-light">info@littlebunnies.co.in</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-soft">
              {status === "success" ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-sage-light text-sage-dark rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-2">Message Sent!</h3>
                  <p className="text-ink-light">We&apos;ll get back to you shortly.</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-6 text-sm font-semibold text-sage-dark hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="cs-name" className="block text-sm font-semibold text-ink mb-1.5">Full Name</label>
                    <input
                      type="text"
                      id="cs-name"
                      name="name"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream/30 focus:bg-white focus:border-ink/20 focus:ring-2 focus:ring-sage-brand/20 outline-none transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="cs-email" className="block text-sm font-semibold text-ink mb-1.5">Email Address</label>
                    <input
                      type="email"
                      id="cs-email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream/30 focus:bg-white focus:border-ink/20 focus:ring-2 focus:ring-sage-brand/20 outline-none transition-all"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="cs-phone" className="block text-sm font-semibold text-ink mb-1.5">Phone (Optional)</label>
                    <input
                      type="tel"
                      id="cs-phone"
                      name="phone"
                      className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream/30 focus:bg-white focus:border-ink/20 focus:ring-2 focus:ring-sage-brand/20 outline-none transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label htmlFor="cs-message" className="block text-sm font-semibold text-ink mb-1.5">Message</label>
                    <textarea
                      id="cs-message"
                      name="message"
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream/30 focus:bg-white focus:border-ink/20 focus:ring-2 focus:ring-sage-brand/20 outline-none transition-all resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-3.5 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
