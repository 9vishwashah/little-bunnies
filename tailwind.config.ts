import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FBF8F3",
          dark: "#F0EBE0",
          darker: "#E8DDD0",
        },
        sky: {
          brand: "#DDE8F5",
          "brand-dark": "#B8D1ED",
        },
        sage: {
          DEFAULT: "#B9C9A8",
          dark: "#8FAD78",
          light: "#D4E0C8",
        },
        blush: {
          DEFAULT: "#E8A7AF",
          dark: "#D47F8A",
          light: "#F2CDD1",
        },
        peach: {
          DEFAULT: "#F7BE82",
          dark: "#E8A055",
          light: "#FBDCB4",
        },
        lavender: {
          brand: "#C6B5E3",
          "brand-dark": "#A592CF",
          "brand-light": "#DDD4F0",
        },
        ink: {
          DEFAULT: "#24324A",
          light: "#3D526B",
          muted: "#6B7E96",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "Nunito", "sans-serif"],
        display: ["var(--font-playfair)", "Playfair Display", "serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        brand: "1.25rem",
        card: "1rem",
        pill: "9999px",
        inherit: "inherit",
      },
      boxShadow: {
        "soft-sm": "0 2px 8px rgba(36, 50, 74, 0.06)",
        soft: "0 4px 16px rgba(36, 50, 74, 0.08)",
        "soft-lg": "0 8px 32px rgba(36, 50, 74, 0.10)",
        "soft-xl": "0 16px 48px rgba(36, 50, 74, 0.12)",
        card: "0 2px 12px rgba(36, 50, 74, 0.06), 0 1px 4px rgba(36, 50, 74, 0.04)",
        "card-hover": "0 8px 28px rgba(36, 50, 74, 0.12), 0 2px 8px rgba(36, 50, 74, 0.06)",
      },
      backgroundImage: {
        "cream-gradient": "linear-gradient(135deg, #FBF8F3 0%, #F0EBE0 100%)",
        "sky-gradient": "linear-gradient(135deg, #DDE8F5 0%, #B8D1ED 100%)",
        "sage-gradient": "linear-gradient(135deg, #D4E0C8 0%, #B9C9A8 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        marquee: "marquee 25s linear infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
      },
      screens: {
        xs: "375px",
        sm: "480px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            color: theme("colors.ink.light"),
            a: {
              color: theme("colors.sage.dark"),
              "&:hover": {
                color: theme("colors.ink.DEFAULT"),
              },
            },
            h1: { color: theme("colors.ink.DEFAULT"), fontFamily: theme("fontFamily.display").join(",") },
            h2: { color: theme("colors.ink.DEFAULT"), fontFamily: theme("fontFamily.display").join(",") },
            h3: { color: theme("colors.ink.DEFAULT"), fontFamily: theme("fontFamily.display").join(",") },
            h4: { color: theme("colors.ink.DEFAULT") },
            strong: { color: theme("colors.ink.DEFAULT") },
            blockquote: {
              borderLeftColor: theme("colors.sage.DEFAULT"),
              color: theme("colors.ink.muted"),
            },
            hr: { borderColor: theme("colors.cream.darker") },
            "ul > li::marker": { color: theme("colors.sage.dark") },
            "ol > li::marker": { color: theme("colors.ink.muted") },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
