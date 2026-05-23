/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0B0F",
        surface: "#12141A",
        border: "#1E2130",
        primary: {
          DEFAULT: "#4F6EF7",
          hover: "#3B56D9",
        },
        success: {
          DEFAULT: "#00D4AA",
          hover: "#00B08F",
        },
        warning: {
          DEFAULT: "#F5A623",
          hover: "#DB9219",
        },
        danger: {
          DEFAULT: "#E8453C",
          hover: "#C9362D",
        },
        text: {
          primary: "#E8EAF0",
          muted: "#636B85",
        }
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 15px 0 rgba(79, 110, 247, 0.15)",
        "glow-success": "0 0 15px 0 rgba(0, 212, 170, 0.15)",
        "glow-warning": "0 0 15px 0 rgba(245, 166, 35, 0.15)",
        "glow-danger": "0 0 15px 0 rgba(232, 69, 60, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.3s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
}
