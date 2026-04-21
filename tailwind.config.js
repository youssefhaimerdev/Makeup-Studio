/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        rose: {
          50: "#fff1f2",
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
          50: "#faf7f4",
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
          50: "#fdf4f0",
          100: "#fbe8de",
          200: "#f6cdb5",
          400: "#e8956a",
          600: "#c4622c",
        },
        mauve: {
          50: "#f8f2f7",
          100: "#f0e3ed",
          200: "#dfc0d8",
          400: "#b87aaa",
          600: "#7d3f71",
          800: "#4a2142",
        },
      },
    },
  },
  plugins: [],
};
