import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0a0a0f", 50: "#f4f4f6", 100: "#e8e8ed", 200: "#c4c4d0", 300: "#9898ab", 400: "#6b6b82", 500: "#4a4a5e", 600: "#35354a", 700: "#252536", 800: "#161622", 900: "#0a0a0f" },
        accent: { DEFAULT: "#6366f1", light: "#818cf8", dark: "#4f46e5", glow: "rgba(99,102,241,0.15)" },
        gold: { DEFAULT: "#d4a574", light: "#e8c9a0" },
        surface: { DEFAULT: "#12121a", raised: "#1a1a26", overlay: "#22222f" },
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.25), transparent)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%,100%": { opacity: "0.4" }, "50%": { opacity: "0.8" } },
      },
    },
  },
  plugins: [],
};
export default config;
