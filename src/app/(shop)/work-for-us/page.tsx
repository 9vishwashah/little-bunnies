"use client";

import { useState } from "react";
import { Users, CheckCircle, Send } from "lucide-react";

const WEB3FORMS_KEY = "320b89a4-0fe3-474a-a848-a2f415284ec5";

export default function WorkForUsPage() {
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
      subject: "New Job Application — Little Bunnies",
      from_name: formData.get("name") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
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
      setErrorMessage("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-peach-light via-cream to-sky-brand py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <Users size={14} className="text-peach-dark" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Join Our Team</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-4">
            Work For Us
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-xl mx-auto font-medium">
            If you have the skills to help grow our brand, send us your CV. We&apos;ll reach out if your profile matches our needs.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="section-container py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-brand shadow-card p-8 md:p-10">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-sage-light rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-sage-dark" />
                </div>
                <h3 className="text-xl font-display font-bold text-ink mb-2">Application Sent!</h3>
                <p className="text-ink-muted text-sm max-w-xs mb-6">
                  Thank you for your interest in joining Little Bunnies. We&apos;ll be in touch if your profile is a great fit.
                </p>
                <button onClick={() => setStatus("idle")} className="btn-secondary text-sm">
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="work-name" className="block text-sm font-semibold text-ink mb-1.5">
                    Name <span className="text-blush-dark">*</span>
                  </label>
                  <input
                    type="text"
                    id="work-name"
                    name="name"
                    required
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream/30 focus:bg-white focus:border-ink/20 focus:ring-2 focus:ring-peach/20 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="work-email" className="block text-sm font-semibold text-ink mb-1.5">
                    Email <span className="text-blush-dark">*</span>
                  </label>
                  <input
                    type="email"
                    id="work-email"
                    name="email"
                    required
                    placeholder="jane@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream/30 focus:bg-white focus:border-ink/20 focus:ring-2 focus:ring-peach/20 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="work-message" className="block text-sm font-semibold text-ink mb-1.5">
                    Message <span className="text-blush-dark">*</span>
                  </label>
                  <textarea
                    id="work-message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us about yourself, your skills, and the role you&#39;re interested in..."
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
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
