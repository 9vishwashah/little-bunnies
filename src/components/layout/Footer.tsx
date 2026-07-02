"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa6";

const FOOTER_LINKS = {
  Shop: [
    { label: "Prams", href: "/products?category=prams" },
    { label: "Diapers", href: "/products?category=diapers" },
    { label: "Bags", href: "/products?category=bags" },
  ],
  Help: [
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Cancellation and Return Policy", href: "/returns" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
  Company: [
    { label: "About Little Bunnies", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact Us", href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-ink text-cream/80">
      {/* Main footer */}
      <div className="section-container py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-10 xl:gap-16">
          {/* Brand column */}
          <div className="xl:col-span-2">
            <Image
              src="/images/logo-full.png"
              alt="Little Bunnies"
              width={200}
              height={70}
              className="h-16 w-auto mb-5 rounded-2xl"
            />
            <p className="text-cream/60 text-sm leading-relaxed max-w-xs font-medium">
              Everything your little one needs, curated with love. Premium baby
              essentials for the precious first months.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {[
                {
                  icon: FaInstagram,
                  href: "https://www.instagram.com/littlebunniesofficial",
                  label: "Instagram",
                  color: "#E1306C",
                  bg: "rgba(225,48,108,0.12)",
                  hoverBg: "rgba(225,48,108,0.22)",
                },
                {
                  icon: FaFacebook,
                  href: "https://www.facebook.com/share/1D5pdMpchM/",
                  label: "Facebook",
                  color: "#1877F2",
                  bg: "rgba(24,119,242,0.12)",
                  hoverBg: "rgba(24,119,242,0.22)",
                },
                {
                  icon: FaLinkedinIn,
                  href: "https://www.linkedin.com/in/little-bunnies-309a84418?utm_source=share_via&utm_content=profile&utm_medium=member_android",
                  label: "LinkedIn",
                  color: "#0A66C2",
                  bg: "rgba(10,102,194,0.12)",
                  hoverBg: "rgba(10,102,194,0.22)",
                },
                {
                  icon: FaWhatsapp,
                  href: "https://wa.me/919725252421",
                  label: "WhatsApp",
                  color: "#25D366",
                  bg: "rgba(37,211,102,0.12)",
                  hoverBg: "rgba(37,211,102,0.22)",
                },
              ].map(({ icon: Icon, href, label, color, bg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110"
                  style={{ background: bg }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = `${color}33`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = bg)
                  }
                >
                  <Icon size={18} style={{ color }} />
                </a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div className="mt-6">
              <a
                href="https://wa.me/919725252421"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-pill bg-[#25D366] text-white text-sm font-bold hover:bg-[#20BA59] transition-colors shadow-soft hover:shadow-soft-lg hover:-translate-y-1"
              >
                <FaWhatsapp size={20} />
                Chat with us
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-cream font-display font-semibold text-base mb-5">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-cream/60 text-sm hover:text-cream transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/10">
        <div className="section-container py-5 flex items-center justify-center gap-3 text-sm text-cream/40 font-medium">
          <p suppressHydrationWarning>© {new Date().getFullYear()} Little Bunnies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
