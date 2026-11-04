import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ceylon: {
          night: "#022c22", // deepest emerald
          deep: "#064e3b", // deep emerald
          gold: "#d97706", // luxe gold
          glow: "#fbbf24", // gold highlight
          ink: "#0f172a", // dark slate
          mist: "#f8fafc", // crisp light surface
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      keyframes: {
        // Branded preloader (src/app/loading.tsx)
        "loader-sweep": {
          "0%": { transform: "translateX(-110%)" },
          "100%": { transform: "translateX(310%)" },
        },
        "loader-breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        "loader-rise": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "loader-sweep": "loader-sweep 1.5s ease-in-out infinite",
        "loader-breathe": "loader-breathe 2.2s ease-in-out infinite",
        "loader-rise": "loader-rise 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
