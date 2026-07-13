/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Inter Tight",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#000000",
          900: "#111827",
        },
        accent: {
          DEFAULT: "#1B8DB9",
          400: "#3AA9D3",
          500: "#1B8DB9",
          600: "#12678C",
          navy: "#0E3A5C",
        },
        muted: "#7C8A9A",
      },
      backgroundImage: {
        "accent-gradient":
          "linear-gradient(135deg, #0E3A5C 0%, #1B8DB9 55%, #3AA9D3 100%)",
        "mesh-light":
          "radial-gradient(60% 60% at 50% 0%, rgba(27,141,185,0.10) 0%, rgba(255,255,255,0) 70%)",
        "mesh-dark":
          "radial-gradient(70% 60% at 50% 0%, rgba(27,141,185,0.16) 0%, rgba(0,0,0,0) 70%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(6, 14, 22, 0.35)",
        "glass-lg": "0 24px 64px rgba(6, 14, 22, 0.45)",
        glow: "0 0 60px rgba(27, 141, 185, 0.45)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "pulse-glow": {
          "0%,100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "spin-slow": "spin-slow 40s linear infinite",
      },
    },
  },
  plugins: [],
};
