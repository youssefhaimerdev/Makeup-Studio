/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif:   ["Playfair Display", "Georgia", "serif"],
        sans:    ["DM Sans", "system-ui", "-apple-system", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      colors: {
        rose: {
          50:  "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
        },
        nude: {
          50:  "#faf7f4",
          100: "#f2ece5",
          200: "#e3d5c5",
          300: "#d4bfa5",
          400: "#c4a882",
          500: "#a88c65",
          600: "#8f7252",
          700: "#6b5540",
          800: "#4d3c28",
          900: "#2e2218",
        },
        blush: {
          50:  "#fdf4f0",
          100: "#fbe8de",
          200: "#f6cdb5",
          400: "#e8956a",
          600: "#c4622c",
        },
        mauve: {
          50:  "#f8f2f7",
          100: "#f0e3ed",
          200: "#dfc0d8",
          400: "#b87aaa",
          600: "#7d3f71",
          800: "#4a2142",
        },
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px #fecdd3" },
          "50%":      { boxShadow: "0 0 40px #fb7185, 0 0 80px #fecdd3" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        orb: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%":      { transform: "translate(30px,-20px) scale(1.08)" },
          "66%":      { transform: "translate(-20px,15px) scale(0.94)" },
        },
      },
      animation: {
        "fade-up":        "fadeUp 0.7s ease-out both",
        "fade-up-slow":   "fadeUp 0.9s ease-out both",
        "fade-in":        "fadeIn 0.6s ease-out both",
        "float":          "float 4s ease-in-out infinite",
        "float-delayed":  "float 4s ease-in-out 1.5s infinite",
        "float-slow":     "float 6s ease-in-out 0.8s infinite",
        "shimmer":        "shimmer 3s linear infinite",
        "pulse-glow":     "pulseGlow 2.5s ease-in-out infinite",
        "slide-left":     "slideInLeft 0.7s ease-out both",
        "slide-right":    "slideInRight 0.7s ease-out both",
        "marquee":        "marquee 28s linear infinite",
        "orb":            "orb 8s ease-in-out infinite",
        "orb-alt":        "orb 10s ease-in-out 2s infinite reverse",
      },
      transitionDelay: {
        "100": "100ms",
        "200": "200ms",
        "300": "300ms",
        "400": "400ms",
        "500": "500ms",
        "600": "600ms",
        "700": "700ms",
      },
    },
  },
  plugins: [],
};

